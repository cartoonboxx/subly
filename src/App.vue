<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import {IonApp, IonRouterOutlet} from "@ionic/vue";
import {defineComponent} from "vue";

type IonContentElement = HTMLElement & {
  scrollToTop: (duration?: number) => Promise<void>;
};

export default defineComponent({
  name: "AppComponent",
  components: {IonApp, IonRouterOutlet},
  watch: {
    "$route.path"() {
      this.$nextTick(() => {
        requestAnimationFrame(() => {
          const activeContent = document.querySelector(
            "ion-tabs ion-router-outlet .ion-page:not(.ion-page-hidden) ion-content"
          ) as IonContentElement | null;

          activeContent?.scrollToTop(0);
        });
      });
    }
  }
});
</script>
