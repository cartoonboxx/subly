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
import HomeHero from "./components/HomeHero/HomeHero.vue";
import HomeStats from "./components/HomeStats/HomeStats.vue";
import UpcomingSubscriptions from "./components/UpcomingSubscriptions/UpcomingSubscriptions.vue";

type CalendarMonth = {
  shortLabel: string;
  label: string;
  dateName: string;
};

type ParsedSubscriptionDate = {
  day: number;
  monthIndex: number;
};

const calendarMonths: CalendarMonth[] = [
  {shortLabel: "янв", label: "январе", dateName: "января"},
  {shortLabel: "фев", label: "феврале", dateName: "февраля"},
  {shortLabel: "мар", label: "марте", dateName: "марта"},
  {shortLabel: "апр", label: "апреле", dateName: "апреля"},
  {shortLabel: "мая", label: "мае", dateName: "мая"},
  {shortLabel: "июн", label: "июне", dateName: "июня"},
  {shortLabel: "июл", label: "июле", dateName: "июля"},
  {shortLabel: "авг", label: "августе", dateName: "августа"},
  {shortLabel: "сен", label: "сентябре", dateName: "сентября"},
  {shortLabel: "окт", label: "октябре", dateName: "октября"},
  {shortLabel: "ноя", label: "ноябре", dateName: "ноября"},
  {shortLabel: "дек", label: "декабре", dateName: "декабря"}
];

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
    },
    parseSubscriptionDate(date: string): ParsedSubscriptionDate | null {
      const normalizedDate = date.trim().toLowerCase();
      const dateParts = normalizedDate.match(/^(\d{1,2})\s+(.+)$/);

      if (!dateParts) {
        return null;
      }

      const day = Number(dateParts[1]);
      const monthIndex = calendarMonths.findIndex((month) => {
        return month.dateName === dateParts[2];
      });

      if (!Number.isInteger(day) || day < 1 || day > 31 || monthIndex === -1) {
        return null;
      }

      return {
        day,
        monthIndex
      };
    },
    getNextPaymentDate(subscription: Subscription) {
      const parsedDate = this.parseSubscriptionDate(subscription.date);

      if (!parsedDate) {
        return null;
      }

      const currentYear = this.currentDate.getFullYear();
      const today = new Date(
        currentYear,
        this.currentMonthIndex,
        this.currentDay
      );
      const paymentDate = new Date(
        currentYear,
        parsedDate.monthIndex,
        parsedDate.day
      );

      if (subscription.period === "разовая") {
        return paymentDate >= today ? paymentDate : null;
      }

      if (paymentDate < today) {
        paymentDate.setFullYear(currentYear + 1);
      }

      return paymentDate;
    },
    getShortPaymentLabel(paymentDate: Date) {
      const day = paymentDate.getDate();
      const monthLabel =
        calendarMonths[paymentDate.getMonth()]?.shortLabel ?? "";

      return monthLabel ? `${day} ${monthLabel}` : `${day}`;
    },
    parseTransactionDate(date: string) {
      const parsedDate = new Date(`${date}T00:00:00`);

      return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
    }
  },
  computed: {
    subscriptions() {
      return this.allSubscriptions
        .map((subscription) => {
          return {
            subscription,
            nextPaymentDate: this.getNextPaymentDate(subscription)
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
      return calendarMonths[this.currentMonthIndex]?.label ?? "месяце";
    },
    currentMonthSubscriptions() {
      return this.allSubscriptions.filter((subscription) => {
        const parsedDate = this.parseSubscriptionDate(subscription.date);

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
              const transactionDate = this.parseTransactionDate(
                transaction.date
              );

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
        const parsedDate = this.parseSubscriptionDate(subscription.date);

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

      const nextPaymentDate = this.getNextPaymentDate(nextSubscription);

      return nextPaymentDate ? this.getShortPaymentLabel(nextPaymentDate) : "—";
    }
  }
});
</script>
