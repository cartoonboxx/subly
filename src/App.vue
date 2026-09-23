<template>
  <ion-app>
    <div class="systemStatusBar" aria-hidden="true" />
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

<style lang="scss">
.systemStatusBar {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: var(--z-system-status-bar);
  height: var(--app-safe-area-top);
  background: var(--color-background);
  pointer-events: none;
}
</style>
