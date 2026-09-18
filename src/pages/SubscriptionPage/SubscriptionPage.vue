<template>
  <PageContainer>
    <SubscriptionHeader :categories="categories" />

    <SubscriptionSummary
      :monthly-total="subscriptionsMonthlyTotal"
      :next-payment-label="nextPaymentLabel"
      :subscriptions-count="subscriptions.length"
    />

    <SubscriptionToolbar
      :categories="categories"
      :search-query="searchQuery"
      :subscriptions-count="subscriptions.length"
      @change-filters="updateFilters"
      @update:search-query="updateSearchQuery"
    />

    <SubscriptionMonthList
      :month-groups="subscriptionMonthGroups"
      :subscriptions-count="subscriptions.length"
      :title="subscriptionListTitle"
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
import AddSubscriptionModal from "./components/AddSubscriptionModal/AddSubscriptionModal.vue";
import SubscriptionHeader from "./components/SubscriptionHeader/SubscriptionHeader.vue";
import SubscriptionMonthList from "./components/SubscriptionMonthList/SubscriptionMonthList.vue";
import SubscriptionSummary from "./components/SubscriptionSummary/SubscriptionSummary.vue";
import SubscriptionToolbar from "./components/SubscriptionToolbar/SubscriptionToolbar.vue";

type SubscriptionMonthGroup = {
  name: string;
  order: number;
  subscriptions: Subscription[];
};

type SubscriptionFilters = {
  category: string;
  min: number | null;
  max: number | null;
};

const calendarMonths = [
  {name: "Январь", dateName: "января"},
  {name: "Февраль", dateName: "февраля"},
  {name: "Март", dateName: "марта"},
  {name: "Апрель", dateName: "апреля"},
  {name: "Май", dateName: "мая"},
  {name: "Июнь", dateName: "июня"},
  {name: "Июль", dateName: "июля"},
  {name: "Август", dateName: "августа"},
  {name: "Сентябрь", dateName: "сентября"},
  {name: "Октябрь", dateName: "октября"},
  {name: "Ноябрь", dateName: "ноября"},
  {name: "Декабрь", dateName: "декабря"}
];

export default defineComponent({
  name: "SubscriptionPage",
  components: {
    AddSubscriptionModal,
    PageContainer,
    SubscriptionHeader,
    SubscriptionMonthList,
    SubscriptionSummary,
    SubscriptionToolbar
  },
  data() {
    return {
      activeFilters: {
        category: "Все",
        min: null,
        max: null
      } as SubscriptionFilters,
      editableSubscription: null as Subscription | null,
      searchQuery: ""
    };
  },
  methods: {
    updateFilters(filters: SubscriptionFilters) {
      this.activeFilters = filters;
    },
    updateSearchQuery(query: string | number | null | undefined) {
      this.searchQuery = String(query ?? "");
    },
    editSubscription(subscription: Subscription) {
      this.editableSubscription = subscription;
    },
    clearEditableSubscription() {
      this.editableSubscription = null;
    },
    getSubscriptionMonth(date: string) {
      const normalizedDate = date.toLowerCase();
      const monthIndex = calendarMonths.findIndex((month) => {
        return normalizedDate.includes(month.dateName);
      });

      return monthIndex === -1
        ? {name: "Без месяца", order: calendarMonths.length}
        : {
            name: calendarMonths[monthIndex].name,
            order: monthIndex
          };
    }
  },
  computed: {
    allSubscriptions() {
      return this.$subscriptionStore.subscriptions;
    },
    subscriptions() {
      const normalizedQuery = this.searchQuery.trim().toLowerCase();

      return this.allSubscriptions.filter((subscription) => {
        const isSelectedCategory =
          this.activeFilters.category === "Все" ||
          subscription.category?.name === this.activeFilters.category;
        const isSearchMatched =
          !normalizedQuery ||
          subscription.name.toLowerCase().includes(normalizedQuery) ||
          subscription.category?.name.toLowerCase().includes(normalizedQuery);
        const isPriceMatched =
          (!this.activeFilters.min ||
            subscription.price >= this.activeFilters.min) &&
          (!this.activeFilters.max ||
            subscription.price <= this.activeFilters.max);

        return isSelectedCategory && isSearchMatched && isPriceMatched;
      });
    },
    categories() {
      return this.$subscriptionStore.categories;
    },
    subscriptionMonthGroups() {
      const groups = new Map<string, SubscriptionMonthGroup>();

      this.subscriptions.forEach((subscription) => {
        const month = this.getSubscriptionMonth(subscription.date);
        const currentGroup = groups.get(month.name);

        if (currentGroup) {
          currentGroup.subscriptions.push(subscription);
          return;
        }

        groups.set(month.name, {
          name: month.name,
          order: month.order,
          subscriptions: [subscription]
        });
      });

      return Array.from(groups.values()).sort((firstGroup, secondGroup) => {
        return firstGroup.order - secondGroup.order;
      });
    },
    subscriptionsMonthlyTotal() {
      return this.subscriptions.reduce((total, subscription) => {
        return total + subscription.price;
      }, 0);
    },
    nextPaymentLabel() {
      const nextSubscription = this.subscriptions[0];

      return nextSubscription ? `${nextSubscription.price} ₽` : "—";
    },
    subscriptionListTitle() {
      return this.activeFilters.category === "Все"
        ? "Все подписки"
        : this.activeFilters.category;
    }
  }
});
</script>
