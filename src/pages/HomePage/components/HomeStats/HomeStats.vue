<template>
  <section :class="style.statsGrid" aria-label="Краткая статистика">
    <StatisticsCard
      :icon="calendarOutline"
      title="Следующее"
      :subtitle="nextPaymentLabel"
      @click="$emit('open-statistics')"
    />

    <StatisticsCard
      :icon="diamondOutline"
      title="Самая дорогая"
      :subtitle="mostExpensiveLabel"
      @click="$emit('open-statistics')"
    />
  </section>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {calendarOutline, diamondOutline} from "ionicons/icons";
import StatisticsCard from "@/components/StatisticsCard/StatisticsCard.vue";
import style from "./HomeStats.module.scss";

export default defineComponent({
  name: "HomeStats",
  components: {
    StatisticsCard
  },
  props: {
    mostExpensiveLabel: {
      type: String,
      required: true
    },
    nextPaymentLabel: {
      type: String,
      required: true
    }
  },
  emits: ["open-statistics"],
  data() {
    return {
      calendarOutline,
      diamondOutline,
      style
    };
  }
});
</script>
