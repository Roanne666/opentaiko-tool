import { createRouter, createWebHistory } from "vue-router";
import PlayView from "@/views/PlayView.vue";
import HomeView from "@/views/HomeView.vue";
import PreviewView from "@/views/PreviewView.vue";
import EditView from "@/views/EditView.vue";
import ScoreView from "@/views/ScoreView.vue";

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
      path: "/play",
      name: "play",
      component: PlayView,
    },
    {
      path: "/preview",
      name: "preview",
      component: PreviewView,
    },
    {
      path: "/edit",
      name: "edit",
      component: EditView,
    },
  ],
});

export default router;
