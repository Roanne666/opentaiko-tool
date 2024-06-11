<style>
.n-layout-scroll-container {
  overflow-y: hidden;
}
</style>

<template>
  <n-layout has-sider style="padding-top: 30px; height: 98vh">
    <n-layout-sider bordered width="220" content-style="padding-left: 24px;padding-right:10px"><n-menu :options="menuOptions" default-value="score" /></n-layout-sider>
    <n-layout>
      <n-layout-content content-style="padding-left: 24px;padding-right:108px;height:100vh">
        <RouterView />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import "@/assets/base.css";
import { RouterLink, RouterView } from "vue-router";
import { NLayout, NLayoutSider, NLayoutContent, NMenu, type MenuOption, NIcon } from "naive-ui";
import { HomeOutline as HomeIcon, MusicalNotesOutline as MusicIcon, BarcodeOutline as PreviewIcon } from "@vicons/ionicons5";
import { h, type Component } from "vue";
import { fetchAllSongs } from "@/stores/song";

fetchAllSongs();

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
