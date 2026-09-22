<template>
  <section :class="[style.header, getCompactClass]">
    <div>
      <span :class="style.eyebrow">{{ eyebrow }}</span>
      <h1>{{ title }}</h1>
    </div>

    <slot name="action" />
  </section>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import style from "./UiPageHeader.module.scss";

export default defineComponent({
  name: "UiPageHeader",
  props: {
    compact: {
      type: Boolean,
      default: false
    },
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
  },
  computed: {
    getCompactClass() {
      return this.compact ? this.style.compact : "";
    }
  }
});
</script>
