/// <reference types="vite/client" />

import type {subscriptionStore} from "@/stores/subscriptionStore";

declare module "vue" {
  interface ComponentCustomProperties {
    $subscriptionStore: ReturnType<typeof subscriptionStore>;
  }
}
