<template>
  <PageContainer>
    <section :class="style.hero">
      <div :class="style.header">
        <div>
          <span :class="style.eyebrow">Subly</span>
          <h1>Главная</h1>
        </div>

        <ion-button
          fill="clear"
          :class="style.iconButton"
          aria-label="Уведомления"
        >
          <ion-icon :icon="notificationsOutline" />
        </ion-button>
      </div>

      <article :class="style.summaryCard">
        <div :class="style.summaryTop">
          <span>Будет потрачено в сентябре</span>
          <span :class="style.summaryBadge">Итог месяца</span>
        </div>

        <div :class="style.totalRow">
          <strong>3 247 ₽</strong>
          <span>12 подписок</span>
        </div>

        <div :class="style.progressTrack">
          <span :class="style.progressBar" />
        </div>

        <div :class="style.summaryBottom">
          <span>Уже списано 2 178 ₽</span>
          <span>Осталось 1 069 ₽</span>
        </div>
      </article>
    </section>

    <section :class="style.statsGrid" aria-label="Краткая статистика">
      <StatisticsCard
        :icon="calendarOutline"
        title="Следующее"
        subtitle="19 сен"
      />

      <StatisticsCard
        :icon="diamondOutline"
        title="Самая дорогая"
        subtitle="399 ₽"
      />
    </section>

    <section :class="style.section">
      <div :class="style.sectionHeader">
        <div>
          <span :class="style.eyebrow">Скоро</span>
          <h2>Ближайшие списания</h2>
        </div>

        <ion-button
          fill="clear"
          size="small"
          :class="style.buttonAll"
          href="/subscriptions"
        >
          Все
        </ion-button>
      </div>

      <div :class="style.subscriptionList">
        <SubscriptionCard
          v-for="sub in subscriptions"
          :key="sub.id"
          :subscription="sub"
        />
      </div>
    </section>
  </PageContainer>
</template>

<script lang="ts">
import PageContainer from "@/layout/PageContainer/PageContainer.vue";
import {defineComponent} from "vue";
import style from "./HomePage.module.scss";
import {IonButton, IonIcon} from "@ionic/vue";
import {
  calendarOutline,
  cardOutline,
  diamondOutline,
  notificationsOutline,
  playCircleOutline,
  radioOutline
} from "ionicons/icons";
import SubscriptionCard from "@/components/SubscriptionCard/SubscriptionCard.vue";
import StatisticsCard from "@/components/StatisticsCard/StatisticsCard.vue";

export default defineComponent({
  components: {
    StatisticsCard,
    SubscriptionCard,
    IonButton,
    IonIcon,
    PageContainer
  },
  data() {
    return {
      calendarOutline,
      diamondOutline,
      notificationsOutline,
      style,
      subscriptions: [
        {
          id: 1,
          colorClass: "green",
          date: "19 сентября",
          icon: playCircleOutline,
          name: "YouTube Premium",
          period: "месяц",
          price: 399
        },
        {
          id: 2,
          colorClass: "blue",
          date: "22 сентября",
          icon: radioOutline,
          name: "Яндекс Плюс",
          period: "месяц",
          price: 299
        },
        {
          id: 3,
          colorClass: "violet",
          date: "28 сентября",
          icon: cardOutline,
          name: "iCloud+",
          period: "месяц",
          price: 149
        }
      ] as Subscription[]
    };
  }
});
</script>
