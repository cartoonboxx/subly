<template>
  <UiCard
    :key="subscription.name"
    tag="article"
    padding="sm"
    :class="style.subscriptionItem"
    :interactive="isInteractive"
    :tabindex="isInteractive ? 0 : undefined"
    @click="selectSubscription"
    @keydown.enter="selectSubscription"
    @keydown.space.prevent="selectSubscription"
  >
    <UiServiceIcon
      :color-class="subscription.colorClass"
      :icon="subscription.icon"
      size="lg"
    />

    <div :class="style.serviceInfo">
      <div :class="style.serviceTitle">
        <strong>{{ subscription.name }}</strong>
        <UiBadge :tone="subscription.isActive ? 'success' : 'neutral'">
          {{ statusLabel }}
        </UiBadge>
      </div>
      <span>{{ subscriptionMetaLabel }}</span>
    </div>

    <div :class="style.priceInfo">
      <strong>{{ priceLabel }}</strong>
      <span>{{ subscription.period }}</span>
    </div>
  </UiCard>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
import UiBadge from "@/components/ui/UiBadge/UiBadge.vue";
import UiCard from "@/components/ui/UiCard/UiCard.vue";
import UiServiceIcon from "@/components/ui/UiServiceIcon/UiServiceIcon.vue";
import {formatShortDate, parseIsoDate} from "@/utils/subscriptionBilling";
import style from "./SubscriptionCard.module.scss";

export default defineComponent({
  name: "SubscriptionCard",
  components: {
    UiBadge,
    UiCard,
    UiServiceIcon
  },
  props: {
    isInteractive: {
      type: Boolean,
      default: false
    },
    subscription: {
      type: Object as PropType<Subscription>,
      required: true
    }
  },
  emits: ["select"],
  data() {
    return {
      style
    };
  },
  computed: {
    reminderLabel() {
      return `напомнить за ${this.subscription.reminderDays} дн.`;
    },
    expirationLabel() {
      if (!this.subscription.expiresAt) {
        return "";
      }

      const expirationDate = parseIsoDate(this.subscription.expiresAt);

      return expirationDate ? `до ${formatShortDate(expirationDate)}` : "";
    },
    priceLabel() {
      return this.$settingsStore.formatCurrency(this.subscription.price);
    },
    statusLabel() {
      return this.subscription.isActive ? "Активна" : "Неактивна";
    },
    subscriptionMetaLabel() {
      return [this.subscription.date, this.expirationLabel, this.reminderLabel]
        .filter(Boolean)
        .join(" · ");
    }
  },
  methods: {
    selectSubscription() {
      if (!this.isInteractive) {
        return;
      }

      this.$emit("select", this.subscription);
    }
  }
});
</script>
