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
    </template>
  </PageContainer>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {IonIcon} from "@ionic/vue";
import {chevronBackOutline, pieChartOutline} from "ionicons/icons";
import PageContainer from "@/layout/PageContainer/PageContainer.vue";
import {
  calendarMonths,
  getOccurrencesInRange,
  parseTransactionDate,
  toDateOnly
} from "@/utils/subscriptionBilling";
import style from "./StatisticsMonthPage.module.scss";

type PaymentItem = {
  chargeCount: number;
  chargesLabel: string;
  color: string;
  id: number;
  name: string;
  percent: number;
  total: number;
};

type RawPaymentItem = Omit<PaymentItem, "chargesLabel" | "percent">;

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
    }
  },
  computed: {
    currentDate() {
      return new Date();
    },
    monthEnd() {
      return toDateOnly(
        new Date(this.selectedYear, this.selectedMonthIndex + 1, 0)
      );
    },
    monthStart() {
      return toDateOnly(
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
      const rawItems = [...this.rawPaymentItems].sort(
        (firstItem, secondItem) => {
          return secondItem.total - firstItem.total;
        }
      );
      const total = rawItems.reduce((sum, item) => {
        return sum + item.total;
      }, 0);

      return rawItems.map((item) => {
        return {
          ...item,
          chargesLabel: this.formatChargeCount(item.chargeCount),
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
              return parseTransactionDate(transaction.date);
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
              ? getOccurrencesInRange(
                  subscription,
                  this.monthStart,
                  this.monthEnd,
                  this.currentDate
                ).filter((date) => {
                  return date > toDateOnly(this.currentDate);
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
            chargeCount: dates.length,
            color: colorMap[subscription.colorClass] ?? "#64748b",
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
