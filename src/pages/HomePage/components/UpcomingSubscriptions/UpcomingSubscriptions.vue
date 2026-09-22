<template>
  <section :class="style.section">
    <UiSectionHeader eyebrow="Скоро" title="Ближайшие списания">
      <template #meta>
        <UiButton variant="soft" :class="style.buttonAll" @click="$emit('open-subscriptions')">
          Все
        </UiButton>
      </template>
    </UiSectionHeader>

    <div :class="style.subscriptionList">
      <SubscriptionCard
        v-for="subscription in subscriptions"
        :key="subscription.id"
        is-interactive
        :subscription="subscription"
        @select="$emit('select-subscription', subscription)"
      />
      <UiEmptyState v-if="subscriptions.length === 0" compact>
        Ближайших списаний пока нет
      </UiEmptyState>
    </div>
  </section>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
import SubscriptionCard from "@/components/SubscriptionCard/SubscriptionCard.vue";
import UiButton from "@/components/ui/UiButton/UiButton.vue";
import UiEmptyState from "@/components/ui/UiEmptyState/UiEmptyState.vue";
import UiSectionHeader from "@/components/ui/UiSectionHeader/UiSectionHeader.vue";
import style from "./UpcomingSubscriptions.module.scss";

export default defineComponent({
  name: "UpcomingSubscriptions",
  components: {
    SubscriptionCard,
    UiButton,
    UiEmptyState,
    UiSectionHeader
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
