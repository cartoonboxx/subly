<template>
  <span
    :class="[
      style.serviceIcon,
      getSizeClass,
      getColorClass
    ]"
  >
    <ion-icon v-if="icon" :icon="icon" />
    <slot v-else />
  </span>
</template>

<script lang="ts">
import {IonIcon} from "@ionic/vue";
import {defineComponent, PropType} from "vue";
import style from "./UiServiceIcon.module.scss";

type ServiceIconSize = "sm" | "md" | "lg";

export default defineComponent({
  name: "UiServiceIcon",
  components: {
    IonIcon
  },
  props: {
    colorClass: {
      type: String,
      default: "green"
    },
    icon: {
      type: String,
      default: ""
    },
    size: {
      type: String as PropType<ServiceIconSize>,
      default: "md"
    }
  },
  data() {
    return {
      style
    };
  },
  computed: {
    getSizeClass() {
      switch (this.size) {
        case "sm":
          return this.style.sm;
        case "lg":
          return this.style.lg;
        default:
          return this.style.md;
      }
    },
    getColorClass() {
      switch (this.colorClass) {
        case "blue":
          return this.style.blue;
        case "violet":
          return this.style.violet;
        case "orange":
          return this.style.orange;
        case "red":
          return this.style.red;
        case "cyan":
          return this.style.cyan;
        case "pink":
          return this.style.pink;
        case "amber":
          return this.style.amber;
        case "indigo":
          return this.style.indigo;
        case "slate":
          return this.style.slate;
        default:
          return this.style.green;
      }
    }
  }
});
</script>
