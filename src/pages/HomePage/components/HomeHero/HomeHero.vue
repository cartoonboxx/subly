<template>
  <section :class="style.hero">
    <UiPageHeader eyebrow="Subly" title="Главная">
      <template #action>
        <UiIconButton :icon="notificationsOutline" label="Уведомления" />
      </template>
    </UiPageHeader>

    <UiSummaryCard
      interactive
      :class="style.summaryCard"
      tone="green"
      @click="$emit('open-statistics')"
    >
      <div :class="style.summaryTop">
        <span>Будет потрачено в {{ monthLabel }}</span>
        <UiBadge tone="glass">Итог месяца</UiBadge>
      </div>

      <div :class="style.totalRow">
        <strong>{{ totalLabel }}</strong>
        <span>{{ subscriptionsCount }} подписок</span>
      </div>

      <div :class="style.progressTrack">
        <span :class="style.progressBar" :style="progressStyle" />
      </div>

      <div :class="style.summaryBottom">
        <span>Уже списано {{ spentTotalLabel }}</span>
        <span>Осталось {{ remainingTotalLabel }}</span>
      </div>
    </UiSummaryCard>
  </section>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {notificationsOutline} from "ionicons/icons";
import UiBadge from "@/components/ui/UiBadge/UiBadge.vue";
import UiIconButton from "@/components/ui/UiIconButton/UiIconButton.vue";
import UiPageHeader from "@/components/ui/UiPageHeader/UiPageHeader.vue";
import UiSummaryCard from "@/components/ui/UiSummaryCard/UiSummaryCard.vue";
import style from "./HomeHero.module.scss";

export default defineComponent({
  name: "HomeHero",
  components: {
    UiBadge,
    UiIconButton,
    UiPageHeader,
    UiSummaryCard
  },
  props: {
    subscriptionsCount: {
      type: Number,
      required: true
    },
    monthLabel: {
      type: String,
      required: true
    },
    progress: {
      type: Number,
      required: true
    },
    remainingTotal: {
      type: Number,
      required: true
    },
    spentTotal: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  emits: ["open-statistics"],
  data() {
    return {
      notificationsOutline,
      style
    };
  },
  computed: {
    remainingTotalLabel() {
      return this.$settingsStore.formatCurrency(this.remainingTotal);
    },
    progressStyle() {
      return {
        width: `${Math.min(Math.max(this.progress, 0), 100)}%`
      };
    },
    spentTotalLabel() {
      return this.$settingsStore.formatCurrency(this.spentTotal);
    },
    totalLabel() {
      return this.$settingsStore.formatCurrency(this.total);
    }
  }
});
</script>
