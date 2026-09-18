<template>
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

    <article :class="style.summaryCard" @click="$emit('open-statistics')">
      <div :class="style.summaryTop">
        <span>Будет потрачено в {{ monthLabel }}</span>
        <span :class="style.summaryBadge">Итог месяца</span>
      </div>

      <div :class="style.totalRow">
        <strong>{{ total }} ₽</strong>
        <span>{{ subscriptionsCount }} подписок</span>
      </div>

      <div :class="style.progressTrack">
        <span :class="style.progressBar" :style="progressStyle" />
      </div>

      <div :class="style.summaryBottom">
        <span>Уже списано {{ spentTotal }} ₽</span>
        <span>Осталось {{ remainingTotal }} ₽</span>
      </div>
    </article>
  </section>
</template>

<script lang="ts">
import {IonButton, IonIcon} from "@ionic/vue";
import {defineComponent} from "vue";
import {notificationsOutline} from "ionicons/icons";
import style from "./HomeHero.module.scss";

export default defineComponent({
  name: "HomeHero",
  components: {
    IonButton,
    IonIcon
  },
  props: {
    subscriptionsCount: {
      type: Number,
      required: true
    },
    monthLabel: {
      type: String,
      required: true
    },
    progress: {
      type: Number,
      required: true
    },
    remainingTotal: {
      type: Number,
      required: true
    },
    spentTotal: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  emits: ["open-statistics"],
  data() {
    return {
      notificationsOutline,
      style
    };
  },
  computed: {
    progressStyle() {
      return {
        width: `${Math.min(Math.max(this.progress, 0), 100)}%`
      };
    }
  }
});
</script>
