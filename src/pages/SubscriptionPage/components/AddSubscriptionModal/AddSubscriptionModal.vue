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
      :is-open="isModalOpen"
      :initial-breakpoint="0.92"
      :breakpoints="[0, 0.92, 1]"
      @didDismiss="handleModalDismiss"
    >
      <form :class="style.modal" @submit.prevent="saveSubscription">
        <div :class="style.header">
          <div>
            <span :class="style.eyebrow">{{ formEyebrow }}</span>
            <h2>Подписка</h2>
          </div>

          <button type="button" :class="style.closeButton" @click="requestClose">
            Закрыть
          </button>
        </div>

        <section :class="style.formGrid">
          <label :class="style.field">
            <span>Название</span>
            <ion-input v-model="name" placeholder="Название" />
          </label>

          <label :class="style.field">
            <span>Стоимость</span>
            <ion-input
              v-model="price"
              inputmode="numeric"
              placeholder="Цена"
              type="number"
            />
          </label>

          <label :class="style.field">
            <span>День списания</span>
            <ion-input
              v-model="day"
              inputmode="numeric"
              placeholder="День месяца"
              type="number"
            />
          </label>

          <label :class="style.field">
            <span>Месяц</span>
            <ion-select v-model="month" interface="popover">
              <ion-select-option
                v-for="monthOption in months"
                :key="monthOption.value"
                :value="monthOption.value"
              >
                {{ monthOption.label }}
              </ion-select-option>
            </ion-select>
          </label>

          <label :class="style.field">
            <span>Категория</span>
            <ion-select v-model="categoryId" interface="popover">
              <ion-select-option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </ion-select-option>
            </ion-select>
          </label>

          <label :class="style.field">
            <span>Период</span>
            <ion-select v-model="period" interface="popover">
              <ion-select-option value="месяц">месяц</ion-select-option>
              <ion-select-option value="неделя">неделя</ion-select-option>
              <ion-select-option value="год">год</ion-select-option>
            </ion-select>
          </label>
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

        <button
          type="submit"
          :class="style.submitButton"
          :disabled="!canSaveSubscription"
        >
          {{ submitButtonLabel }}
        </button>
      </form>
    </ion-modal>

    <ion-modal
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
              :class="style.closeButton"
              @click="closePicker"
            >
              Готово
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

const months = [
  {label: "Январь", value: "января"},
  {label: "Февраль", value: "февраля"},
  {label: "Март", value: "марта"},
  {label: "Апрель", value: "апреля"},
  {label: "Май", value: "мая"},
  {label: "Июнь", value: "июня"},
  {label: "Июль", value: "июля"},
  {label: "Август", value: "августа"},
  {label: "Сентябрь", value: "сентября"},
  {label: "Октябрь", value: "октября"},
  {label: "Ноябрь", value: "ноября"},
  {label: "Декабрь", value: "декабря"}
];

export default defineComponent({
  name: "AddSubscriptionModal",
  components: {
    IonButton,
    IonContent,
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
      colorClass: "green",
      colorOptions,
      day: "",
      editingIsActive: true,
      editingSubscriptionId: null as number | null,
      errorMessage: "",
      iconId: "youtube",
      iconOptions,
      isModalOpen: false,
      isPickerOpen: false,
      month: "сентября",
      months,
      name: "",
      pickerMode: "icon" as PickerMode,
      period: "месяц",
      price: "",
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
    requestClose() {
      this.isModalOpen = false;
    },
    handleModalDismiss() {
      const wasEditingExternalSubscription = Boolean(this.editableSubscription);

      this.isModalOpen = false;
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
    closePicker() {
      this.isPickerOpen = false;
    },
    selectIcon(iconId: string) {
      this.iconId = iconId;
    },
    selectColor(colorClass: string) {
      this.colorClass = colorClass;
    },
    resetForm() {
      this.categoryId = this.categories[0]?.id ?? 1;
      this.colorClass = "green";
      this.day = "";
      this.editingIsActive = true;
      this.editingSubscriptionId = null;
      this.errorMessage = "";
      this.iconId = "youtube";
      this.month = "сентября";
      this.name = "";
      this.pickerMode = "icon";
      this.period = "месяц";
      this.price = "";
    },
    fillForm(subscription: Subscription) {
      const selectedIcon = this.iconOptions.find((iconOption) => {
        return iconOption.icon === subscription.icon;
      });
      const selectedColor = this.colorOptions.find((colorOption) => {
        return colorOption.id === subscription.colorClass;
      });
      const dateParts = subscription.date.match(/^(\d{1,2})\s+(.+)$/);
      const monthValue = dateParts?.[2] ?? this.months[0].value;
      const selectedMonth = this.months.find((monthOption) => {
        return monthOption.value === monthValue;
      });

      this.categoryId = subscription.category?.id ?? this.categories[0]?.id ?? 1;
      this.colorClass = selectedColor?.id ?? "green";
      this.day = dateParts?.[1] ?? "";
      this.editingIsActive = subscription.isActive;
      this.editingSubscriptionId = subscription.id;
      this.errorMessage = "";
      this.iconId = selectedIcon?.id ?? "other";
      this.month = selectedMonth?.value ?? this.months[0].value;
      this.name = subscription.name;
      this.pickerMode = "icon";
      this.period = subscription.period;
      this.price = String(subscription.price);
    },
    saveSubscription() {
      if (!this.canSaveSubscription) {
        this.errorMessage = "Заполни название, цену и корректный день списания";
        return;
      }

      const category = this.selectedCategory;
      const subscriptionData = {
        category,
        colorClass: this.colorClass,
        date: `${Number(this.day)} ${this.month}`,
        icon: this.selectedIcon.icon,
        isActive: this.isEditMode ? this.editingIsActive : true,
        name: this.name.trim(),
        period: this.period,
        price: Number(this.price)
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
    submitButtonLabel() {
      return this.isEditMode ? "Сохранить изменения" : "Добавить подписку";
    },
    isEditMode() {
      return this.editingSubscriptionId !== null;
    },
    canSaveSubscription() {
      const day = Number(this.day);
      const price = Number(this.price);

      return (
        Boolean(this.name.trim()) &&
        Number.isFinite(price) &&
        price > 0 &&
        Number.isInteger(day) &&
        day >= 1 &&
        day <= 31
      );
    }
  }
});
</script>
