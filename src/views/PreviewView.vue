<style>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(1080px);
  opacity: 0;
}

.back-songs {
  position: absolute;
  z-index: 99999;
  top: 0px;
}
.back-songs:hover {
  cursor: pointer;
}

.music-controller {
  position: absolute;
  bottom: 50px;
  width: 93%;
}
</style>

<template>
  <n-icon v-show="isPreview" class="back-songs" @click="backToSongs" size="30"><back-icon></back-icon></n-icon>
  <transition
    @enter="onEnter"
    @after-enter="
      () => {
        if (currentSong) isPreview = true;
      }
    "
    name="slide-fade"
    mode="out-in"
  >
    <n-flex v-if="!currentSong" vertical justify="center">
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
      <n-scrollbar style="max-height: 88vh">
        <n-flex justify="center">
          <canvas ref="canvasRef" width="1080" height="1200"></canvas>
        </n-flex>
      </n-scrollbar>
    </n-flex>
  </transition>
  <n-flex v-show="isPreview" class="music-controller" justify="center">
    <audio ref="audioRef" controls style="width: 1000px"></audio>
  </n-flex>
</template>

<script setup lang="ts">
import { Transition, h, onMounted, ref } from "vue";
import { NButton, NDataTable, NIcon, type DataTableColumn, type DataTableColumnGroup, NFlex, NScrollbar } from "naive-ui";
import { allSongs, showSongs, basicColumns, createlevelSubCloumn } from "@/stores/song";
import type { DifficlutyType, DifficultyInfo, Song } from "@server/song";
import { ArrowBackCircleOutline as BackIcon } from "@vicons/ionicons5";
import { createBeatmap } from "@/scripts/beatmap";
import { watchBeatmap } from "@/scripts/beatmap";
import SongFilter from "@/components/SongFilter.vue";

const canvasRef = ref<HTMLCanvasElement>();
const audioRef = ref<HTMLAudioElement>();

const canvasHeight = ref(1200);

const currentSong = ref<Song>();
const currentDifficulty = ref<DifficlutyType>("oni");

const isPreview = ref(false);

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
  isPreview.value = false;
  currentSong.value = undefined;
  if (!audioRef.value) return;
  audioRef.value.pause();
  audioRef.value.currentTime = 0;
}

// 提前绘制谱面和获取音频时长
async function onEnter() {
  if (!currentSong.value) return;
  if (!audioRef.value) return;
  if (!canvasRef.value) return;
  createBeatmap(canvasRef.value, currentSong.value, currentDifficulty.value);
  canvasHeight.value = canvasRef.value.height + 1000;

  const { dir, wave } = currentSong.value;
  audioRef.value.src = dir + "\\" + wave;

  const difficultyInfo = currentSong.value.difficulties.find((d) => d.name === currentDifficulty.value) as DifficultyInfo;

  watchBeatmap(canvasRef.value, audioRef.value, currentSong.value, difficultyInfo);
}

function stopMusic() {
  if (!audioRef.value) return;
  audioRef.value.pause();
  audioRef.value.currentTime = 0;
}
</script>
