<template>
  <section :class="style.section">
    <div :class="style.sectionHeader">
      <div>
        <span :class="style.eyebrow">Скоро</span>
        <h2>Ближайшие списания</h2>
      </div>

      <ion-button
        fill="clear"
        size="small"
        :class="style.buttonAll"
        @click="$emit('open-subscriptions')"
      >
        Все
      </ion-button>
    </div>

    <div :class="style.subscriptionList">
      <SubscriptionCard
        v-for="subscription in subscriptions"
        :key="subscription.id"
        is-interactive
        :subscription="subscription"
        @select="$emit('select-subscription', subscription)"
      />
    </div>
  </section>
</template>

<script lang="ts">
import {IonButton} from "@ionic/vue";
import {defineComponent, PropType} from "vue";
import SubscriptionCard from "@/components/SubscriptionCard/SubscriptionCard.vue";
import style from "./UpcomingSubscriptions.module.scss";

export default defineComponent({
  name: "UpcomingSubscriptions",
  components: {
    IonButton,
    SubscriptionCard
  },
  props: {
    subscriptions: {
      type: Array as PropType<Subscription[]>,
      required: true
    }
  },
  emits: ["open-subscriptions", "select-subscription"],
  data() {
    return {
      style
    };
  }
});
</script>
