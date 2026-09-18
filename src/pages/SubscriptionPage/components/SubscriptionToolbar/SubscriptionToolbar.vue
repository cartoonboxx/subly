<template>
  <section :class="style.toolbar" aria-label="Фильтры подписок">
    <ion-input
      :model-value="searchQuery"
      :class="style.searchBox"
      clear-input
      placeholder="Поиск подписки"
      @update:modelValue="$emit('update:search-query', $event)"
    >
      <ion-icon slot="start" :icon="searchOutline" />
    </ion-input>

    <FilterModal
      :categories="categories"
      :subscriptions-count="subscriptionsCount"
      @change="$emit('change-filters', $event)"
    />
  </section>
</template>

<script lang="ts">
import {IonIcon, IonInput} from "@ionic/vue";
import {defineComponent, PropType} from "vue";
import {searchOutline} from "ionicons/icons";
import FilterModal from "../FilterModal/FilterModal.vue";
import style from "./SubscriptionToolbar.module.scss";

export default defineComponent({
  name: "SubscriptionToolbar",
  components: {
    FilterModal,
    IonIcon,
    IonInput
  },
  props: {
    categories: {
      type: Array as PropType<Category[]>,
      required: true
    },
    searchQuery: {
      type: String,
      required: true
    },
    subscriptionsCount: {
      type: Number,
      required: true
    }
  },
  emits: ["change-filters", "update:search-query"],
  data() {
    return {
      searchOutline,
      style
    };
  }
});
</script>
