<template>
  <PageContainer>
    <section :class="style.hero">
      <div :class="style.header">
        <div>
          <span :class="style.eyebrow">Аналитика</span>
          <h1>Статистика</h1>
        </div>
      </div>

      <article :class="style.summaryCard">
        <div :class="style.summaryTop">
          <span>Прогноз расходов</span>
          <span :class="style.summaryBadge"
            >{{ activeSubscriptions.length }} активных</span
          >
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
      </article>
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

    <section v-if="subscriptions.length === 0" :class="style.emptyState">
      <span :class="style.emptyIcon">
        <ion-icon :icon="analyticsOutline" />
      </span>
      <h2>Нет данных для статистики</h2>
      <p>
        Добавьте подписку, чтобы увидеть прогноз расходов, категории и историю
        списаний.
      </p>
    </section>

    <template v-else>
      <section :class="style.section">
        <div :class="style.sectionHeader">
          <div>
            <span :class="style.eyebrow">Структура</span>
            <h2>Расходы по категориям</h2>
          </div>
        </div>

        <div v-if="categoryStats.length > 0" :class="style.categoryList">
          <article
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
          </article>
        </div>

        <div v-else :class="style.compactEmpty">Активных подписок пока нет</div>
      </section>

      <section :class="style.section">
        <div :class="style.sectionHeader">
          <div>
            <span :class="style.eyebrow">Динамика</span>
            <h2>История списаний</h2>
          </div>
        </div>

        <div
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
        </div>
      </section>

      <section :class="style.section">
        <div :class="style.sectionHeader">
          <div>
            <span :class="style.eyebrow">Приоритет</span>
            <h2>Топ расходов</h2>
          </div>
        </div>

        <div v-if="topSubscriptions.length > 0" :class="style.rankedList">
          <article
            v-for="item in topSubscriptions"
            :key="item.subscription.id"
            :class="style.rankedItem"
          >
            <div
              :class="[style.serviceIcon, style[item.subscription.colorClass]]"
            >
              <ion-icon :icon="item.subscription.icon" />
            </div>

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
          </article>
        </div>

        <div v-else :class="style.compactEmpty">Активных подписок пока нет</div>
      </section>

      <section :class="style.section">
        <div :class="style.sectionHeader">
          <div>
            <span :class="style.eyebrow">Календарь</span>
            <h2>Ближайшие списания</h2>
          </div>
        </div>

        <div v-if="upcomingPayments.length > 0" :class="style.paymentList">
          <article
            v-for="payment in upcomingPayments"
            :key="payment.id"
            :class="style.paymentItem"
          >
            <div :class="[style.serviceIcon, style[payment.colorClass]]">
              <ion-icon :icon="payment.icon" />
            </div>

            <div :class="style.paymentInfo">
              <strong>{{ payment.name }}</strong>
              <span>{{ payment.dateLabel }} · {{ payment.daysLabel }}</span>
            </div>

            <strong :class="style.paymentAmount">
              {{ formatCurrency(payment.amount) }}
            </strong>
          </article>
        </div>

        <div v-else :class="style.compactEmpty">Активных списаний пока нет</div>
      </section>
    </template>
  </PageContainer>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {IonIcon} from "@ionic/vue";
import {
  analyticsOutline,
  calendarClearOutline,
  trendingUpOutline,
  walletOutline
} from "ionicons/icons";
import PageContainer from "@/layout/PageContainer/PageContainer.vue";
import StatisticsCard from "@/components/StatisticsCard/StatisticsCard.vue";
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
import style from "./StatisticsPage.module.scss";

type CategoryStat = {
  name: string;
  percent: number;
  total: number;
};

type HistoryMonth = {
  key: string;
  label: string;
  monthIndex: number;
  percent: number;
  total: number;
  year: number;
};

type RankedSubscription = {
  monthlyTotal: number;
  percent: number;
  subscription: Subscription;
};

type UpcomingPayment = {
  amount: number;
  colorClass: string;
  dateLabel: string;
  daysLabel: string;
  icon: string;
  id: number;
  name: string;
};

export default defineComponent({
  name: "StatisticsPage",
  components: {
    IonIcon,
    PageContainer,
    StatisticsCard
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
