<style scoped></style>

<template>
  <audio ref="audioRef" :src="currentSongUrl" autoplay="true"></audio>
  <n-data-table
    :columns="columns"
    :data="songs"
    :pagination="{
      pageSize: 12,
    }"
    :single-line="false"
  ></n-data-table>
</template>

<script setup lang="ts">
import { h, ref } from "vue";
import { NButton, NDataTable, NIcon, alertDark, type DataTableColumn } from "naive-ui";
import { currentSongUrl, fetchSongs, getSongUrl, songs } from "@/stores/song";
import type { Song } from "@server/song";
import { PlayCircleOutline as PlayIcon, PauseCircleOutline as PauseIcon } from "@vicons/ionicons5";

window.addEventListener("beforeunload", async (event) => {
  await fetch("/api/closeServer");
});

window.addEventListener("load", async (event) => {
  await fetch("/api/stopCloseServer");
});

fetchSongs();

const audioRef = ref<HTMLAudioElement>();

const currentSong = ref("");

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
          text: true,
          style: {
            fontSize: "24px",
            paddingTop: "2px",
            paddingBottom: "-2px",
          },
          onClick: async () => {
            currentSong.value = rowData.name;
            await getSongUrl(rowData.dir + "\\" + rowData.name + ".ogg");
            audioRef.value?.load();
            audioRef.value?.play();
          },
        },
        [h(NIcon, currentSong.value !== rowData.name ? [h(PlayIcon)] : [h(PauseIcon)])]
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
        key: `${key}-level`,
        align: "center",
        width: 80,
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
        sorter(rowA, rowB) {
          switch (key) {
            case "easy":
              return rowA.easy.level - rowB.easy.level;
            case "normal":
              return rowA.normal.level - rowB.normal.level;
            case "hard":
              return rowA.hard.level - rowB.hard.level;
            case "oni":
              return rowA.oni.level - rowB.oni.level;
            case "extreme":
              return (rowA.extreme?.level || 0) - (rowB.extreme?.level || 0);
          }
          return 0;
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
