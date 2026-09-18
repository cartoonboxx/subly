<template>
  <section :class="style.section">
    <div :class="style.sectionHeader">
      <div>
        <span :class="style.eyebrow">Список</span>
        <h2>{{ title }}</h2>
      </div>

      <span>По списанию</span>
    </div>

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

      <p v-if="!subscriptionsCount" :class="style.emptyState">
        Подписок не найдено
      </p>
    </div>
  </section>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
import SubscriptionCard from "@/components/SubscriptionCard/SubscriptionCard.vue";
import style from "./SubscriptionMonthList.module.scss";

type SubscriptionMonthGroup = {
  name: string;
  order: number;
  subscriptions: Subscription[];
};

export default defineComponent({
  name: "SubscriptionMonthList",
  components: {
    SubscriptionCard
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
