<template>
  <PageContainer>
    <HomeHero
      :month-label="currentMonthLabel"
      :progress="monthSpendingProgress"
      :remaining-total="remainingMonthlyTotal"
      :spent-total="spentMonthlyTotal"
      :subscriptions-count="currentMonthSubscriptions.length"
      :total="currentMonthTotal"
      @open-statistics="openStatisticsPage"
    />

    <HomeStats
      :most-expensive-label="mostExpensiveLabel"
      :next-payment-label="nextPaymentLabel"
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
import {
  calendarMonths,
  formatShortDate,
  getNextPaymentDate,
  parseSubscriptionDate,
  parseTransactionDate
} from "@/utils/subscriptionBilling";
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
      return this.allSubscriptions
        .map((subscription) => {
          return {
            subscription,
            nextPaymentDate: getNextPaymentDate(subscription, this.currentDate)
          };
        })
        .filter(
          (
            item
          ): item is {subscription: Subscription; nextPaymentDate: Date} => {
            return item.nextPaymentDate !== null;
          }
        )
        .sort((firstItem, secondItem) => {
          return (
            firstItem.nextPaymentDate.getTime() -
            secondItem.nextPaymentDate.getTime()
          );
        })
        .slice(0, 3)
        .map((item) => {
          return item.subscription;
        });
    },
    allSubscriptions() {
      return this.$subscriptionStore.subscriptions.filter((item) => {
        return item.isActive;
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
    currentMonthLabel() {
      return (
        calendarMonths[this.currentMonthIndex]?.prepositionalName ?? "месяце"
      );
    },
    currentMonthSubscriptions() {
      return this.allSubscriptions.filter((subscription) => {
        const parsedDate = parseSubscriptionDate(subscription.date);

        return parsedDate?.monthIndex === this.currentMonthIndex;
      });
    },
    currentMonthTotal() {
      return this.spentMonthlyTotal + this.remainingMonthlyTotal;
    },
    spentMonthlyTotal() {
      return this.$subscriptionStore.subscriptions.reduce(
        (total, subscription) => {
          const currentMonthTransactions = subscription.transactions.filter(
            (transaction) => {
              const transactionDate = parseTransactionDate(transaction.date);

              return (
                transactionDate &&
                transactionDate.getFullYear() ===
                  this.currentDate.getFullYear() &&
                transactionDate.getMonth() === this.currentMonthIndex
              );
            }
          );

          return total + currentMonthTransactions.length * subscription.price;
        },
        0
      );
    },
    remainingMonthlyTotal() {
      return this.currentMonthSubscriptions.reduce((total, subscription) => {
        const parsedDate = parseSubscriptionDate(subscription.date);

        if (!parsedDate || parsedDate.day <= this.currentDay) {
          return total;
        }

        if (
          subscription.period === "разовая" &&
          parsedDate.monthIndex !== this.currentMonthIndex
        ) {
          return total;
        }

        return total + subscription.price;
      }, 0);
    },
    monthSpendingProgress() {
      if (!this.currentMonthTotal) {
        return 0;
      }

      return Math.round(
        (this.spentMonthlyTotal / this.currentMonthTotal) * 100
      );
    },
    mostExpensiveSub() {
      return this.allSubscriptions.reduce((maxPrice, subscription) => {
        return Math.max(maxPrice, subscription.price);
      }, 0);
    },
    mostExpensiveLabel() {
      return this.mostExpensiveSub ? `${this.mostExpensiveSub} ₽` : "—";
    },
    nextPaymentLabel() {
      const nextSubscription = this.subscriptions[0];

      if (!nextSubscription) {
        return "—";
      }

      const nextPaymentDate = getNextPaymentDate(
        nextSubscription,
        this.currentDate
      );

      return nextPaymentDate ? formatShortDate(nextPaymentDate) : "—";
    }
  }
});
</script>
