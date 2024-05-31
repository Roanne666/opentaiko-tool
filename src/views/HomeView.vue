<script setup lang="ts">
import { NButton, NDataTable, type DataTableColumn } from "naive-ui";
import { currentSongUrl, getSongUrl, songs } from "@/stores/song";
import type { Song } from "@server/song";
import { h, ref } from "vue";

const audioRef = ref<HTMLAudioElement>();

const columns: DataTableColumn<Song>[] = [
  {
    title: "曲名",
    key: "name",
    align: "center",
    width: 250,
  },
  {
    title: "类目",
    key: "genre",
    align: "center",
    width: 150,
  },
  {
    title: "播放",
    key: "play",
    align: "center",
    width: 100,
    render(rowData, rowIndex) {
      return h(
        NButton,
        {
          onClick: async () => {
            await getSongUrl(rowData.dir + "\\" + rowData.name + ".ogg");
            audioRef.value?.load();
            audioRef.value?.play();
          },
        },
        { default: () => "播放" }
      );
    },
  },
  createDiffultyColumn("梅", "easy"),
  createDiffultyColumn("竹", "normal"),
  createDiffultyColumn("松", "hard"),
  createDiffultyColumn("鬼", "oni"),
  createDiffultyColumn("里", "extreme"),
];

function createDiffultyColumn(title: string, key: string): DataTableColumn<Song> {
  return {
    title,
    key,
    align: "center",
    children: [
      {
        title: "等级",
        key: "level",
        align: "center",
        width: 70,
        render(rowData, rowIndex) {
          switch (key) {
            case "easy":
              return `${rowData.easy.level}★`;
            case "normal":
              return `${rowData.normal.level}★`;
            case "hard":
              return `${rowData.hard.level}★`;
            case "oni":
              return `${rowData.oni.level}★`;
            case "extreme":
              return rowData.extreme ? `${rowData.extreme.level}★` : "";
          }
        },
      },
      {
        title: "分数",
        key: "score",
        align: "center",
        width: 100,
        render(rowData, rowIndex) {
          switch (key) {
            case "easy":
              return `${rowData.easy.score}`;
            case "normal":
              return `${rowData.normal.score}`;
            case "hard":
              return `${rowData.hard.score}`;
            case "oni":
              return `${rowData.oni.score}`;
            case "extreme":
              return rowData.extreme ? rowData.extreme.score : "";
          }
        },
      },
    ],
  };
}
</script>

<template>
  <main>
    <audio ref="audioRef" :src="currentSongUrl" autoplay="true"></audio>
    <n-data-table
      :columns="columns"
      :data="songs"
      :pagination="{
        pageSize: 15,
      }"
      :single-line="false"
    ></n-data-table>
  </main>
</template>
