<template>
  <UiCard
    tag="section"
    :class="[style.emptyState, getCompactClass]"
    :variant="getCardVariant"
  >
    <UiServiceIcon
      v-if="icon"
      :class="style.emptyIcon"
      :icon="icon"
      color-class="green"
      size="lg"
    />
    <h2 v-if="title">{{ title }}</h2>
    <p><slot /></p>
  </UiCard>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import UiCard from "@/components/ui/UiCard/UiCard.vue";
import UiServiceIcon from "@/components/ui/UiServiceIcon/UiServiceIcon.vue";
import style from "./UiEmptyState.module.scss";

export default defineComponent({
  name: "UiEmptyState",
  components: {
    UiCard,
    UiServiceIcon
  },
  props: {
    compact: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: ""
    },
    title: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      style
    };
  },
  computed: {
    getCardVariant() {
      return this.compact ? "dashed" : "default";
    },
    getCompactClass() {
      return this.compact ? this.style.compact : "";
    }
  }
});
</script>
