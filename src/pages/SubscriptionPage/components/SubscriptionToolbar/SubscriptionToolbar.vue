<template>
  <section :class="style.toolbar" aria-label="Фильтры подписок">
    <div :class="style.searchRow">
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
    </div>

    <UiCard
      tag="div"
      padding="none"
      :class="style.statusTabs"
      aria-label="Статус подписок"
    >
      <button
        v-for="statusOption in statusOptions"
        :key="statusOption.value"
        type="button"
        :class="[
          style.statusTab,
          statusFilter === statusOption.value ? style.activeStatusTab : null
        ]"
        @click="$emit('update:status-filter', statusOption.value)"
      >
        <span>{{ statusOption.label }}</span>
        <strong>{{ statusOption.count }}</strong>
      </button>
    </UiCard>
  </section>
</template>

<script lang="ts">
import {IonIcon, IonInput} from "@ionic/vue";
import {defineComponent, PropType} from "vue";
import {searchOutline} from "ionicons/icons";
import FilterModal from "../FilterModal/FilterModal.vue";
import UiCard from "@/components/ui/UiCard/UiCard.vue";
import style from "./SubscriptionToolbar.module.scss";

type StatusFilter = "active" | "inactive" | "all";

export default defineComponent({
  name: "SubscriptionToolbar",
  components: {
    FilterModal,
    IonIcon,
    IonInput,
    UiCard
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
    activeCount: {
      type: Number,
      required: true
    },
    inactiveCount: {
      type: Number,
      required: true
    },
    statusFilter: {
      type: String as PropType<StatusFilter>,
      required: true
    },
    subscriptionsCount: {
      type: Number,
      required: true
    }
  },
  emits: ["change-filters", "update:search-query", "update:status-filter"],
  data() {
    return {
      searchOutline,
      style
    };
  },
  computed: {
    statusOptions() {
      return [
        {
          label: "Активные",
          value: "active",
          count: this.activeCount
        },
        {
          label: "Неактивные",
          value: "inactive",
          count: this.inactiveCount
        },
        {
          label: "Все",
          value: "all",
          count: this.activeCount + this.inactiveCount
        }
      ];
    }
  }
});
</script>
