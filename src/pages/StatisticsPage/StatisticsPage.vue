<template>
  <PageContainer>
    <section :class="style.hero">
      <UiPageHeader eyebrow="Аналитика" title="Статистика" />

      <UiSummaryCard :class="style.summaryCard" tone="teal">
        <div :class="style.summaryTop">
          <span>Прогноз расходов</span>
          <UiBadge tone="glass">
            {{ activeSubscriptions.length }} активных
          </UiBadge>
        </div>

        <div :class="style.totalRow">
          <strong>{{ formatCurrency(monthlyRunRate) }}</strong>
          <span>в месяц</span>
        </div>

        <div :class="style.summaryGrid">
          <div>
            <span>В этом месяце</span>
            <strong>{{ formatCurrency(currentMonthTotal) }}</strong>
          </div>

          <div>
            <span>За год</span>
            <strong>{{ formatCurrency(yearlyForecast) }}</strong>
          </div>
        </div>
      </UiSummaryCard>
    </section>

    <section :class="style.statsGrid" aria-label="Ключевые показатели">
      <StatisticsCard
        :icon="walletOutline"
        title="Уже списано"
        :subtitle="formatCurrency(spentThisMonth)"
      />

      <StatisticsCard
        :icon="calendarClearOutline"
        title="Осталось"
        :subtitle="formatCurrency(remainingThisMonth)"
      />

      <StatisticsCard
        :icon="trendingUpOutline"
        title="Неактивные"
        :subtitle="`${inactiveSubscriptions.length}`"
      />
    </section>

    <UiEmptyState
      v-if="subscriptions.length === 0"
      :icon="analyticsOutline"
      title="Нет данных для статистики"
    >
        Добавьте подписку, чтобы увидеть прогноз расходов, категории и историю
        списаний.
    </UiEmptyState>

    <template v-else>
      <section :class="style.section">
        <UiSectionHeader eyebrow="Структура" title="Расходы по категориям" />

        <div v-if="categoryStats.length > 0" :class="style.categoryList">
          <UiCard
            v-for="category in categoryStats"
            :key="category.name"
            :class="style.barItem"
          >
            <div :class="style.barTop">
              <span>{{ category.name }}</span>
              <strong>{{ formatCurrency(category.total) }}</strong>
            </div>
            <div :class="style.barTrack">
              <span
                :class="style.barFill"
                :style="barStyle(category.percent)"
              />
            </div>
            <small>{{ category.percent }}% от месячного прогноза</small>
          </UiCard>
        </div>

        <UiEmptyState v-else compact>Активных подписок пока нет</UiEmptyState>
      </section>

      <section :class="style.section">
        <UiSectionHeader eyebrow="Динамика" title="История списаний" />

        <UiCard
          tag="div"
          :class="style.monthChart"
          aria-label="Списания за последние 12 месяцев"
        >
          <button
            v-for="month in historyMonths"
            :key="month.key"
            type="button"
            :aria-label="`Открыть детализацию: ${month.label} ${month.year}`"
            :class="style.monthColumn"
            @click="openMonthDetails(month)"
          >
            <div :class="style.columnTrack">
              <span
                :class="style.columnFill"
                :style="columnStyle(month.percent)"
              />
            </div>
            <strong>{{ formatCompactCurrency(month.total) }}</strong>
            <span>{{ month.label }}</span>
          </button>
        </UiCard>
      </section>

      <section :class="style.section">
        <UiSectionHeader eyebrow="Приоритет" title="Топ расходов" />

        <div v-if="topSubscriptions.length > 0" :class="style.rankedList">
          <UiCard
            v-for="item in topSubscriptions"
            :key="item.subscription.id"
            :class="style.rankedItem"
          >
            <UiServiceIcon
              :color-class="item.subscription.colorClass"
              :icon="item.subscription.icon"
              size="md"
            />

            <div :class="style.rankedInfo">
              <strong>{{ item.subscription.name }}</strong>
              <span>{{
                item.subscription.category?.name ?? "Без категории"
              }}</span>
              <div :class="style.barTrack">
                <span :class="style.barFill" :style="barStyle(item.percent)" />
              </div>
            </div>

            <div :class="style.amountInfo">
              <strong>{{ formatCurrency(item.monthlyTotal) }}</strong>
              <span>в месяц</span>
            </div>
          </UiCard>
        </div>

        <UiEmptyState v-else compact>Активных подписок пока нет</UiEmptyState>
      </section>

      <section :class="style.section">
        <UiSectionHeader eyebrow="Календарь" title="Ближайшие списания" />

        <div v-if="upcomingPayments.length > 0" :class="style.paymentList">
          <UiCard
            v-for="payment in upcomingPayments"
            :key="payment.id"
            :class="style.paymentItem"
          >
            <UiServiceIcon
              :color-class="payment.colorClass"
              :icon="payment.icon"
              size="md"
            />

            <div :class="style.paymentInfo">
              <strong>{{ payment.name }}</strong>
              <span>{{ payment.dateLabel }} · {{ payment.daysLabel }}</span>
            </div>

            <strong :class="style.paymentAmount">
              {{ formatCurrency(payment.amount) }}
            </strong>
          </UiCard>
        </div>

        <UiEmptyState v-else compact>Активных списаний пока нет</UiEmptyState>
      </section>
    </template>
  </PageContainer>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import PageContainer from "@/layout/PageContainer/PageContainer.vue";
import StatisticsCard from "@/components/StatisticsCard/StatisticsCard.vue";
import {
  UiBadge,
  UiCard,
  UiEmptyState,
  UiPageHeader,
  UiSectionHeader,
  UiServiceIcon,
  UiSummaryCard
} from "@/components/ui";
import {
  analyticsOutline,
  calendarClearOutline,
  trendingUpOutline,
  walletOutline
} from "ionicons/icons";
import {
  calendarMonths,
  formatShortDate,
  getMonthRange,
  getMonthlyEquivalent,
  getNextPaymentDate,
  getOccurrencesInRange,
  MS_IN_DAY,
  parseTransactionDate,
  toDateOnly
} from "@/utils/subscriptionBilling";
import {
  CategoryStat,
  HistoryMonth,
  RankedSubscription,
  UpcomingPayment
} from "@/pages/StatisticsPage/typesStatistics";

import style from "./StatisticsPage.module.scss";

export default defineComponent({
  name: "StatisticsPage",
  components: {
    PageContainer,
    StatisticsCard,
    UiBadge,
    UiCard,
    UiEmptyState,
    UiPageHeader,
    UiSectionHeader,
    UiServiceIcon,
    UiSummaryCard
  },
  data() {
    return {
      analyticsOutline,
      calendarClearOutline,
      style,
      trendingUpOutline,
      walletOutline
    };
  },
  methods: {
    barStyle(percent: number) {
      return {
        "--bar-width": `${Math.min(Math.max(percent, 2), 100)}%`
      };
    },
    columnStyle(percent: number) {
      return {
        "--column-height": `${Math.min(Math.max(percent, 4), 100)}%`
      };
    },
    formatCompactCurrency(value: number) {
      if (value >= 1000) {
        return `${Math.round(value / 100) / 10}к`;
      }

      return `${Math.round(value)}`;
    },
    formatCurrency(value: number) {
      return `${Math.round(value).toLocaleString("ru-RU")} ₽`;
    },
    formatPaymentDate(date: Date) {
      return formatShortDate(date);
    },
    openMonthDetails(month: HistoryMonth) {
      this.$router.push(
        `/statistics/month/${month.year}/${month.monthIndex + 1}`
      );
    }
  },
  computed: {
    activeSubscriptions(): Subscription[] {
      return this.subscriptions.filter((subscription) => {
        return subscription.isActive;
      });
    },
    categoryStats(): CategoryStat[] {
      const categoryTotals = new Map<string, number>();

      this.activeSubscriptions.forEach((subscription) => {
        const categoryName = subscription.category?.name ?? "Без категории";
        const currentTotal = categoryTotals.get(categoryName) ?? 0;

        categoryTotals.set(
          categoryName,
          currentTotal + getMonthlyEquivalent(subscription)
        );
      });

      return Array.from(categoryTotals.entries())
        .map(([name, total]) => {
          return {
            name,
            percent: this.monthlyRunRate
              ? Math.round((total / this.monthlyRunRate) * 100)
              : 0,
            total
          };
        })
        .filter((category) => {
          return category.total > 0;
        })
        .sort((firstCategory, secondCategory) => {
          return secondCategory.total - firstCategory.total;
        });
    },
    currentDate() {
      return new Date();
    },
    currentMonthTotal() {
      const {start, end} = getMonthRange(this.currentDate);

      return this.activeSubscriptions.reduce((total, subscription) => {
        return (
          total +
          getOccurrencesInRange(subscription, start, end, this.currentDate)
            .length *
            subscription.price
        );
      }, 0);
    },
    historyMonths(): HistoryMonth[] {
      const months = Array.from({length: 12}, (_, index) => {
        return new Date(
          this.currentDate.getFullYear(),
          this.currentDate.getMonth() - (11 - index),
          1
        );
      });
      const rawMonths = months.map((monthDate) => {
        const monthStart = toDateOnly(
          new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
        );
        const monthEnd = toDateOnly(
          new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
        );
        const total = this.subscriptions.reduce((monthTotal, subscription) => {
          const monthTransactions = subscription.transactions.filter(
            (transaction) => {
              const transactionDate = parseTransactionDate(transaction.date);

              return (
                transactionDate &&
                transactionDate.getFullYear() === monthDate.getFullYear() &&
                transactionDate.getMonth() === monthDate.getMonth()
              );
            }
          );
          const predictedTransactions =
            subscription.isActive && monthEnd > this.currentDate
              ? getOccurrencesInRange(
                  subscription,
                  monthStart,
                  monthEnd,
                  this.currentDate
                ).filter((date) => {
                  return date > toDateOnly(this.currentDate);
                }).length
              : 0;

          return (
            monthTotal +
            (monthTransactions.length + predictedTransactions) *
              subscription.price
          );
        }, 0);

        return {
          key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
          label: calendarMonths[monthDate.getMonth()].shortLabel,
          monthIndex: monthDate.getMonth(),
          year: monthDate.getFullYear(),
          total
        };
      });
      const maxTotal = Math.max(...rawMonths.map((month) => month.total), 0);

      return rawMonths.map((month) => {
        return {
          ...month,
          percent: maxTotal ? Math.round((month.total / maxTotal) * 100) : 0
        };
      });
    },
    inactiveSubscriptions(): Subscription[] {
      return this.subscriptions.filter((subscription) => {
        return !subscription.isActive;
      });
    },
    monthlyRunRate() {
      return this.activeSubscriptions.reduce((total, subscription) => {
        return total + getMonthlyEquivalent(subscription);
      }, 0);
    },
    remainingThisMonth() {
      const {end} = getMonthRange(this.currentDate);
      const tomorrow = toDateOnly(this.currentDate);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return this.activeSubscriptions.reduce((total, subscription) => {
        return (
          total +
          getOccurrencesInRange(subscription, tomorrow, end, this.currentDate)
            .length *
            subscription.price
        );
      }, 0);
    },
    spentThisMonth() {
      const currentYear = this.currentDate.getFullYear();
      const currentMonth = this.currentDate.getMonth();

      return this.activeSubscriptions.reduce((total, subscription) => {
        const currentMonthTransactions = subscription.transactions.filter(
          (transaction) => {
            const transactionDate = parseTransactionDate(transaction.date);

            return (
              transactionDate &&
              transactionDate.getFullYear() === currentYear &&
              transactionDate.getMonth() === currentMonth
            );
          }
        );

        return total + currentMonthTransactions.length * subscription.price;
      }, 0);
    },
    subscriptions(): Subscription[] {
      return this.$subscriptionStore.subscriptions;
    },
    topSubscriptions(): RankedSubscription[] {
      const maxTotal = Math.max(
        ...this.activeSubscriptions.map((subscription) => {
          return getMonthlyEquivalent(subscription);
        }),
        0
      );

      return this.activeSubscriptions
        .map((subscription) => {
          const monthlyTotal = getMonthlyEquivalent(subscription);

          return {
            monthlyTotal,
            percent: maxTotal ? Math.round((monthlyTotal / maxTotal) * 100) : 0,
            subscription
          };
        })
        .filter((item) => {
          return item.monthlyTotal > 0;
        })
        .sort((firstItem, secondItem) => {
          return secondItem.monthlyTotal - firstItem.monthlyTotal;
        })
        .slice(0, 5);
    },
    upcomingPayments(): UpcomingPayment[] {
      return this.activeSubscriptions
        .map((subscription) => {
          const paymentDate = getNextPaymentDate(
            subscription,
            this.currentDate
          );

          if (!paymentDate) {
            return null;
          }

          const daysLeft = Math.max(
            Math.ceil(
              (paymentDate.getTime() - toDateOnly(this.currentDate).getTime()) /
                MS_IN_DAY
            ),
            0
          );

          return {
            amount: subscription.price,
            colorClass: subscription.colorClass,
            dateLabel: this.formatPaymentDate(paymentDate),
            daysLabel:
              daysLeft === 0
                ? "сегодня"
                : `через ${daysLeft} ${daysLeft === 1 ? "день" : "дн."}`,
            icon: subscription.icon,
            id: subscription.id,
            name: subscription.name,
            paymentDate
          };
        })
        .filter((payment): payment is UpcomingPayment & {paymentDate: Date} => {
          return payment !== null;
        })
        .sort((firstPayment, secondPayment) => {
          return (
            firstPayment.paymentDate.getTime() -
            secondPayment.paymentDate.getTime()
          );
        })
        .slice(0, 5)
        .map((payment) => {
          return {
            amount: payment.amount,
            colorClass: payment.colorClass,
            dateLabel: payment.dateLabel,
            daysLabel: payment.daysLabel,
            icon: payment.icon,
            id: payment.id,
            name: payment.name
          };
        });
    },
    yearlyForecast() {
      return this.monthlyRunRate * 12;
    }
  }
});
</script>
