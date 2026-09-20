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

              <label :class="style.field">
                <span>Категория</span>
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
              </label>

              <div :class="style.categoryCreate">
                <ion-input
                  v-model="newCategoryName"
                  placeholder="Новая категория"
                  @ionFocus="expandCreateModal"
                />

                <button
                  type="button"
                  :class="style.categoryCreateButton"
                  :disabled="!canCreateCategory"
                  @click="createCategory"
                >
                  Добавить
                </button>
              </div>

              <label :class="style.field">
                <span>Дата регистрации</span>
                <button
                  type="button"
                  :class="style.dateButton"
                  @click="openDatePicker"
                >
                  <strong>{{ registeredAtLabel }}</strong>
                  <em>Выбрать в календаре</em>
                </button>
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

            <button
              type="button"
              :class="[
                style.statusActionButton,
                editingIsActive ? style.deactivateButton : style.activateButton
              ]"
              @click="toggleSubscriptionActivity"
            >
              {{ activityActionLabel }}
            </button>
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
            <button
              type="submit"
              :class="style.submitButton"
              :disabled="!canSaveSubscription"
            >
              {{ submitButtonLabel }}
            </button>
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
              <h2>Регистрация</h2>
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
            :value="registeredAt"
            :class="style.calendar"
            presentation="date"
            @ionChange="updateRegisteredAt"
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
      <ion-content :class="style.pickerContent">
        <div :class="style.pickerModal">
          <div :class="style.header">
            <div>
              <span :class="style.eyebrow">Выбор</span>
              <h2>{{ pickerTitle }}</h2>
            </div>

            <button
              type="button"
              :class="[style.closeButton, style.textButton]"
              @click="closePicker"
            >
              <span>Готово</span>
            </button>
          </div>

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
import {
  addOutline,
  albumsOutline,
  appsOutline,
  bagHandleOutline,
  bookOutline,
  briefcaseOutline,
  cardOutline,
  cashOutline,
  cloudOutline,
  codeSlashOutline,
  closeOutline,
  cubeOutline,
  filmOutline,
  fitnessOutline,
  gameControllerOutline,
  globeOutline,
  heartOutline,
  homeOutline,
  logoApple,
  logoFigma,
  logoGoogle,
  logoYoutube,
  mailOutline,
  musicalNotesOutline,
  newspaperOutline,
  phonePortraitOutline,
  planetOutline,
  playCircleOutline,
  radioOutline,
  restaurantOutline,
  schoolOutline,
  serverOutline,
  shieldCheckmarkOutline,
  sparklesOutline,
  starOutline,
  tvOutline,
  walletOutline,
  wifiOutline
} from "ionicons/icons";
import style from "./AddSubscriptionModal.module.scss";

type IconOption = {
  id: string;
  label: string;
  icon: string;
};

type ColorOption = {
  id: string;
  label: string;
};

type PickerMode = "icon" | "color";

const iconOptions: IconOption[] = [
  {id: "youtube", label: "YouTube", icon: logoYoutube},
  {id: "apple", label: "Apple", icon: logoApple},
  {id: "google", label: "Google", icon: logoGoogle},
  {id: "figma", label: "Figma", icon: logoFigma},
  {id: "video", label: "Видео", icon: playCircleOutline},
  {id: "tv", label: "ТВ", icon: tvOutline},
  {id: "film", label: "Кино", icon: filmOutline},
  {id: "music", label: "Музыка", icon: musicalNotesOutline},
  {id: "radio", label: "Радио", icon: radioOutline},
  {id: "cloud", label: "Облако", icon: cloudOutline},
  {id: "server", label: "Сервер", icon: serverOutline},
  {id: "code", label: "Код", icon: codeSlashOutline},
  {id: "wallet", label: "Кошелек", icon: walletOutline},
  {id: "card", label: "Карта", icon: cardOutline},
  {id: "cash", label: "Деньги", icon: cashOutline},
  {id: "game", label: "Игры", icon: gameControllerOutline},
  {id: "book", label: "Книги", icon: bookOutline},
  {id: "school", label: "Учеба", icon: schoolOutline},
  {id: "news", label: "Новости", icon: newspaperOutline},
  {id: "fitness", label: "Спорт", icon: fitnessOutline},
  {id: "food", label: "Еда", icon: restaurantOutline},
  {id: "shopping", label: "Покупки", icon: bagHandleOutline},
  {id: "work", label: "Работа", icon: briefcaseOutline},
  {id: "phone", label: "Связь", icon: phonePortraitOutline},
  {id: "wifi", label: "Интернет", icon: wifiOutline},
  {id: "mail", label: "Почта", icon: mailOutline},
  {id: "security", label: "Защита", icon: shieldCheckmarkOutline},
  {id: "home", label: "Дом", icon: homeOutline},
  {id: "health", label: "Здоровье", icon: heartOutline},
  {id: "world", label: "Мир", icon: globeOutline},
  {id: "creative", label: "Творчество", icon: sparklesOutline},
  {id: "premium", label: "Премиум", icon: starOutline},
  {id: "space", label: "Космос", icon: planetOutline},
  {id: "archive", label: "Коллекция", icon: albumsOutline},
  {id: "service", label: "Сервис", icon: cubeOutline},
  {id: "other", label: "Другое", icon: appsOutline}
];

const colorOptions: ColorOption[] = [
  {id: "green", label: "Зеленый"},
  {id: "blue", label: "Синий"},
  {id: "violet", label: "Фиолетовый"},
  {id: "orange", label: "Оранжевый"},
  {id: "red", label: "Красный"},
  {id: "cyan", label: "Голубой"},
  {id: "pink", label: "Розовый"},
  {id: "amber", label: "Янтарный"},
  {id: "indigo", label: "Индиго"},
  {id: "slate", label: "Графит"}
];

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
    IonSelectOption
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
      categoryId: this.categories[0]?.id ?? 1,
      closeOutline,
      colorClass: "green",
      colorOptions,
      editingIsActive: true,
      editingSubscriptionId: null as number | null,
      errorMessage: "",
      iconId: "youtube",
      iconOptions,
      isDatePickerOpen: false,
      isModalOpen: false,
      isPickerOpen: false,
      name: "",
      newCategoryName: "",
      pickerMode: "icon" as PickerMode,
      period: "месяц",
      price: "",
      reminderDays: "3",
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
    openDatePicker() {
      this.isDatePickerOpen = true;
    },
    closeDatePicker() {
      this.isDatePickerOpen = false;
    },
    updateRegisteredAt(event: CustomEvent<{value?: string | string[] | null}>) {
      const value = event.detail.value;

      if (typeof value !== "string") {
        return;
      }

      this.registeredAt = value.slice(0, 10);
    },
    closePicker() {
      this.isPickerOpen = false;
    },
    selectIcon(iconId: string) {
      this.iconId = iconId;
    },
    selectColor(colorClass: string) {
      this.colorClass = colorClass;
    },
    createCategory() {
      if (!this.canCreateCategory) {
        return;
      }

      const category = this.$subscriptionStore.addCategory(
        this.newCategoryName
      );

      if (!category) {
        return;
      }

      this.categoryId = category.id;
      this.newCategoryName = "";
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
      this.colorClass = "green";
      this.editingIsActive = true;
      this.editingSubscriptionId = null;
      this.errorMessage = "";
      this.iconId = "youtube";
      this.name = "";
      this.newCategoryName = "";
      this.pickerMode = "icon";
      this.period = "месяц";
      this.price = "";
      this.reminderDays = "3";
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
      this.colorClass = selectedColor?.id ?? "green";
      this.editingIsActive = subscription.isActive;
      this.editingSubscriptionId = subscription.id;
      this.errorMessage = "";
      this.iconId = selectedIcon?.id ?? "other";
      this.name = subscription.name;
      this.newCategoryName = "";
      this.pickerMode = "icon";
      this.period = subscription.period;
      this.price = String(subscription.price);
      this.reminderDays = String(subscription.reminderDays ?? 3);
      this.registeredAt = subscription.registeredAt ?? this.getTodayIsoDate();
    },
    toggleSubscriptionActivity() {
      if (!this.editingSubscriptionId) {
        return;
      }

      this.$subscriptionStore.updateSubscription(this.editingSubscriptionId, {
        isActive: !this.editingIsActive
      });
      this.requestClose();
    },
    saveSubscription() {
      if (!this.canSaveSubscription) {
        this.errorMessage =
          "Заполни название, дату регистрации, цену и напоминание";
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
        reminderDays
      };

      if (this.isEditMode && this.editingSubscriptionId) {
        this.$subscriptionStore.updateSubscription(
          this.editingSubscriptionId,
          subscriptionData
        );
      } else {
        this.$subscriptionStore.addSubscription(subscriptionData);
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
    registeredAtLabel() {
      const registeredAt = new Date(`${this.registeredAt}T00:00:00`);

      if (Number.isNaN(registeredAt.getTime())) {
        return "Дата не выбрана";
      }

      return registeredAt.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
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

      return (
        Boolean(this.name.trim()) &&
        !Number.isNaN(registeredAt.getTime()) &&
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
