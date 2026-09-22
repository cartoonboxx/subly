<template>
  <component
    :is="tag"
    :class="[
      style.summaryCard,
      getToneClass,
      getInteractiveClass
    ]"
  >
    <slot />
  </component>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
import style from "./UiSummaryCard.module.scss";

type SummaryTone = "green" | "dark" | "teal";

export default defineComponent({
  name: "UiSummaryCard",
  props: {
    interactive: {
      type: Boolean,
      default: false
    },
    tone: {
      type: String as PropType<SummaryTone>,
      default: "dark"
    },
    tag: {
      type: String,
      default: "article"
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
        case "green":
          return this.style.green;
        case "teal":
          return this.style.teal;
        default:
          return this.style.dark;
      }
    },
    getInteractiveClass() {
      return this.interactive ? this.style.interactive : "";
    }
  }
});
</script>
