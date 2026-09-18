<template>
  <article
    :key="subscription.name"
    :class="[style.subscriptionItem, isInteractive ? style.interactive : null]"
    :tabindex="isInteractive ? 0 : undefined"
    @click="selectSubscription"
    @keydown.enter="selectSubscription"
    @keydown.space.prevent="selectSubscription"
  >
    <div :class="[style.serviceIcon, style[subscription.colorClass]]">
      <ion-icon :icon="subscription.icon" />
    </div>

    <div :class="style.serviceInfo">
      <strong>{{ subscription.name }}</strong>
      <span>{{ subscription.date }}</span>
    </div>

    <div :class="style.priceInfo">
      <strong>{{ subscription.price }} ₽</strong>
      <span>{{ subscription.period }}</span>
    </div>
  </article>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
import {IonIcon} from "@ionic/vue";
import style from "./SubscriptionCard.module.scss";

export default defineComponent({
  name: "SubscriptionCard",
  components: {IonIcon},
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
