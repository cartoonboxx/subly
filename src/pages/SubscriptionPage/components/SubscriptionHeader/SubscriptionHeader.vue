<template>
  <section :class="style.header">
    <div>
      <span :class="style.eyebrow">Каталог</span>
      <h1>Подписки</h1>
    </div>

    <AddSubscriptionModal
      :button-class="style.addButton"
      :categories="categories"
    />
  </section>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
import AddSubscriptionModal from "../AddSubscriptionModal/AddSubscriptionModal.vue";
import style from "./SubscriptionHeader.module.scss";

export default defineComponent({
  name: "SubscriptionHeader",
  components: {
    AddSubscriptionModal
  },
  props: {
    categories: {
      type: Array as PropType<Category[]>,
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
