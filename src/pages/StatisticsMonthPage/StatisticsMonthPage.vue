<template>
  <PageContainer>
    <section :class="style.hero">
      <button type="button" :class="style.backButton" @click="goBack">
        <ion-icon :icon="chevronBackOutline" />
        <span>Статистика</span>
      </button>

      <div :class="style.header">
        <div>
          <span :class="style.eyebrow">Месяц</span>
          <h1>{{ monthTitle }}</h1>
        </div>
      </div>

      <article :class="style.summaryCard">
        <div :class="style.summaryTop">
          <span>Списания за месяц</span>
          <span :class="style.summaryBadge"
            >{{ paymentItems.length }} подписок</span
          >
        </div>

        <div :class="style.totalRow">
          <strong>{{ formatCurrency(monthTotal) }}</strong>
          <span>{{ totalChargesLabel }}</span>
        </div>
      </article>
    </section>

    <section v-if="paymentItems.length === 0" :class="style.emptyState">
      <span :class="style.emptyIcon">
        <ion-icon :icon="pieChartOutline" />
      </span>
      <h2>В этом месяце списаний нет</h2>
      <p>
        Когда у подписок появятся списания в выбранном месяце, здесь будет
        диаграмма и список платежей.
      </p>
    </section>

    <template v-else>
      <section :class="style.chartSection">
        <div
          :class="style.pieWrap"
          @pointerdown="startChartSwipe"
          @pointerup="finishChartSwipe"
          @pointercancel="cancelChartSwipe"
        >
          <div :class="style.pieChart" :style="pieStyle">
            <div :class="style.pieCenter">
              <strong>{{ formatCurrency(monthTotal) }}</strong>
              <span>итого</span>
            </div>
          </div>
        </div>

        <div :class="style.legendList">
          <article
            v-for="item in paymentItems"
            :key="item.id"
            :class="style.legendItem"
          >
            <span :class="style.legendColor" :style="sliceStyle(item)" />
            <div>
              <strong>{{ item.name }}</strong>
              <span>{{ item.percent }}% · {{ item.chargesLabel }}</span>
            </div>
            <strong>{{ formatCurrency(item.total) }}</strong>
          </article>
        </div>
      </section>

      <section :class="style.section">
        <div :class="style.sectionHeader">
          <div>
            <span :class="style.eyebrow">Состав</span>
            <h2>Подписки месяца</h2>
          </div>
        </div>

        <div :class="style.paymentList">
          <article
            v-for="item in paymentItems"
            :key="`${item.id}-details`"
            :class="style.paymentItem"
          >
            <div :class="[style.serviceIcon, style[item.colorClass]]">
              <ion-icon :icon="item.icon" />
            </div>

            <div :class="style.paymentInfo">
              <strong>{{ item.name }}</strong>
              <span>{{ item.category }} · {{ item.dateLabel }}</span>
            </div>

            <div :class="style.amountInfo">
              <strong>{{ formatCurrency(item.total) }}</strong>
              <span>{{ item.chargesLabel }}</span>
            </div>
          </article>
        </div>
      </section>
    </template>
  </PageContainer>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {IonIcon} from "@ionic/vue";
import {chevronBackOutline, pieChartOutline} from "ionicons/icons";
import PageContainer from "@/layout/PageContainer/PageContainer.vue";
import style from "./StatisticsMonthPage.module.scss";

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

type PaymentItem = {
  category: string;
  chargeCount: number;
  chargesLabel: string;
  color: string;
  colorClass: string;
  dateLabel: string;
  icon: string;
  id: number;
  name: string;
  percent: number;
  total: number;
};

type RawPaymentItem = Omit<PaymentItem, "chargesLabel" | "percent"> & {
  chargeCount: number;
  dates: Date[];
};

const calendarMonths = [
  {label: "Январь", shortLabel: "янв", dateName: "января"},
  {label: "Февраль", shortLabel: "фев", dateName: "февраля"},
  {label: "Март", shortLabel: "мар", dateName: "марта"},
  {label: "Апрель", shortLabel: "апр", dateName: "апреля"},
  {label: "Май", shortLabel: "май", dateName: "мая"},
  {label: "Июнь", shortLabel: "июн", dateName: "июня"},
  {label: "Июль", shortLabel: "июл", dateName: "июля"},
  {label: "Август", shortLabel: "авг", dateName: "августа"},
  {label: "Сентябрь", shortLabel: "сен", dateName: "сентября"},
  {label: "Октябрь", shortLabel: "окт", dateName: "октября"},
  {label: "Ноябрь", shortLabel: "ноя", dateName: "ноября"},
  {label: "Декабрь", shortLabel: "дек", dateName: "декабря"}
];

const colorMap: Record<string, string> = {
  blue: "#3b82f6",
  cyan: "#06b6d4",
  green: "#22c55e",
  orange: "#f97316",
  red: "#ef4444",
  violet: "#8b5cf6"
};

export default defineComponent({
  name: "StatisticsMonthPage",
  components: {
    IonIcon,
    PageContainer
  },
  data() {
    return {
      chevronBackOutline,
      pieChartOutline,
      swipeStartX: null as number | null,
      swipeStartY: null as number | null,
      style
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
    formatChargeCount(count: number) {
      if (count === 1) {
        return "1 списание";
      }

      if (count > 1 && count < 5) {
        return `${count} списания`;
      }

      return `${count} списаний`;
    },
    formatCurrency(value: number) {
      return `${Math.round(value).toLocaleString("ru-RU")} ₽`;
    },
    formatDate(date: Date) {
      return `${date.getDate()} ${calendarMonths[date.getMonth()].shortLabel}`;
    },
    formatDateRange(dates: Date[]) {
      if (dates.length === 0) {
        return "без даты";
      }

      if (dates.length === 1) {
        return this.formatDate(dates[0]);
      }

      return `${this.formatDate(dates[0])} - ${this.formatDate(
        dates[dates.length - 1]
      )}`;
    },
    cancelChartSwipe() {
      this.swipeStartX = null;
      this.swipeStartY = null;
    },
    finishChartSwipe(event: PointerEvent) {
      if (this.swipeStartX === null || this.swipeStartY === null) {
        return;
      }

      const target = event.currentTarget as HTMLElement | null;
      const deltaX = event.clientX - this.swipeStartX;
      const deltaY = event.clientY - this.swipeStartY;

      target?.releasePointerCapture?.(event.pointerId);
      this.cancelChartSwipe();

      if (Math.abs(deltaX) < 54 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) {
        return;
      }

      this.openAdjacentMonth(deltaX < 0 ? 1 : -1);
    },
    getDaysInMonth(year: number, monthIndex: number) {
      return new Date(year, monthIndex + 1, 0).getDate();
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
    goBack() {
      this.$router.push("/statistics");
    },
    openAdjacentMonth(offset: number) {
      const nextDate = new Date(
        this.selectedYear,
        this.selectedMonthIndex + offset,
        1
      );

      this.$router.push(
        `/statistics/month/${nextDate.getFullYear()}/${nextDate.getMonth() + 1}`
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
    sliceStyle(item: PaymentItem) {
      return {
        "--slice-color": item.color
      };
    },
    startChartSwipe(event: PointerEvent) {
      const target = event.currentTarget as HTMLElement | null;

      target?.setPointerCapture?.(event.pointerId);
      this.swipeStartX = event.clientX;
      this.swipeStartY = event.clientY;
    },
    toDateOnly(date: Date) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
  },
  computed: {
    currentDate() {
      return new Date();
    },
    monthEnd() {
      return this.toDateOnly(
        new Date(this.selectedYear, this.selectedMonthIndex + 1, 0)
      );
    },
    monthStart() {
      return this.toDateOnly(
        new Date(this.selectedYear, this.selectedMonthIndex, 1)
      );
    },
    monthTitle() {
      return `${calendarMonths[this.selectedMonthIndex].label} ${this.selectedYear}`;
    },
    monthTotal() {
      return this.paymentItems.reduce((total, item) => {
        return total + item.total;
      }, 0);
    },
    paymentItems(): PaymentItem[] {
      const rawItems = this.rawPaymentItems.sort((firstItem, secondItem) => {
        return secondItem.total - firstItem.total;
      });
      const total = rawItems.reduce((sum, item) => {
        return sum + item.total;
      }, 0);

      return rawItems.map((item) => {
        return {
          ...item,
          chargesLabel: this.formatChargeCount(item.chargeCount),
          dateLabel: this.formatDateRange(item.dates),
          percent: total ? Math.round((item.total / total) * 100) : 0
        };
      });
    },
    pieStyle() {
      if (this.paymentItems.length === 0) {
        return {
          "--pie-gradient": "#e2e8f0 0 100%"
        };
      }

      let currentPercent = 0;
      const segments = this.paymentItems.map((item, index) => {
        const nextPercent =
          index === this.paymentItems.length - 1
            ? 100
            : currentPercent + (item.total / this.monthTotal) * 100;
        const segment = `${item.color} ${currentPercent}% ${nextPercent}%`;

        currentPercent = nextPercent;

        return segment;
      });

      return {
        "--pie-gradient": segments.join(", ")
      };
    },
    rawPaymentItems(): RawPaymentItem[] {
      return this.subscriptions
        .map((subscription) => {
          const actualDates = subscription.transactions
            .map((transaction) => {
              return this.parseTransactionDate(transaction.date);
            })
            .filter((date): date is Date => {
              return (
                date !== null &&
                date >= this.monthStart &&
                date <= this.monthEnd
              );
            });
          const predictedDates =
            subscription.isActive && this.monthEnd > this.currentDate
              ? this.getOccurrencesInRange(
                  subscription,
                  this.monthStart,
                  this.monthEnd
                ).filter((date) => {
                  return date > this.toDateOnly(this.currentDate);
                })
              : [];
          const dates = [...actualDates, ...predictedDates].sort(
            (firstDate, secondDate) => {
              return firstDate.getTime() - secondDate.getTime();
            }
          );

          if (dates.length === 0) {
            return null;
          }

          return {
            category: subscription.category?.name ?? "Без категории",
            chargeCount: dates.length,
            color: colorMap[subscription.colorClass] ?? "#64748b",
            colorClass: subscription.colorClass,
            dateLabel: this.formatDateRange(dates),
            dates,
            icon: subscription.icon,
            id: subscription.id,
            name: subscription.name,
            total: dates.length * subscription.price
          };
        })
        .filter((item): item is RawPaymentItem => {
          return item !== null;
        });
    },
    selectedMonthIndex() {
      const month = Number(this.$route.params.month);

      if (!Number.isInteger(month) || month < 1 || month > 12) {
        return this.currentDate.getMonth();
      }

      return month - 1;
    },
    selectedYear() {
      const year = Number(this.$route.params.year);

      if (!Number.isInteger(year) || year < 2000 || year > 2100) {
        return this.currentDate.getFullYear();
      }

      return year;
    },
    subscriptions(): Subscription[] {
      return this.$subscriptionStore.subscriptions;
    },
    totalChargesLabel() {
      const chargeCount = this.paymentItems.reduce((total, item) => {
        return total + item.chargeCount;
      }, 0);

      return this.formatChargeCount(chargeCount);
    }
  }
});
</script>
