<script setup lang="ts">
import "@/assets/base.css";
import { RouterLink, RouterView } from "vue-router";
import { NLayout, NLayoutSider, NLayoutContent, NMenu, type MenuOption, NIcon } from "naive-ui";
import { HomeOutline as HomeIcon, MusicalNotesOutline as MusicIcon, BarcodeOutline as PreviewIcon } from "@vicons/ionicons5";
import { h, type Component } from "vue";
import { fetchAllSongs } from "@/stores/song";

fetchAllSongs();

window.addEventListener("beforeunload", async (event) => {
  await fetch("/api/closeServer");
});

window.addEventListener("load", async (event) => {
  await fetch("/api/stopCloseServer");
});

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const menuOptions: MenuOption[] = [
  createMenuOption("主页", "/", HomeIcon),
  createMenuOption("乐曲成绩", "/score", MusicIcon),
  createMenuOption("谱面预览", "/preview", PreviewIcon),
];

function createMenuOption(text: string, to: string, icon: Component) {
  return {
    label: () => h(RouterLink, { to }, { default: () => text }),
    key: to,
    icon: renderIcon(icon),
  };
}
</script>

<template>
  <n-layout has-sider style="padding-top: 42px">
    <n-layout-sider width="220" content-style="padding-left: 24px;padding-right:10px"><n-menu :options="menuOptions" default-value="score" /></n-layout-sider>
    <n-layout>
      <n-layout-content content-style="padding-left: 24px;padding-right:108px;">
        <RouterView />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style scoped></style>
