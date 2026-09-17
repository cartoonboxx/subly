<template>
  <article :key="subscription.name" :class="style.subscriptionItem">
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
    subscription: {
      type: Object as PropType<Subscription>,
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
