import {createRouter, createWebHistory} from "@ionic/vue-router";
import {RouteRecordRaw} from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/home"
  },
  {
    path: "/",
    component: () => import("@/layout/Navigation/Navigation.vue"),
    children: [
      {
        path: "",
        redirect: "/home"
      },
      {
        path: "home",
        component: () => import("@/pages/HomePage/HomePage.vue")
      },
      {
        path: "subscriptions",
        component: () => import("@/pages/SubscriptionPage/SubscriptionPage.vue")
      },
      {
        path: "statistics",
        component: () => import("@/pages/StatisticsPage/StatisticsPage.vue")
      },
      {
        path: "settings",
        component: () => import("@/pages/SettingsPage/SettingsPage.vue")
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
