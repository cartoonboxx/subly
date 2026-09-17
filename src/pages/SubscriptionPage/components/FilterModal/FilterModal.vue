<template>
  <ion-modal
    :is-open="isOpen"
    :initial-breakpoint="0.68"
    :breakpoints="[0, 0.68, 0.96]"
    @didDismiss="$emit('close')"
  >
    <div :class="style.filterModal">
      <div :class="style.filterModalHeader">
        <div>
          <span :class="style.eyebrow">Настройки</span>
          <h2>Фильтры</h2>
        </div>

        <button :class="style.modalCloseButton" @click="$emit('close')">
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
            @click="$emit('select-category', 'Все')"
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
            @click="$emit('select-category', category.name)"
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
            @click="$emit('select-price-filter', priceFilter.id)"
          >
            <strong>{{ priceFilter.label }}</strong>
            <span>{{ priceFilter.description }}</span>
          </button>
        </div>
      </section>

      <div :class="style.filterModalActions">
        <button :class="style.resetFiltersButton" @click="$emit('reset')">
          Сбросить
        </button>

        <button :class="style.applyFiltersButton" @click="$emit('close')">
          Показать {{ subscriptionsCount }}
        </button>
      </div>
    </div>
  </ion-modal>
</template>

<script lang="ts">
import {IonModal} from "@ionic/vue";
import {defineComponent, PropType} from "vue";
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
    IonModal
  },
  props: {
    categories: {
      type: Array as PropType<Category[]>,
      required: true
    },
    isOpen: {
      type: Boolean,
      required: true
    },
    priceFilters: {
      type: Array as PropType<PriceFilter[]>,
      required: true
    },
    selectedCategory: {
      type: String,
      required: true
    },
    selectedPriceFilter: {
      type: String as PropType<PriceFilterId>,
      required: true
    },
    selectedPriceFilterLabel: {
      type: String,
      required: true
    },
    subscriptionsCount: {
      type: Number,
      required: true
    }
  },
  emits: ["close", "reset", "select-category", "select-price-filter"],
  data() {
    return {
      style
    };
  }
});
</script>
