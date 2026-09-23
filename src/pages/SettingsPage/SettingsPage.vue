<template>
  <PageContainer>
    <UiPageHeader
      :class="style.header"
      eyebrow="Управление"
      title="Настройки"
    />

    <div :class="style.settingsStack">
      <UiAccordion default-open eyebrow="Внешний вид" title="Интерфейс">
        <div :class="style.controlsCard">
          <label :class="style.field">
            <span>Тема</span>
            <ion-select
              :value="$settingsStore.theme"
              interface="popover"
              @ionChange="updateTheme"
            >
              <ion-select-option value="system">Системная</ion-select-option>
              <ion-select-option value="light">Светлая</ion-select-option>
              <ion-select-option value="dark">Темная</ion-select-option>
            </ion-select>
          </label>

          <label :class="style.field">
            <span>Валюта</span>
            <ion-select
              :value="$settingsStore.currency"
              interface="popover"
              @ionChange="updateCurrency"
            >
              <ion-select-option value="RUB">Рубль</ion-select-option>
              <ion-select-option value="USD">Доллар</ion-select-option>
              <ion-select-option value="EUR">Евро</ion-select-option>
            </ion-select>
          </label>
        </div>
      </UiAccordion>

      <UiAccordion eyebrow="Подписки" title="Правила по умолчанию">
        <div :class="style.controlsCard">
          <label :class="style.field">
            <span>Напоминать за</span>
            <ion-input
              :value="$settingsStore.defaultReminderDays"
              inputmode="numeric"
              min="0"
              type="number"
              @ionChange="updateDefaultReminderDays"
            />
          </label>
        </div>
      </UiAccordion>

      <UiAccordion eyebrow="Справочник" title="Категории">
        <template #meta>
          <span :class="style.accordionMeta">{{ categories.length }}</span>
        </template>

        <form :class="style.categoryCreate" @submit.prevent="addCategory">
          <ion-input v-model="newCategoryName" placeholder="Новая категория" />
          <UiButton
            type="submit"
            variant="secondary"
            :disabled="!canAddCategory"
          >
            Добавить
          </UiButton>
        </form>

        <div :class="style.categoryList">
          <article
            v-for="category in categories"
            :key="category.id"
            :class="style.categoryItem"
          >
            <ion-input
              :value="getCategoryDraft(category)"
              @ionInput="updateCategoryDraft(category.id, $event)"
            />

            <div :class="style.categoryActions">
              <UiButton
                variant="soft"
                :disabled="!canSaveCategory(category)"
                @click="saveCategory(category)"
              >
                Сохранить
              </UiButton>

              <UiButton
                variant="dangerSoft"
                @click="requestDeleteCategory(category)"
              >
                {{
                  deletingCategoryId === category.id ? "Подтвердить" : "Удалить"
                }}
              </UiButton>
            </div>
          </article>
        </div>
      </UiAccordion>

      <UiAccordion eyebrow="Резервная копия" title="Данные">
        <div :class="style.dataCard">
          <div :class="style.dataActions">
            <UiButton variant="secondary" @click="exportData">
              Экспорт JSON
            </UiButton>

            <UiButton variant="soft" @click="openImportFile">
              Импорт JSON
            </UiButton>
          </div>

          <input
            ref="importInput"
            accept=".json,application/json,text/json"
            :class="style.hiddenInput"
            type="file"
            @change="importData"
          />

          <div :class="style.dangerZone">
            <div>
              <strong>Очистить данные</strong>
              <span>Удалит подписки и вернет стандартные категории</span>
            </div>

            <UiButton variant="dangerSoft" @click="clearData">
              {{ isClearConfirmationVisible ? "Подтвердить" : "Очистить" }}
            </UiButton>
          </div>
        </div>
      </UiAccordion>

      <p v-if="statusMessage" :class="style.statusMessage">
        {{ statusMessage }}
      </p>
    </div>
  </PageContainer>
</template>

<script lang="ts">
import {
  IonInput,
  IonSelect,
  IonSelectOption,
  type InputCustomEvent,
  type SelectCustomEvent
} from "@ionic/vue";
import {Capacitor} from "@capacitor/core";
import {Directory, Encoding, Filesystem} from "@capacitor/filesystem";
import {defineComponent} from "vue";
import PageContainer from "@/layout/PageContainer/PageContainer.vue";
import {UiAccordion, UiButton, UiPageHeader} from "@/components/ui";
import type {AppCurrency, AppTheme} from "@/stores/settingsStore";
import type {DatabaseSnapshot} from "@/database/repositories/subscription.repository";
import style from "./SettingsPage.module.scss";

type BackupFile = {
  app?: string;
  exportedAt?: string;
  version?: number;
  data?: DatabaseSnapshot;
};

export default defineComponent({
  name: "SettingsPage",
  components: {
    UiAccordion,
    IonInput,
    IonSelect,
    IonSelectOption,
    PageContainer,
    UiButton,
    UiPageHeader
  },
  data() {
    return {
      categoryDrafts: {} as Record<number, string>,
      deletingCategoryId: null as number | null,
      isClearConfirmationVisible: false,
      newCategoryName: "",
      statusMessage: "",
      style
    };
  },
  computed: {
    categories() {
      return this.$subscriptionStore.categories;
    },
    canAddCategory() {
      return this.newCategoryName.trim().length >= 2;
    }
  },
  methods: {
    updateTheme(event: SelectCustomEvent) {
      this.$settingsStore.updateTheme(event.detail.value as AppTheme);
    },
    updateCurrency(event: SelectCustomEvent) {
      this.$settingsStore.updateCurrency(event.detail.value as AppCurrency);
    },
    updateDefaultReminderDays(event: InputCustomEvent) {
      const value = Number(event.detail.value ?? 0);

      this.$settingsStore.updateDefaultReminderDays(value);
    },
    getCategoryDraft(category: Category) {
      return this.categoryDrafts[category.id] ?? category.name;
    },
    updateCategoryDraft(categoryId: number, event: InputCustomEvent) {
      this.categoryDrafts[categoryId] = String(event.detail.value ?? "");
      this.deletingCategoryId = null;
    },
    canSaveCategory(category: Category) {
      const draft = this.getCategoryDraft(category).trim();

      return draft.length >= 2 && draft !== category.name;
    },
    async addCategory() {
      if (!this.canAddCategory) {
        return;
      }

      const category = await this.$subscriptionStore.addCategory(
        this.newCategoryName
      );

      if (!category) {
        this.showStatus("Категорию не удалось добавить");
        return;
      }

      this.newCategoryName = "";
      this.showStatus("Категория добавлена");
    },
    async saveCategory(category: Category) {
      if (!this.canSaveCategory(category)) {
        return;
      }

      const savedCategory = await this.$subscriptionStore.updateCategory(
        category.id,
        this.getCategoryDraft(category)
      );

      if (!savedCategory) {
        this.showStatus("Категорию не удалось сохранить");
        return;
      }

      delete this.categoryDrafts[category.id];
      this.showStatus("Категория обновлена");
    },
    async requestDeleteCategory(category: Category) {
      if (this.deletingCategoryId !== category.id) {
        this.deletingCategoryId = category.id;
        return;
      }

      await this.$subscriptionStore.deleteCategory(category.id);
      this.deletingCategoryId = null;
      this.showStatus("Категория удалена");
    },
    async exportData() {
      const data = await this.$subscriptionStore.exportSnapshot();
      const backup: BackupFile = {
        app: "subly",
        data,
        exportedAt: new Date().toISOString(),
        version: 1
      };
      const fileName = `subly-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const fileContents = JSON.stringify(backup, null, 2);

      if (Capacitor.isNativePlatform()) {
        try {
          await Filesystem.writeFile({
            data: fileContents,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
            path: fileName
          });
          this.showStatus(`Файл сохранен в Документы: ${fileName}`);
        } catch {
          this.showStatus("Не удалось сохранить файл на телефоне");
        }

        return;
      }

      const file = new Blob([fileContents], {
        type: "application/json"
      });
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      this.showStatus("Экспорт подготовлен");
    },
    openImportFile() {
      const input = this.$refs.importInput as HTMLInputElement | undefined;

      if (!input) {
        return;
      }

      input.value = "";
      input.click();
    },
    async importData(event: Event) {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];

      if (!file) {
        return;
      }

      try {
        const backup = JSON.parse(await file.text()) as BackupFile;
        const data = backup.data;

        if (!data?.categories || !data?.subscriptions) {
          this.showStatus("Файл не похож на резервную копию Subly");
          return;
        }

        await this.$subscriptionStore.importSnapshot(data);
        this.showStatus("Данные импортированы");
      } catch {
        this.showStatus("Не удалось импортировать файл");
      } finally {
        input.value = "";
      }
    },
    async clearData() {
      if (!this.isClearConfirmationVisible) {
        this.isClearConfirmationVisible = true;
        return;
      }

      await this.$subscriptionStore.clearData();
      this.categoryDrafts = {};
      this.isClearConfirmationVisible = false;
      this.showStatus("Данные очищены");
    },
    showStatus(message: string) {
      this.statusMessage = message;
      window.setTimeout(() => {
        if (this.statusMessage === message) {
          this.statusMessage = "";
        }
      }, 2600);
    }
  }
});
</script>
