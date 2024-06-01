import { createRouter, createWebHistory } from "vue-router";
import ScoreView from "../views/ScoreView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "score",
      component: ScoreView,
    },
  ],
});

export default router;
