<template>
  <button
    :class="[style.button, getVariantButton, getMaxWidthClass]"
    :type="type"
  >
    <slot />
  </button>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
import style from "./UiButton.module.scss";

type ButtonType = "button" | "submit" | "reset";
type ButtonVariant =
  "primary" | "secondary" | "soft" | "neutral" | "dangerSoft";

export default defineComponent({
  name: "UiButton",
  props: {
    maxWidth: {
      type: Boolean,
      default: false
    },
    type: {
      type: String as PropType<ButtonType>,
      default: "button"
    },
    variant: {
      type: String as PropType<ButtonVariant>,
      default: "primary"
    }
  },
  data() {
    return {
      style
    };
  },
  computed: {
    getVariantButton() {
      switch (this.variant) {
        case "primary":
          return this.style.primary;
        case "secondary":
          return this.style.secondary;
        case "soft":
          return this.style.soft;
        case "neutral":
          return this.style.neutral;
        default:
          return this.style.dangerSoft;
      }
    },
    getMaxWidthClass() {
      return this.maxWidth ? this.style.maxWidth : "";
    }
  }
});
</script>
