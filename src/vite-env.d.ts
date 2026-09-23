/// <reference types="vite/client" />

import type {subscriptionStore} from "@/stores/subscriptionStore";
import type {settingsStore} from "@/stores/settingsStore";

declare module "vue" {
  interface ComponentCustomProperties {
    $settingsStore: ReturnType<typeof settingsStore>;
    $subscriptionStore: ReturnType<typeof subscriptionStore>;
  }
}
