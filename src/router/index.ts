import { createRouter, createWebHistory } from "vue-router";
import ScoreView from "@/views/ScoreView.vue";
import HomeView from "@/views/HomeView.vue";
import PreviewView from "@/views/PreviewView.vue";

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
    {
      path: "/preview",
      name: "preview",
      component: PreviewView,
    },
  ],
});

export default router;
