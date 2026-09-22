<template>
  <UiCard tag="article" :class="style.statCard">
    <UiServiceIcon :icon="icon" size="sm" />
    <span>{{ title }}</span>
    <strong>{{ subtitle }}</strong>
  </UiCard>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import UiCard from "@/components/ui/UiCard/UiCard.vue";
import UiServiceIcon from "@/components/ui/UiServiceIcon/UiServiceIcon.vue";
import style from "./StatisticsCard.module.scss";

export default defineComponent({
  name: "StatisticsCard",
  components: {
    UiCard,
    UiServiceIcon
  },
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
