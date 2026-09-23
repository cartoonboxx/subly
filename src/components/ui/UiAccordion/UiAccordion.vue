<template>
  <section :class="[style.accordion, isOpened ? style.opened : null]">
    <button
      :id="headerId"
      type="button"
      :class="style.header"
      :aria-controls="bodyId"
      :aria-expanded="isOpened"
      @click="toggleAccordion"
    >
      <span :class="style.titleGroup">
        <span :class="style.eyebrow">{{ eyebrow }}</span>
        <strong>{{ title }}</strong>
      </span>

      <span :class="style.metaGroup">
        <slot name="meta" />
        <span :class="style.chevron" aria-hidden="true">
          <ion-icon :icon="chevronDown" />
        </span>
      </span>
    </button>

    <div
      :id="bodyId"
      :class="style.body"
      :aria-labelledby="headerId"
      role="region"
    >
      <div :class="style.bodyInner">
        <slot />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import {IonIcon} from "@ionic/vue";
import {defineComponent} from "vue";
import {chevronDown} from "ionicons/icons";
import style from "./UiAccordion.module.scss";

let accordionId = 0;

export default defineComponent({
  name: "UiAccordion",
  components: {
    IonIcon
  },
  props: {
    defaultOpen: {
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
    accordionId += 1;

    return {
      bodyId: `ui-accordion-body-${accordionId}`,
      chevronDown,
      headerId: `ui-accordion-header-${accordionId}`,
      isOpened: this.defaultOpen,
      style
    };
  },
  methods: {
    toggleAccordion() {
      this.isOpened = !this.isOpened;
    }
  }
});
</script>
