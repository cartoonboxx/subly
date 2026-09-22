<template>
  <section :class="style.section">
    <UiSectionHeader eyebrow="Список" :title="title">
      <template #meta>
        <span class="ui-section-meta">По списанию</span>
      </template>
    </UiSectionHeader>

    <div :class="style.subscriptionList">
      <section
        v-for="monthGroup in monthGroups"
        :key="monthGroup.name"
        :class="style.monthGroup"
      >
        <div :class="style.monthHeader">
          <h3>{{ monthGroup.name }}</h3>
          <span>{{ monthGroup.subscriptions.length }}</span>
        </div>

        <SubscriptionCard
          v-for="subscription in monthGroup.subscriptions"
          :key="subscription.id"
          is-interactive
          :subscription="subscription"
          @select="$emit('select-subscription', subscription)"
        />
      </section>

      <UiEmptyState v-if="!subscriptionsCount" compact>
        Подписок не найдено
      </UiEmptyState>
    </div>
  </section>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
import SubscriptionCard from "@/components/SubscriptionCard/SubscriptionCard.vue";
import UiEmptyState from "@/components/ui/UiEmptyState/UiEmptyState.vue";
import UiSectionHeader from "@/components/ui/UiSectionHeader/UiSectionHeader.vue";
import style from "./SubscriptionMonthList.module.scss";

type SubscriptionMonthGroup = {
  name: string;
  order: number;
  subscriptions: Subscription[];
};

export default defineComponent({
  name: "SubscriptionMonthList",
  components: {
    SubscriptionCard,
    UiEmptyState,
    UiSectionHeader
  },
  props: {
    monthGroups: {
      type: Array as PropType<SubscriptionMonthGroup[]>,
      required: true
    },
    subscriptionsCount: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  },
  emits: ["select-subscription"],
  data() {
    return {
      style
    };
  }
});
</script>
