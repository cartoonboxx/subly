<template>
  <PageContainer>
    <section :class="style.header">
      <div>
        <span :class="style.eyebrow">Каталог</span>
        <h1>Подписки</h1>
      </div>

      <ion-button :class="style.addButton" aria-label="Добавить подписку">
        <ion-icon :icon="addOutline" />
      </ion-button>
    </section>

    <section :class="style.summaryCard">
      <div :class="style.summaryTop">
        <span>Активные подписки</span>
        <strong>12</strong>
      </div>

      <div :class="style.summaryGrid">
        <div>
          <span>В месяц</span>
          <strong>3 247 ₽</strong>
        </div>

        <div>
          <span>Следующее</span>
          <strong>399 ₽</strong>
        </div>
      </div>
    </section>

    <section :class="style.toolbar" aria-label="Фильтры подписок">
      <div :class="style.searchBox">
        <ion-icon :icon="searchOutline" />
        <span>Поиск подписки</span>
      </div>

      <ion-button fill="clear" :class="style.filterButton" aria-label="Фильтры">
        <ion-icon :icon="optionsOutline" />
      </ion-button>
    </section>

    <section :class="style.filterChips" aria-label="Категории">
      <button :class="[style.chip, style.activeChip]">Все</button>
      <button :class="style.chip">Видео</button>
      <button :class="style.chip">Музыка</button>
      <button :class="style.chip">Сервисы</button>
    </section>

    <section :class="style.section">
      <div :class="style.sectionHeader">
        <div>
          <span :class="style.eyebrow">Список</span>
          <h2>Все подписки</h2>
        </div>

        <span>По списанию</span>
      </div>

      <div :class="style.subscriptionList">
        <SubscriptionCard
          v-for="subscription in subscriptions"
          :key="subscription.id"
          :subscription="subscription"
        />
      </div>
    </section>
  </PageContainer>
</template>

<script lang="ts">
import PageContainer from "@/layout/PageContainer/PageContainer.vue";
import SubscriptionCard from "@/components/SubscriptionCard/SubscriptionCard.vue";
import {IonButton, IonIcon} from "@ionic/vue";
import {defineComponent} from "vue";
import {
  addOutline,
  cardOutline,
  cloudOutline,
  logoFigma,
  musicalNotesOutline,
  optionsOutline,
  playCircleOutline,
  radioOutline,
  searchOutline
} from "ionicons/icons";
import style from "./SubscriptionPage.module.scss";

export default defineComponent({
  name: "SubscriptionPage",
  components: {
    IonButton,
    IonIcon,
    PageContainer,
    SubscriptionCard
  },
  data() {
    return {
      addOutline,
      optionsOutline,
      searchOutline,
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
          icon: cloudOutline,
          name: "iCloud+",
          period: "месяц",
          price: 149
        },
        {
          id: 4,
          colorClass: "orange",
          date: "3 октября",
          icon: musicalNotesOutline,
          name: "Spotify",
          period: "месяц",
          price: 219
        },
        {
          id: 5,
          colorClass: "red",
          date: "7 октября",
          icon: cardOutline,
          name: "Netflix",
          period: "месяц",
          price: 899
        },
        {
          id: 6,
          colorClass: "cyan",
          date: "12 октября",
          icon: logoFigma,
          name: "Figma Professional",
          period: "месяц",
          price: 990
        }
      ] as Subscription[]
    };
  }
});
</script>
