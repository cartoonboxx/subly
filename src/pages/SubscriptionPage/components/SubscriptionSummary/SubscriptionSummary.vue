<template>
  <section :class="style.summaryCard">
    <div :class="style.summaryTop">
      <span>Активные подписки</span>
      <strong>{{ subscriptionsCount }}</strong>
    </div>

    <div :class="style.summaryGrid">
      <div>
        <span>В месяц</span>
        <strong>{{ monthlyTotal }} ₽</strong>
      </div>

      <div>
        <span>Следующее</span>
        <strong>{{ nextPaymentLabel }}</strong>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import style from "./SubscriptionSummary.module.scss";

export default defineComponent({
  name: "SubscriptionSummary",
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
  }
});
</script>
