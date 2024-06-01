import { createRouter, createWebHistory } from "vue-router";
import ScoreView from "@/views/ScoreView.vue";
import HomeView from "@/views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/score",
      name: "score",
      component: ScoreView,
    },
  ],
});

export default router;
