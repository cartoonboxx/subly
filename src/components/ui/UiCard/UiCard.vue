<template>
  <component
    :is="tag"
    :class="[
      style.card,
      getPaddingClass,
      getVariantClass,
      getInteractiveClass
    ]"
  >
    <slot />
  </component>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
import style from "./UiCard.module.scss";

type CardPadding = "none" | "sm" | "md";
type CardVariant = "default" | "dashed";

export default defineComponent({
  name: "UiCard",
  props: {
    interactive: {
      type: Boolean,
      default: false
    },
    padding: {
      type: String as PropType<CardPadding>,
      default: "md"
    },
    tag: {
      type: String,
      default: "article"
    },
    variant: {
      type: String as PropType<CardVariant>,
      default: "default"
    }
  },
  data() {
    return {
      style
    };
  },
  computed: {
    getPaddingClass() {
      switch (this.padding) {
        case "none":
          return this.style.paddingNone;
        case "sm":
          return this.style.paddingSm;
        default:
          return this.style.paddingMd;
      }
    },
    getVariantClass() {
      switch (this.variant) {
        case "dashed":
          return this.style.dashed;
        default:
          return "";
      }
    },
    getInteractiveClass() {
      return this.interactive ? this.style.interactive : "";
    }
  }
});
</script>
