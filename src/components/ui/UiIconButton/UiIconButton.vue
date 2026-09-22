<template>
  <ion-button
    fill="clear"
    :class="[style.iconButton, getShapeClass]"
    :aria-label="label"
    @click="$emit('click', $event)"
  >
    <ion-icon :icon="icon" />
    <UiBadge v-if="badge" :class="style.badge" tone="danger">
      {{ badge }}
    </UiBadge>
  </ion-button>
</template>

<script lang="ts">
import {IonButton, IonIcon} from "@ionic/vue";
import {defineComponent, PropType} from "vue";
import UiBadge from "@/components/ui/UiBadge/UiBadge.vue";
import style from "./UiIconButton.module.scss";

type IconButtonShape = "rounded" | "circle";

export default defineComponent({
  name: "UiIconButton",
  components: {
    IonButton,
    IonIcon,
    UiBadge
  },
  props: {
    label: {
      type: String,
      required: true
    },
    badge: {
      type: [Number, String],
      default: ""
    },
    icon: {
      type: String,
      required: true
    },
    shape: {
      type: String as PropType<IconButtonShape>,
      default: "rounded"
    }
  },
  emits: ["click"],
  data() {
    return {
      style
    };
  },
  computed: {
    getShapeClass() {
      switch (this.shape) {
        case "circle":
          return this.style.circle;
        default:
          return "";
      }
    }
  }
});
</script>
