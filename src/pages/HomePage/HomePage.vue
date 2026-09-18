<template>
  <PageContainer>
    <HomeHero
      :subscriptions-count="allSubscriptions.length"
      :total="subscriptionsTotal"
      @open-statistics="openStatisticsPage"
    />

    <HomeStats
      :most-expensive-price="mostExpensiveSub"
      @open-statistics="openStatisticsPage"
    />

    <UpcomingSubscriptions
      :subscriptions="subscriptions"
      @open-subscriptions="openSubscriptionsPage"
      @select-subscription="editSubscription"
    />

    <AddSubscriptionModal
      :categories="categories"
      :editable-subscription="editableSubscription"
      :show-button="false"
      @close-edit="clearEditableSubscription"
    />
  </PageContainer>
</template>

<script lang="ts">
import PageContainer from "@/layout/PageContainer/PageContainer.vue";
import {defineComponent} from "vue";
import AddSubscriptionModal from "@/pages/SubscriptionPage/components/AddSubscriptionModal/AddSubscriptionModal.vue";
import HomeHero from "./components/HomeHero/HomeHero.vue";
import HomeStats from "./components/HomeStats/HomeStats.vue";
import UpcomingSubscriptions from "./components/UpcomingSubscriptions/UpcomingSubscriptions.vue";

export default defineComponent({
  components: {
    AddSubscriptionModal,
    HomeHero,
    HomeStats,
    PageContainer,
    UpcomingSubscriptions
  },
  data() {
    return {
      editableSubscription: null as Subscription | null
    };
  },
  methods: {
    editSubscription(subscription: Subscription) {
      this.editableSubscription = subscription;
    },
    clearEditableSubscription() {
      this.editableSubscription = null;
    },
    openStatisticsPage() {
      this.$router.push("/statistics");
    },
    openSubscriptionsPage() {
      this.$router.push("/subscriptions");
    }
  },
  computed: {
    subscriptions() {
      return this.$subscriptionStore.subscriptions.slice(0, 3);
    },
    allSubscriptions() {
      return this.$subscriptionStore.subscriptions;
    },
    categories() {
      return this.$subscriptionStore.categories;
    },
    subscriptionsTotal() {
      return this.$subscriptionStore.sumSubscriptions();
    },
    mostExpensiveSub() {
      return this.allSubscriptions.reduce((maxPrice, subscription) => {
        return Math.max(maxPrice, subscription.price);
      }, 0);
    }
  }
});
</script>
