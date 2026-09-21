<template>
  <PageContainer>
    <SubscriptionHeader :categories="categories" />

    <SubscriptionSummary
      :monthly-total="activeSubscriptionsMonthlyTotal"
      :next-payment-label="nextPaymentLabel"
      :subscriptions-count="activeSubscriptions.length"
    />

    <SubscriptionToolbar
      :active-count="activeSubscriptions.length"
      :categories="categories"
      :inactive-count="inactiveSubscriptions.length"
      :search-query="searchQuery"
      :status-filter="statusFilter"
      :subscriptions-count="subscriptions.length"
      @change-filters="updateFilters"
      @update:status-filter="updateStatusFilter"
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
import {
  calendarMonths,
  getNextPaymentDate,
  parseSubscriptionDate,
  parseTransactionDate
} from "@/utils/subscriptionBilling";
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

type StatusFilter = "active" | "inactive" | "all";

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
      searchQuery: "",
      statusFilter: "active" as StatusFilter
    };
  },
  methods: {
    updateFilters(filters: SubscriptionFilters) {
      this.activeFilters = filters;
    },
    updateStatusFilter(statusFilter: StatusFilter) {
      this.statusFilter = statusFilter;
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
      const monthIndex = parseSubscriptionDate(date)?.monthIndex ?? -1;

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
    activeSubscriptions() {
      return this.allSubscriptions.filter((subscription) => {
        return subscription.isActive;
      });
    },
    inactiveSubscriptions() {
      return this.allSubscriptions.filter((subscription) => {
        return !subscription.isActive;
      });
    },
    subscriptions() {
      const normalizedQuery = this.searchQuery.trim().toLowerCase();

      return this.allSubscriptions.filter((subscription) => {
        const isSelectedStatus =
          this.statusFilter === "all" ||
          (this.statusFilter === "active" && subscription.isActive) ||
          (this.statusFilter === "inactive" && !subscription.isActive);
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

        return (
          isSelectedStatus &&
          isSelectedCategory &&
          isSearchMatched &&
          isPriceMatched
        );
      });
    },
    categories() {
      return this.$subscriptionStore.categories;
    },
    currentDate() {
      return new Date();
    },
    currentDay() {
      return this.currentDate.getDate();
    },
    currentMonthIndex() {
      return this.currentDate.getMonth();
    },
    currentYear() {
      return this.currentDate.getFullYear();
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
    activeSubscriptionsMonthlyTotal() {
      const spentTotal = this.activeSubscriptions.reduce(
        (total, subscription) => {
          const currentMonthTransactions = subscription.transactions.filter(
            (transaction) => {
              const transactionDate = parseTransactionDate(transaction.date);

              return (
                transactionDate &&
                transactionDate.getFullYear() === this.currentYear &&
                transactionDate.getMonth() === this.currentMonthIndex
              );
            }
          );

          return total + currentMonthTransactions.length * subscription.price;
        },
        0
      );
      const remainingTotal = this.activeSubscriptions.reduce(
        (total, subscription) => {
          const parsedDate = parseSubscriptionDate(subscription.date);

          if (
            !parsedDate ||
            parsedDate.monthIndex !== this.currentMonthIndex ||
            parsedDate.day <= this.currentDay
          ) {
            return total;
          }

          if (
            subscription.period === "разовая" &&
            parsedDate.monthIndex !== this.currentMonthIndex
          ) {
            return total;
          }

          return total + subscription.price;
        },
        0
      );

      return spentTotal + remainingTotal;
    },
    nextPaymentLabel() {
      const nextPayment = this.activeSubscriptions
        .map((subscription) => {
          return {
            date: getNextPaymentDate(subscription, this.currentDate),
            subscription
          };
        })
        .filter((item): item is {date: Date; subscription: Subscription} => {
          return item.date !== null;
        })
        .sort((firstItem, secondItem) => {
          return firstItem.date.getTime() - secondItem.date.getTime();
        })[0];

      return nextPayment ? `${nextPayment.subscription.price} ₽` : "—";
    },
    subscriptionListTitle() {
      const statusTitle = {
        active: "Активные подписки",
        inactive: "Неактивные подписки",
        all: "Все подписки"
      }[this.statusFilter];

      return this.activeFilters.category === "Все"
        ? statusTitle
        : `${statusTitle}: ${this.activeFilters.category}`;
    }
  }
});
</script>
