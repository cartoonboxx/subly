<template>
  <div>
    <ion-button
      v-if="showButton"
      :class="buttonClass"
      aria-label="Добавить подписку"
      @click="openModal"
    >
      <ion-icon :icon="addOutline" />
    </ion-button>

    <ion-modal
      ref="modalCreate"
      :class="style.ionModal"
      :is-open="isModalOpen"
      :initial-breakpoint="0.92"
      :breakpoints="[0, 0.92, 1]"
      @didDismiss="handleModalDismiss"
    >
      <ion-content :class="style.modalContent">
        <form :class="style.modal" @submit.prevent="saveSubscription">
          <div :class="style.header">
            <div>
              <span :class="style.eyebrow">{{ formEyebrow }}</span>
              <h2>{{ formTitle }}</h2>
            </div>

            <button
              type="button"
              :class="style.closeButton"
              aria-label="Закрыть"
              @click="requestClose"
            >
              <ion-icon :icon="closeOutline" />
            </button>
          </div>

          <section :class="style.formGrid" aria-label="Поля подписки">
            <div :class="style.fieldSection">
              <h3>Детали</h3>

              <label :class="style.field">
                <span>Название</span>
                <ion-input
                  v-model="name"
                  placeholder="Например, YouTube"
                  @ionFocus="expandCreateModal"
                />
              </label>

              <div :class="style.field">
                <span>Категория</span>
                <div :class="style.categorySelectRow">
                  <ion-select
                    v-model="categoryId"
                    interface="popover"
                    @ionFocus="expandCreateModal"
                  >
                    <ion-select-option
                      v-for="category in categories"
                      :key="category.id"
                      :value="category.id"
                    >
                      {{ category.name }}
                    </ion-select-option>
                  </ion-select>

                  <button
                    type="button"
                    :class="style.categoryAddButton"
                    aria-label="Создать категорию"
                    @click="openCategoryModal"
                  >
                    <ion-icon :icon="addOutline" />
                  </button>
                </div>
              </div>

              <label :class="style.field">
                <span>Дата регистрации</span>
                <button
                  type="button"
                  :class="style.dateButton"
                  @click="openDatePicker('registeredAt')"
                >
                  <strong>{{ registeredAtLabel }}</strong>
                  <em>Выбрать в календаре</em>
                </button>
              </label>

              <label :class="style.field">
                <span>Окончание</span>
                <div :class="style.dateFieldActions">
                  <button
                    type="button"
                    :class="style.dateButton"
                    @click="openDatePicker('expiresAt')"
                  >
                    <strong>{{ expiresAtLabel }}</strong>
                    <em>{{ expiresAtActionLabel }}</em>
                  </button>

                  <UiButton
                    v-if="expiresAt"
                    type="button"
                    variant="dangerSoft"
                    :class="style.clearDateButton"
                    aria-label="Убрать дату окончания"
                    @click="clearExpiresAt"
                  >
                    <ion-icon :icon="trashBinOutline" />
                  </UiButton>
                </div>
              </label>
            </div>

            <div :class="style.fieldSection">
              <h3>Списание</h3>

              <label :class="style.field">
                <span>Стоимость</span>
                <ion-input
                  v-model="price"
                  inputmode="numeric"
                  placeholder="Цена"
                  type="number"
                  @ionFocus.self="expandCreateModal"
                />
              </label>

              <label :class="style.field">
                <span>Период</span>
                <ion-select
                  v-model="period"
                  interface="popover"
                  @ionFocus="expandCreateModal"
                >
                  <ion-select-option value="разовая">
                    разовая
                  </ion-select-option>
                  <ion-select-option value="неделя">неделя</ion-select-option>
                  <ion-select-option value="месяц">месяц</ion-select-option>
                  <ion-select-option value="3 месяца">
                    3 месяца
                  </ion-select-option>
                  <ion-select-option value="6 месяцев">
                    6 месяцев
                  </ion-select-option>
                  <ion-select-option value="год">год</ion-select-option>
                </ion-select>
              </label>

              <label :class="style.field">
                <span>Напомнить за</span>
                <ion-input
                  v-model="reminderDays"
                  inputmode="numeric"
                  placeholder="Количество дней"
                  type="number"
                  @ionFocus="expandCreateModal"
                />
              </label>
            </div>
          </section>

          <section v-if="isEditMode" :class="style.statusSection">
            <div>
              <span>Статус</span>
              <strong>{{ activityStatusLabel }}</strong>
            </div>

            <UiButton
              type="button"
              :variant="editingIsActive ? 'dangerSoft' : 'soft'"
              :class="[
                style.statusActionButton,
                editingIsActive ? style.deactivateButton : style.activateButton
              ]"
              @click="toggleSubscriptionActivity"
            >
              {{ activityActionLabel }}
            </UiButton>
          </section>

          <section v-if="isEditMode" :class="style.deleteSection">
            <div>
              <span>Удаление</span>
              <strong>{{ deleteSectionTitle }}</strong>
            </div>

            <UiButton
              type="button"
              variant="dangerSoft"
              :class="style.deleteActionButton"
              @click="deleteSubscription"
            >
              {{ deleteActionLabel }}
            </UiButton>
          </section>

          <section :class="style.optionGroup">
            <div :class="style.groupHeader">
              <h3>Иконка</h3>
              <span>{{ selectedIcon.label }}</span>
            </div>

            <button
              type="button"
              :class="style.previewButton"
              @click="openPicker('icon')"
            >
              <span :class="style.previewIcon">
                <ion-icon :icon="selectedIcon.icon" />
              </span>
              <strong>{{ selectedIcon.label }}</strong>
              <em>Смотреть все</em>
            </button>
          </section>

          <section :class="style.optionGroup">
            <div :class="style.groupHeader">
              <h3>Цвет</h3>
              <span>{{ selectedColor.label }}</span>
            </div>

            <button
              type="button"
              :class="style.previewButton"
              @click="openPicker('color')"
            >
              <span :class="[style.previewColor, style[colorClass]]" />
              <strong>{{ selectedColor.label }}</strong>
              <em>Смотреть все</em>
            </button>
          </section>

          <p v-if="errorMessage" :class="style.errorMessage">
            {{ errorMessage }}
          </p>

          <div :class="style.actionPanel">
            <UiButton
              type="submit"
              maxWidth
              :class="style.submitButton"
              :disabled="!canSaveSubscription"
            >
              {{ submitButtonLabel }}
            </UiButton>
          </div>
        </form>
      </ion-content>
    </ion-modal>

    <ion-modal
      :class="style.ionModal"
      :is-open="isCategoryModalOpen"
      :initial-breakpoint="0.48"
      :breakpoints="[0, 0.48, 1]"
      @didDismiss="closeCategoryModal"
    >
      <ion-content :class="style.pickerContent">
        <form :class="style.categoryModal" @submit.prevent="createCategory">
          <div :class="style.header">
            <div>
              <span :class="style.eyebrow">Категории</span>
              <h2>Новая категория</h2>
            </div>

            <button
              type="button"
              :class="style.closeButton"
              aria-label="Закрыть"
              @click="closeCategoryModal"
            >
              <ion-icon :icon="closeOutline" />
            </button>
          </div>

          <label :class="style.field">
            <span>Название</span>
            <ion-input
              v-model="newCategoryName"
              autofocus
              placeholder="Например, Спорт"
            />
          </label>

          <p v-if="categoryErrorMessage" :class="style.errorMessage">
            {{ categoryErrorMessage }}
          </p>

          <div :class="[style.actionPanel, style.categoryActionPanel]">
            <UiButton
              type="button"
              variant="neutral"
              @click="closeCategoryModal"
            >
              Отмена
            </UiButton>

            <UiButton
              type="submit"
              variant="secondary"
              :disabled="!canCreateCategory"
            >
              Создать
            </UiButton>
          </div>
        </form>
      </ion-content>
    </ion-modal>

    <ion-modal
      :class="style.ionModal"
      :is-open="isDatePickerOpen"
      :initial-breakpoint="0.72"
      :breakpoints="[0, 0.72, 1]"
      @didDismiss="closeDatePicker"
    >
      <ion-content :class="style.pickerContent">
        <div :class="style.datePickerModal">
          <div :class="style.header">
            <div>
              <span :class="style.eyebrow">Дата</span>
              <h2>{{ datePickerTitle }}</h2>
            </div>

            <button
              type="button"
              :class="[style.closeButton, style.textButton]"
              @click="closeDatePicker"
            >
              <span>Готово</span>
            </button>
          </div>

          <ion-datetime
            :value="datePickerValue"
            :class="style.calendar"
            :min="datePickerMin"
            presentation="date"
            @ionChange="updateSelectedDate"
          />
        </div>
      </ion-content>
    </ion-modal>

    <ion-modal
      :class="style.ionModal"
      :is-open="isPickerOpen"
      :initial-breakpoint="0.82"
      :breakpoints="[0, 0.82, 1]"
      @didDismiss="closePicker"
    >
      <ion-content :class="[style.pickerContent, style.choicePickerContent]">
        <div :class="style.pickerModal">
          <div :class="style.header">
            <div>
              <span :class="style.eyebrow">Выбор</span>
              <h2>{{ pickerTitle }}</h2>
            </div>
          </div>

          <div :class="style.pickerBody">
            <section v-if="pickerMode === 'icon'" :class="style.pickerGrid">
              <button
                v-for="iconOption in iconOptions"
                :key="iconOption.id"
                type="button"
                :class="[
                  style.pickerOption,
                  iconId === iconOption.id ? style.activeOption : null
                ]"
                @click="selectIcon(iconOption.id)"
              >
                <ion-icon :icon="iconOption.icon" />
                <span>{{ iconOption.label }}</span>
              </button>
            </section>

            <section v-if="pickerMode === 'color'" :class="style.pickerGrid">
              <button
                v-for="colorOption in colorOptions"
                :key="colorOption.id"
                type="button"
                :class="[
                  style.pickerOption,
                  colorClass === colorOption.id ? style.activeOption : null
                ]"
                @click="selectColor(colorOption.id)"
              >
                <i :class="[style.colorSwatch, style[colorOption.id]]" />
                <span>{{ colorOption.label }}</span>
              </button>
            </section>
          </div>

          <div :class="[style.actionPanel, style.pickerActionPanel]">
            <UiButton
              type="button"
              maxWidth
              :class="style.submitButton"
              @click="closePicker"
            >
              Готово
            </UiButton>
          </div>
        </div>
      </ion-content>
    </ion-modal>
  </div>
</template>

<script lang="ts">
import {
  IonButton,
  IonContent,
  IonDatetime,
  IonIcon,
  IonInput,
  IonModal,
  IonSelect,
  IonSelectOption
} from "@ionic/vue";
import {defineComponent, PropType} from "vue";
import {addOutline, closeOutline, trashBinOutline} from "ionicons/icons";
import UiButton from "@/components/ui/UiButton/UiButton.vue";
import style from "./AddSubscriptionModal.module.scss";
import {
  PickerMode,
  colorOptions,
  iconOptions
} from "@/pages/SubscriptionPage/components/AddSubscriptionModal/utils";

type DatePickerMode = "registeredAt" | "expiresAt";

export default defineComponent({
  name: "AddSubscriptionModal",
  components: {
    IonButton,
    IonContent,
    IonDatetime,
    IonIcon,
    IonInput,
    IonModal,
    IonSelect,
    IonSelectOption,
    UiButton
  },
  props: {
    buttonClass: {
      type: String,
      default: ""
    },
    categories: {
      type: Array as PropType<Category[]>,
      required: true
    },
    editableSubscription: {
      type: Object as PropType<Subscription | null>,
      default: null
    },
    showButton: {
      type: Boolean,
      default: true
    }
  },
  emits: ["close-edit"],
  data() {
    return {
      addOutline,
      trashBinOutline,
      categoryErrorMessage: "",
      categoryId: this.categories[0]?.id ?? 1,
      closeOutline,
      colorClass: "green",
      colorOptions,
      datePickerMode: "registeredAt" as DatePickerMode,
      editingIsActive: true,
      editingSubscriptionId: null as number | null,
      errorMessage: "",
      iconId: "youtube",
      iconOptions,
      isCategoryModalOpen: false,
      isDeleteConfirmationVisible: false,
      isDatePickerOpen: false,
      isModalOpen: false,
      isPickerOpen: false,
      name: "",
      newCategoryName: "",
      pickerMode: "icon" as PickerMode,
      period: "месяц",
      price: "",
      reminderDays: "",
      expiresAt: null as string | null,
      registeredAt: this.getTodayIsoDate(),
      style
    };
  },
  watch: {
    editableSubscription(subscription: Subscription | null) {
      if (!subscription) {
        return;
      }

      this.fillForm(subscription);
      this.isModalOpen = true;
    }
  },
  methods: {
    openModal() {
      this.resetForm();
      this.isModalOpen = true;
    },
    async expandCreateModal() {
      const modalRef = this.$refs.modalCreate as any;
      const modal = modalRef.$el as HTMLIonModalElement;

      await modal.setCurrentBreakpoint(1);
    },
    requestClose() {
      this.isModalOpen = false;
    },
    handleModalDismiss() {
      const wasEditingExternalSubscription = Boolean(this.editableSubscription);

      this.isModalOpen = false;
      this.isCategoryModalOpen = false;
      this.isDatePickerOpen = false;
      this.isPickerOpen = false;
      this.resetForm();

      if (wasEditingExternalSubscription) {
        this.$emit("close-edit");
      }
    },
    openPicker(mode: PickerMode) {
      this.pickerMode = mode;
      this.isPickerOpen = true;
    },
    openCategoryModal() {
      this.categoryErrorMessage = "";
      this.newCategoryName = "";
      this.isCategoryModalOpen = true;
    },
    closeCategoryModal() {
      this.isCategoryModalOpen = false;
      this.categoryErrorMessage = "";
    },
    openDatePicker(mode: DatePickerMode) {
      this.datePickerMode = mode;
      this.isDatePickerOpen = true;
    },
    closeDatePicker() {
      this.isDatePickerOpen = false;
    },
    updateSelectedDate(event: CustomEvent<{value?: string | string[] | null}>) {
      const value = event.detail.value;

      if (typeof value !== "string") {
        return;
      }

      if (this.datePickerMode === "registeredAt") {
        this.registeredAt = value.slice(0, 10);
        return;
      }

      this.expiresAt = value.slice(0, 10);
    },
    clearExpiresAt() {
      this.expiresAt = null;
    },
    closePicker() {
      this.isPickerOpen = false;
    },
    selectIcon(iconId: string) {
      this.iconId = iconId;
    },
    selectColor(colorClass: string) {
      this.colorClass = colorClass;
      this.isDeleteConfirmationVisible = false;
    },
    async createCategory() {
      if (!this.canCreateCategory) {
        this.categoryErrorMessage = "Название должно быть не короче 2 символов";
        return;
      }

      let category: Category | null = null;

      try {
        category = await this.$subscriptionStore.addCategory(
          this.newCategoryName
        );
      } catch {
        this.categoryErrorMessage = "Не удалось создать категорию";
        return;
      }

      if (!category) {
        this.categoryErrorMessage = "Не удалось создать категорию";
        return;
      }

      this.categoryId = category.id;
      this.newCategoryName = "";
      this.closeCategoryModal();
      this.expandCreateModal();
    },
    getTodayIsoDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },
    resetForm() {
      this.categoryId = this.categories[0]?.id ?? 1;
      this.categoryErrorMessage = "";
      this.colorClass = "green";
      this.editingIsActive = true;
      this.editingSubscriptionId = null;
      this.errorMessage = "";
      this.iconId = "youtube";
      this.isDeleteConfirmationVisible = false;
      this.name = "";
      this.newCategoryName = "";
      this.pickerMode = "icon";
      this.period = "месяц";
      this.price = "";
      this.reminderDays = String(this.$settingsStore.defaultReminderDays);
      this.expiresAt = null;
      this.registeredAt = this.getTodayIsoDate();
    },
    fillForm(subscription: Subscription) {
      const selectedIcon = this.iconOptions.find((iconOption) => {
        return iconOption.icon === subscription.icon;
      });
      const selectedColor = this.colorOptions.find((colorOption) => {
        return colorOption.id === subscription.colorClass;
      });

      this.categoryId =
        subscription.category?.id ?? this.categories[0]?.id ?? 1;
      this.categoryErrorMessage = "";
      this.colorClass = selectedColor?.id ?? "green";
      this.editingIsActive = subscription.isActive;
      this.editingSubscriptionId = subscription.id;
      this.errorMessage = "";
      this.iconId = selectedIcon?.id ?? "other";
      this.isDeleteConfirmationVisible = false;
      this.name = subscription.name;
      this.newCategoryName = "";
      this.pickerMode = "icon";
      this.period = subscription.period;
      this.price = String(subscription.price);
      this.reminderDays = String(subscription.reminderDays ?? 3);
      this.expiresAt = subscription.expiresAt ?? null;
      this.registeredAt = subscription.registeredAt ?? this.getTodayIsoDate();
    },
    async toggleSubscriptionActivity() {
      if (!this.editingSubscriptionId) {
        return;
      }

      await this.$subscriptionStore.updateSubscription(
        this.editingSubscriptionId,
        {
          isActive: !this.editingIsActive
        }
      );
      this.requestClose();
    },
    async deleteSubscription() {
      if (!this.editingSubscriptionId) {
        return;
      }

      if (!this.isDeleteConfirmationVisible) {
        this.isDeleteConfirmationVisible = true;
        return;
      }

      await this.$subscriptionStore.deleteSubscription(
        this.editingSubscriptionId
      );
      this.requestClose();
    },
    async saveSubscription() {
      if (!this.canSaveSubscription) {
        this.errorMessage =
          "Заполни название, дату регистрации, цену, напоминание и проверь даты";
        return;
      }

      const category = this.selectedCategory;
      const reminderDays = Number(this.reminderDays);
      const subscriptionData = {
        category,
        colorClass: this.colorClass,
        icon: this.selectedIcon.icon,
        isActive: this.isEditMode ? this.editingIsActive : true,
        name: this.name.trim(),
        period: this.period,
        price: Number(this.price),
        registeredAt: this.registeredAt,
        reminderDays,
        expiresAt: this.expiresAt
      };

      if (this.isEditMode && this.editingSubscriptionId) {
        await this.$subscriptionStore.updateSubscription(
          this.editingSubscriptionId,
          subscriptionData
        );
      } else {
        await this.$subscriptionStore.addSubscription(subscriptionData);
      }

      this.requestClose();
    }
  },
  computed: {
    selectedCategory() {
      return this.categories.find((category) => {
        return category.id === Number(this.categoryId);
      });
    },
    canCreateCategory() {
      const normalizedName = this.newCategoryName.trim();

      return normalizedName.length >= 2;
    },
    selectedIcon() {
      return (
        this.iconOptions.find((iconOption) => {
          return iconOption.id === this.iconId;
        }) ?? this.iconOptions[0]
      );
    },
    selectedColor() {
      return (
        this.colorOptions.find((colorOption) => {
          return colorOption.id === this.colorClass;
        }) ?? this.colorOptions[0]
      );
    },
    pickerTitle() {
      return this.pickerMode === "icon" ? "Иконка" : "Цвет";
    },
    formEyebrow() {
      return this.isEditMode ? "Редактирование" : "Новая";
    },
    formTitle() {
      return this.isEditMode ? "Редактирование подписки" : "Новая подписка";
    },
    activityActionLabel() {
      return this.editingIsActive
        ? "Перевести в неактивные"
        : "Вернуть в активные";
    },
    activityStatusLabel() {
      return this.editingIsActive ? "Активна" : "Неактивна";
    },
    deleteActionLabel() {
      return this.isDeleteConfirmationVisible
        ? "Да, удалить навсегда"
        : "Удалить навсегда";
    },
    deleteSectionTitle() {
      return this.isDeleteConfirmationVisible
        ? "Нажми еще раз для подтверждения"
        : "Удалит подписку и историю списаний";
    },
    registeredAtLabel() {
      return this.formatDateLabel(this.registeredAt, "Дата не выбрана");
    },
    expiresAtLabel() {
      return this.expiresAt
        ? this.formatDateLabel(this.expiresAt, "Дата не выбрана")
        : "Без окончания";
    },
    expiresAtActionLabel() {
      return this.expiresAt ? "Изменить дату" : "Выбрать дату";
    },
    datePickerTitle() {
      return this.datePickerMode === "registeredAt"
        ? "Регистрация"
        : "Окончание";
    },
    datePickerValue() {
      return this.datePickerMode === "registeredAt"
        ? this.registeredAt
        : (this.expiresAt ?? this.registeredAt);
    },
    datePickerMin() {
      return this.datePickerMode === "expiresAt"
        ? this.registeredAt
        : undefined;
    },
    formatDateLabel() {
      return (date: string, fallback: string) => {
        const parsedDate = new Date(`${date}T00:00:00`);

        if (Number.isNaN(parsedDate.getTime())) {
          return fallback;
        }

        return parsedDate.toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "long",
          year: "numeric"
        });
      };
    },
    submitButtonLabel() {
      return this.isEditMode ? "Сохранить изменения" : "Добавить подписку";
    },
    isEditMode() {
      return this.editingSubscriptionId !== null;
    },
    canSaveSubscription() {
      const price = Number(this.price);
      const reminderDays = Number(this.reminderDays);
      const registeredAt = new Date(`${this.registeredAt}T00:00:00`);
      const expiresAt = this.expiresAt
        ? new Date(`${this.expiresAt}T00:00:00`)
        : null;

      return (
        Boolean(this.name.trim()) &&
        !Number.isNaN(registeredAt.getTime()) &&
        (!expiresAt ||
          (!Number.isNaN(expiresAt.getTime()) && expiresAt >= registeredAt)) &&
        Number.isFinite(price) &&
        price > 0 &&
        Number.isInteger(reminderDays) &&
        reminderDays >= 0 &&
        reminderDays <= 365
      );
    }
  }
});
</script>
