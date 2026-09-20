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
        :icon="repeatOutline"
        title="Средняя"
        :subtitle="formatCurrency(averageMonthlyCost)"
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
  repeatOutline,
  trendingUpOutline,
  walletOutline
} from "ionicons/icons";
import PageContainer from "@/layout/PageContainer/PageContainer.vue";
import StatisticsCard from "@/components/StatisticsCard/StatisticsCard.vue";
import style from "./StatisticsPage.module.scss";

type PeriodStep =
  | {
      unit: "once";
    }
  | {
      amount: number;
      unit: "days";
    }
  | {
      amount: number;
      unit: "months";
    };

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

const calendarMonths = [
  {label: "янв", dateName: "января"},
  {label: "фев", dateName: "февраля"},
  {label: "мар", dateName: "марта"},
  {label: "апр", dateName: "апреля"},
  {label: "май", dateName: "мая"},
  {label: "июн", dateName: "июня"},
  {label: "июл", dateName: "июля"},
  {label: "авг", dateName: "августа"},
  {label: "сен", dateName: "сентября"},
  {label: "окт", dateName: "октября"},
  {label: "ноя", dateName: "ноября"},
  {label: "дек", dateName: "декабря"}
];

const MS_IN_DAY = 24 * 60 * 60 * 1000;

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
      repeatOutline,
      style,
      trendingUpOutline,
      walletOutline
    };
  },
  methods: {
    addPeriod(date: Date, step: PeriodStep, sourceDay: number) {
      if (step.unit === "once") {
        return date;
      }

      if (step.unit === "days") {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + step.amount);

        return nextDate;
      }

      const nextMonthIndex = date.getMonth() + step.amount;
      const nextYear = date.getFullYear() + Math.floor(nextMonthIndex / 12);
      const normalizedMonthIndex = nextMonthIndex % 12;

      return new Date(
        nextYear,
        normalizedMonthIndex,
        Math.min(sourceDay, this.getDaysInMonth(nextYear, normalizedMonthIndex))
      );
    },
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
      return `${date.getDate()} ${calendarMonths[date.getMonth()].label}`;
    },
    getDaysInMonth(year: number, monthIndex: number) {
      return new Date(year, monthIndex + 1, 0).getDate();
    },
    getMonthRange(date: Date) {
      return {
        end: this.toDateOnly(
          new Date(date.getFullYear(), date.getMonth() + 1, 0)
        ),
        start: this.toDateOnly(new Date(date.getFullYear(), date.getMonth(), 1))
      };
    },
    getMonthlyEquivalent(subscription: Subscription) {
      if (subscription.period === "разовая") {
        return 0;
      }

      if (subscription.period === "неделя") {
        return (subscription.price * 52) / 12;
      }

      if (subscription.period === "3 месяца") {
        return subscription.price / 3;
      }

      if (subscription.period === "6 месяцев") {
        return subscription.price / 6;
      }

      if (subscription.period === "год") {
        return subscription.price / 12;
      }

      return subscription.price;
    },
    openMonthDetails(month: HistoryMonth) {
      this.$router.push(
        `/statistics/month/${month.year}/${month.monthIndex + 1}`
      );
    },
    getNextPaymentDate(subscription: Subscription, fromDate = new Date()) {
      const registrationDate = this.getRegistrationDate(subscription);
      const step = this.getPeriodStep(subscription.period);
      const sourceDay = registrationDate.getDate();
      const today = this.toDateOnly(fromDate);
      let paymentDate = this.toDateOnly(registrationDate);
      let attempts = 0;

      if (step.unit === "once") {
        return paymentDate >= today ? paymentDate : null;
      }

      while (paymentDate < today && attempts < 600) {
        paymentDate = this.addPeriod(paymentDate, step, sourceDay);
        attempts += 1;
      }

      return paymentDate;
    },
    getOccurrencesInRange(subscription: Subscription, start: Date, end: Date) {
      const registrationDate = this.toDateOnly(
        this.getRegistrationDate(subscription)
      );
      const step = this.getPeriodStep(subscription.period);
      const sourceDay = registrationDate.getDate();
      const occurrences: Date[] = [];
      let paymentDate = registrationDate;
      let attempts = 0;

      if (step.unit === "once") {
        return paymentDate >= start && paymentDate <= end ? [paymentDate] : [];
      }

      while (paymentDate < start && attempts < 600) {
        paymentDate = this.addPeriod(paymentDate, step, sourceDay);
        attempts += 1;
      }

      while (paymentDate <= end && attempts < 700) {
        occurrences.push(paymentDate);
        paymentDate = this.addPeriod(paymentDate, step, sourceDay);
        attempts += 1;
      }

      return occurrences;
    },
    getPeriodStep(period: string): PeriodStep {
      if (period === "разовая") {
        return {
          unit: "once"
        };
      }

      if (period === "неделя") {
        return {
          amount: 7,
          unit: "days"
        };
      }

      if (period === "3 месяца") {
        return {
          amount: 3,
          unit: "months"
        };
      }

      if (period === "6 месяцев") {
        return {
          amount: 6,
          unit: "months"
        };
      }

      if (period === "год") {
        return {
          amount: 12,
          unit: "months"
        };
      }

      return {
        amount: 1,
        unit: "months"
      };
    },
    getRegistrationDate(subscription: Subscription) {
      const registeredAt = this.parseIsoDate(subscription.registeredAt);

      if (registeredAt) {
        return registeredAt;
      }

      const parsedDate = this.parseSubscriptionDate(subscription.date);

      if (!parsedDate) {
        return this.currentDate;
      }

      return new Date(
        this.currentDate.getFullYear(),
        parsedDate.monthIndex,
        parsedDate.day
      );
    },
    parseIsoDate(date: string) {
      const dateParts = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);

      if (!dateParts) {
        return null;
      }

      const year = Number(dateParts[1]);
      const monthIndex = Number(dateParts[2]) - 1;
      const day = Number(dateParts[3]);
      const parsedDate = new Date(year, monthIndex, day);

      if (
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() !== monthIndex ||
        parsedDate.getDate() !== day
      ) {
        return null;
      }

      return parsedDate;
    },
    parseSubscriptionDate(date: string) {
      const dateParts = date
        .trim()
        .toLowerCase()
        .match(/^(\d{1,2})\s+(.+)$/);

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
    parseTransactionDate(date: string) {
      const parsedDate = new Date(`${date}T00:00:00`);

      return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
    },
    toDateOnly(date: Date) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
  },
  computed: {
    activeSubscriptions(): Subscription[] {
      return this.subscriptions.filter((subscription) => {
        return subscription.isActive;
      });
    },
    averageMonthlyCost() {
      const recurringSubscriptionsCount = this.activeSubscriptions.filter(
        (subscription) => {
          return this.getMonthlyEquivalent(subscription) > 0;
        }
      ).length;

      if (recurringSubscriptionsCount === 0) {
        return 0;
      }

      return this.monthlyRunRate / recurringSubscriptionsCount;
    },
    categoryStats(): CategoryStat[] {
      const categoryTotals = new Map<string, number>();

      this.activeSubscriptions.forEach((subscription) => {
        const categoryName = subscription.category?.name ?? "Без категории";
        const currentTotal = categoryTotals.get(categoryName) ?? 0;

        categoryTotals.set(
          categoryName,
          currentTotal + this.getMonthlyEquivalent(subscription)
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
      const {start, end} = this.getMonthRange(this.currentDate);

      return this.activeSubscriptions.reduce((total, subscription) => {
        return (
          total +
          this.getOccurrencesInRange(subscription, start, end).length *
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
        const monthStart = this.toDateOnly(
          new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
        );
        const monthEnd = this.toDateOnly(
          new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
        );
        const total = this.subscriptions.reduce((monthTotal, subscription) => {
          const monthTransactions = subscription.transactions.filter(
            (transaction) => {
              const transactionDate = this.parseTransactionDate(
                transaction.date
              );

              return (
                transactionDate &&
                transactionDate.getFullYear() === monthDate.getFullYear() &&
                transactionDate.getMonth() === monthDate.getMonth()
              );
            }
          );
          const predictedTransactions =
            subscription.isActive && monthEnd > this.currentDate
              ? this.getOccurrencesInRange(
                  subscription,
                  monthStart,
                  monthEnd
                ).filter((date) => {
                  return date > this.toDateOnly(this.currentDate);
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
          label: calendarMonths[monthDate.getMonth()].label,
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
        return total + this.getMonthlyEquivalent(subscription);
      }, 0);
    },
    remainingThisMonth() {
      const {end} = this.getMonthRange(this.currentDate);
      const tomorrow = this.toDateOnly(this.currentDate);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return this.activeSubscriptions.reduce((total, subscription) => {
        return (
          total +
          this.getOccurrencesInRange(subscription, tomorrow, end).length *
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
            const transactionDate = this.parseTransactionDate(transaction.date);

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
          return this.getMonthlyEquivalent(subscription);
        }),
        0
      );

      return this.activeSubscriptions
        .map((subscription) => {
          const monthlyTotal = this.getMonthlyEquivalent(subscription);

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
          const paymentDate = this.getNextPaymentDate(subscription);

          if (!paymentDate) {
            return null;
          }

          const daysLeft = Math.max(
            Math.ceil(
              (paymentDate.getTime() -
                this.toDateOnly(this.currentDate).getTime()) /
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
        .map(({paymentDate, ...payment}) => {
          return payment;
        });
    },
    yearlyForecast() {
      return this.monthlyRunRate * 12;
    }
  }
});
</script>
