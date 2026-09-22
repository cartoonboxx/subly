<template>
  <div :class="style.sectionHeader">
    <div>
      <span :class="style.eyebrow">{{ eyebrow }}</span>
      <h2>{{ title }}</h2>
    </div>

    <slot name="meta" />
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import style from "./UiSectionHeader.module.scss";

export default defineComponent({
  name: "UiSectionHeader",
  props: {
    eyebrow: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      style
    };
  }
});
</script>
