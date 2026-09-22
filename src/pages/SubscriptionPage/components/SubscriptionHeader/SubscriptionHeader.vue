<template>
  <UiPageHeader :class="style.header" eyebrow="Каталог" title="Подписки">
    <template #action>
      <AddSubscriptionModal
        :button-class="style.addButton"
        :categories="categories"
      />
    </template>
  </UiPageHeader>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
import UiPageHeader from "@/components/ui/UiPageHeader/UiPageHeader.vue";
import AddSubscriptionModal from "../AddSubscriptionModal/AddSubscriptionModal.vue";
import style from "./SubscriptionHeader.module.scss";

export default defineComponent({
  name: "SubscriptionHeader",
  components: {
    AddSubscriptionModal,
    UiPageHeader
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
