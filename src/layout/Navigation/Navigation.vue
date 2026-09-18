<template>
  <ion-page>
    <ion-tabs :class="style.tabs">
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom" :class="style.tabBar">
        <ion-tab-button tab="home" href="/home">
          <ion-icon :icon="homeOutline"></ion-icon>
          <ion-label>Главная</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="subscriptions" href="/subscriptions">
          <ion-icon :icon="cardOutline"></ion-icon>
          <ion-label>Подписки</ion-label>
        </ion-tab-button>

        <AddSubscriptionModal
          :categories="categories"
          :button-class="style.buttonAdd"
        />

        <ion-tab-button tab="statistics" href="/statistics">
          <ion-icon :icon="statsChartOutline"></ion-icon>
          <ion-label>Статистика</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="settings" href="/settings">
          <ion-icon :icon="settingsOutline"></ion-icon>
          <ion-label>Настройки</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script lang="ts">
import {
  IonPage,
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonIcon
} from "@ionic/vue";
import {
  addOutline,
  cardOutline,
  homeOutline,
  settingsOutline,
  statsChartOutline
} from "ionicons/icons";

import {defineComponent} from "vue";
import style from "./Navigation.module.scss";
import AddSubscriptionModal from "@/pages/SubscriptionPage/components/AddSubscriptionModal/AddSubscriptionModal.vue";

export default defineComponent({
  name: "NavigationLayout",
  components: {
    AddSubscriptionModal,
    IonPage,
    IonTabs,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonLabel,
    IonIcon
  },
  data() {
    return {
      addOutline,
      cardOutline,
      homeOutline,
      settingsOutline,
      statsChartOutline,
      style
    };
  },
  computed: {
    categories() {
      return this.$subscriptionStore.categories;
    }
  }
});
</script>
