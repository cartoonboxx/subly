<template>
  <article :class="style.statCard">
    <span :class="style.statIcon">
      <ion-icon :icon="icon" />
    </span>
    <span>{{ title }}</span>
    <strong>{{ subtitle }}</strong>
  </article>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {IonIcon} from "@ionic/vue";
import style from "./StatisticsCard.module.scss";

export default defineComponent({
  name: "StatisticsCard",
  components: {IonIcon},
  props: {
    icon: {
      type: String,
      default: ""
    },
    title: {
      type: String,
      default: ""
    },
    subtitle: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      style
    };
  }
});
</script>
