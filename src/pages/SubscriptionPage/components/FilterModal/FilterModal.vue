<template>
  <div :class="style.filterControl">
    <ion-button
      fill="clear"
      :class="style.filterButton"
      aria-label="Фильтры"
      @click="openFilterModal"
    >
      <ion-icon :icon="optionsOutline" />
      <span v-if="activeFiltersCount" :class="style.filterBadge">
        {{ activeFiltersCount }}
      </span>
    </ion-button>

    <ion-modal
      ref="filterModal"
      :class="style.ionModal"
      :is-open="isFilterModalOpen"
      :initial-breakpoint="0.68"
      :breakpoints="[0, 0.68, 0.96]"
      @didDismiss="closeFilterModal"
    >
      <div :class="style.filterModal">
        <div :class="style.filterModalHeader">
          <div>
            <span :class="style.eyebrow">Настройки</span>
            <h2>Фильтры</h2>
          </div>

          <button :class="style.modalCloseButton" @click="closeFilterModal">
            Готово
          </button>
        </div>

        <section :class="style.filterGroup">
          <div :class="style.filterGroupHeader">
            <h3>Категория</h3>
            <span>{{ selectedCategory }}</span>
          </div>

          <div :class="style.modalChips">
            <button
              :class="[
                style.chip,
                selectedCategory === 'Все' ? style.activeChip : null
              ]"
              @click="selectCurrentCategory('Все')"
            >
              Все
            </button>

            <button
              v-for="category in categories"
              :key="category.id"
              :class="[
                style.chip,
                selectedCategory === category.name ? style.activeChip : null
              ]"
              @click="selectCurrentCategory(category.name)"
            >
              {{ category.name }}
            </button>
          </div>
        </section>

        <section :class="style.filterGroup">
          <div :class="style.filterGroupHeader">
            <h3>Стоимость</h3>
            <span>{{ selectedPriceFilterLabel }}</span>
          </div>

          <div :class="style.priceOptions">
            <button
              v-for="priceFilter in priceFilters"
              :key="priceFilter.id"
              :class="[
                style.priceOption,
                selectedPriceFilter === priceFilter.id
                  ? style.activePriceOption
                  : null
              ]"
              @click="selectPriceFilter(priceFilter.id)"
            >
              <strong>{{ priceFilter.label }}</strong>
              <span>{{ priceFilter.description }}</span>
            </button>
          </div>
        </section>

        <div :class="style.filterModalActions">
          <button :class="style.resetFiltersButton" @click="resetFilters">
            Сбросить
          </button>

          <button :class="style.applyFiltersButton" @click="closeFilterModal">
            Показать {{ subscriptionsCount }}
          </button>
        </div>
      </div>
    </ion-modal>
  </div>
</template>

<script lang="ts">
import {IonButton, IonIcon, IonModal} from "@ionic/vue";
import {defineComponent, PropType} from "vue";
import {optionsOutline} from "ionicons/icons";
import style from "./FilterModal.module.scss";

type PriceFilterId = "all" | "cheap" | "middle" | "expensive";

type PriceFilter = {
  id: PriceFilterId;
  label: string;
  description: string;
  min: number | null;
  max: number | null;
};

export default defineComponent({
  name: "FilterModal",
  components: {
    IonButton,
    IonIcon,
    IonModal
  },
  props: {
    categories: {
      type: Array as PropType<Category[]>,
      required: true
    },
    subscriptionsCount: {
      type: Number,
      required: true
    }
  },
  emits: ["change"],
  data() {
    return {
      isFilterModalOpen: false,
      optionsOutline,
      priceFilters: [
        {
          id: "all",
          label: "Любая",
          description: "Без ограничения цены",
          min: null,
          max: null
        },
        {
          id: "cheap",
          label: "До 300 ₽",
          description: "Недорогие подписки",
          min: null,
          max: 300
        },
        {
          id: "middle",
          label: "300-700 ₽",
          description: "Средний диапазон",
          min: 300,
          max: 700
        },
        {
          id: "expensive",
          label: "От 700 ₽",
          description: "Самые дорогие",
          min: 700,
          max: null
        }
      ] as PriceFilter[],
      selectedCategory: "Все",
      selectedPriceFilter: "all" as PriceFilterId,
      style
    };
  },
  methods: {
    openFilterModal() {
      this.isFilterModalOpen = true;
    },
    closeFilterModal() {
      this.isFilterModalOpen = false;
    },
    selectCurrentCategory(category: string) {
      this.selectedCategory = category;
      this.emitFilters();
    },
    selectPriceFilter(priceFilter: PriceFilterId) {
      this.selectedPriceFilter = priceFilter;
      this.emitFilters();
    },
    resetFilters() {
      this.selectedCategory = "Все";
      this.selectedPriceFilter = "all";
      this.emitFilters();
    },
    emitFilters() {
      const priceFilter = this.selectedPriceFilterConfig;

      this.$emit("change", {
        category: this.selectedCategory,
        min: priceFilter.min,
        max: priceFilter.max
      });
    }
  },
  computed: {
    selectedPriceFilterConfig() {
      return (
        this.priceFilters.find((priceFilter) => {
          return priceFilter.id === this.selectedPriceFilter;
        }) ?? this.priceFilters[0]
      );
    },
    selectedPriceFilterLabel() {
      return this.selectedPriceFilterConfig.label;
    },
    activeFiltersCount() {
      return [
        this.selectedCategory !== "Все",
        this.selectedPriceFilter !== "all"
      ].filter(Boolean).length;
    }
  }
});
</script>
