<style>
/*
  进入和离开动画可以使用不同
  持续时间和速度曲线。
*/
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(1080px);
  opacity: 0;
}
</style>

<template>
  <transition @enter="onEnter" name="slide-fade" mode="out-in">
    <n-flex v-if="!currentSong" vertical>
      <song-filter :use-score="false"></song-filter>
      <n-data-table
        :columns="columns"
        :data="showSongs"
        :pagination="{
          pageSize: 10,
        }"
        :single-line="false"
      ></n-data-table>
    </n-flex>
    <n-flex v-else vertical>
      <div>
        <n-icon @click="backToSongs"><back-icon></back-icon></n-icon>
        <n-icon v-if="playing" @click="handleBeatmap(false)"><stop-icon /></n-icon>
        <n-icon v-else @click="handleBeatmap(true)"><play-icon /></n-icon>
      </div>

      <div style="margin: auto">
        <canvas ref="canvasRef" width="1060" height="1200" style=""></canvas>
      </div>
    </n-flex>
  </transition>
</template>

<script setup lang="ts">
import { Transition, h, onMounted, ref } from "vue";
import { NButton, NDataTable, NIcon, type DataTableColumn, type DataTableColumnGroup, NFlex } from "naive-ui";
import { allSongs, showSongs, audioElement, basicColumns, createlevelSubCloumn } from "@/stores/song";
import type { DifficlutyType, DifficultyInfo, Song } from "@server/song";
import {
  PlayCircleOutline as PlayIcon,
  StopCircleOutline as StopIcon,
  ArrowBackCircleOutline as BackIcon,
} from "@vicons/ionicons5";
import { createBeatmap } from "@/scripts/beatmap";
import { wait } from "@/scripts/beatmap/utils";
import { watchBeatmap, playing } from "@/scripts/beatmap";
import SongFilter from "@/components/SongFilter.vue";

document.body.appendChild(audioElement);

const canvasRef = ref<HTMLCanvasElement>();

const currentSong = ref<Song>();
const currentDifficulty = ref<DifficlutyType>("oni");

onMounted(() => {
  currentSong.value = undefined;
  showSongs.length = 0;
  showSongs.push(...allSongs);
});

const columns: (DataTableColumn<Song> | DataTableColumnGroup<Song>)[] = [
  ...basicColumns,
  createDiffultyColumn("梅", "easy"),
  createDiffultyColumn("竹", "normal"),
  createDiffultyColumn("松", "hard"),
  createDiffultyColumn("鬼", "oni"),
  createDiffultyColumn("里", "extreme"),
];

function createDiffultyColumn(title: string, key: DifficlutyType): DataTableColumnGroup<Song> {
  return {
    title,
    key,
    align: "center",
    children: [
      createlevelSubCloumn(key),
      {
        title: "谱面预览",
        key: `${key}preview`,
        align: "center",
        width: 110,
        render(row, rowIndex) {
          const d = row.difficulties.find((d) => d.name === key);
          if (d && d.level !== 0) {
            return h(
              NButton,
              {
                onClick() {
                  stopMusic();
                  currentSong.value = row;
                  currentDifficulty.value = key;
                },
              },
              () => "预览"
            );
          }
          return "";
        },
      },
    ],
  };
}

function backToSongs() {
  currentSong.value = undefined;
  playing.value = false;
  audioElement.pause();
  audioElement.currentTime = 0;
}

function onEnter() {
  if (currentSong.value) {
    createBeatmap(canvasRef.value as HTMLCanvasElement, currentSong.value, currentDifficulty.value);
  }
}

async function handleBeatmap(play: boolean) {
  if (!currentSong.value) return;
  if (play) {
    playing.value = true;
    createBeatmap(canvasRef.value as HTMLCanvasElement, currentSong.value, currentDifficulty.value);

    const difficultyInfo = currentSong.value.difficulties.find(
      (d) => d.name === currentDifficulty.value
    ) as DifficultyInfo;

    const { offset, dir, wave } = currentSong.value;
    audioElement.src = dir + "\\" + wave;

    if (offset >= 0) {
      watchBeatmap(canvasRef.value as HTMLCanvasElement, currentSong.value, difficultyInfo);
      await wait(offset * 1000);
      audioElement.play();
    } else {
      audioElement.play();
      await wait(Math.abs(offset) * 1000);
      watchBeatmap(canvasRef.value as HTMLCanvasElement, currentSong.value, difficultyInfo);
    }
  } else {
    playing.value = false;
    stopMusic();
  }
}

function stopMusic() {
  audioElement.pause();
  audioElement.currentTime = 0;
}
</script>
