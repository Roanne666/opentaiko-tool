<script setup lang="ts">
import "@/assets/base.css";
import { RouterLink, RouterView } from "vue-router";
import { NLayout, NLayoutSider, NLayoutContent, NMenu, type MenuOption, NIcon } from "naive-ui";
import { MusicalNotesOutline as MusicIcon, BarcodeOutline as PreviewIcon } from "@vicons/ionicons5";
import { h, type Component } from "vue";

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const menuOptions: MenuOption[] = [
  {
    label: "曲目成绩",
    key: "score",
    icon: renderIcon(MusicIcon),
  },
  {
    label: "谱面预览",
    key: "preview",
    icon: renderIcon(PreviewIcon),
  },
];
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
