<template>
  <ion-page>
    <ion-content>
      <main :class="style.pageContainer">
        <slot />
      </main>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {IonPage, IonContent} from "@ionic/vue";
import style from "./PageContainer.module.scss";
import {defineComponent} from "vue";

export default defineComponent({
  components: {
    IonPage,
    IonContent
  },
  data() {
    return {
      style
    };
  }
});
</script>
