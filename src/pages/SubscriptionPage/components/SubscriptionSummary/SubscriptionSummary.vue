<template>
  <UiSummaryCard tag="section" :class="style.summaryCard" tone="dark">
    <div :class="style.summaryTop">
      <span>Активные подписки</span>
      <strong>{{ subscriptionsCount }}</strong>
    </div>

    <div :class="style.summaryGrid">
      <div>
        <span>В месяц</span>
        <strong>{{ monthlyTotalLabel }}</strong>
      </div>

      <div>
        <span>Следующее</span>
        <strong>{{ nextPaymentLabel }}</strong>
      </div>
    </div>
  </UiSummaryCard>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import UiSummaryCard from "@/components/ui/UiSummaryCard/UiSummaryCard.vue";
import style from "./SubscriptionSummary.module.scss";

export default defineComponent({
  name: "SubscriptionSummary",
  components: {
    UiSummaryCard
  },
  props: {
    monthlyTotal: {
      type: Number,
      required: true
    },
    nextPaymentLabel: {
      type: String,
      required: true
    },
    subscriptionsCount: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      style
    };
  },
  computed: {
    monthlyTotalLabel() {
      return this.$settingsStore.formatCurrency(this.monthlyTotal);
    }
  }
});
</script>
