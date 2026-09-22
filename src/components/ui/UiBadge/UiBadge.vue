<template>
  <span :class="[style.badge, getToneClass]">
    <slot />
  </span>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
import style from "./UiBadge.module.scss";

type BadgeTone = "success" | "neutral" | "danger" | "glass";

export default defineComponent({
  name: "UiBadge",
  props: {
    tone: {
      type: String as PropType<BadgeTone>,
      default: "neutral"
    }
  },
  data() {
    return {
      style
    };
  },
  computed: {
    getToneClass() {
      switch (this.tone) {
        case "success":
          return this.style.success;
        case "neutral":
          return this.style.neutral;
        case "danger":
          return this.style.danger;
        default:
          return this.style.glass;
      }
    }
  }
});
</script>
