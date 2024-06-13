<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(1080px);
  opacity: 0;
}

.music-controller-enter-active,
.music-controller-leave-active {
  transition: all 0.25s;
}

.music-controller-enter-from,
.music-controller-leave-to {
  transform: translateY(100px);
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
</style>

<template>
  <transition @enter="onEnter" name="slide-fade" mode="out-in">
    <n-flex v-if="!currentSong" vertical justify="center">
      <song-table :use-score="false" :columns="columns"></song-table>
    </n-flex>

    <n-flex v-else vertical>
      <n-scrollbar style="max-height: 90vh">
        <n-flex justify="center">
          <canvas ref="canvasRef" width="1080" height="1200"></canvas>
        </n-flex>
        <n-back-top :right="100" :bottom="20" />
      </n-scrollbar>
    </n-flex>
  </transition>

  <transition v-show="isPreview" name="slide-fade">
    <n-icon class="back-songs" @click="backToSongs" size="30">
      <back-icon></back-icon>
    </n-icon>
  </transition>

  <transition v-show="isPreview" name="music-controller">
    <audio
      ref="audioRef"
      controls
      oncontextmenu="return false"
      controlslist="nodownload"
      style="position: absolute; width: 1000px; left: 21%; bottom: 30px"
    ></audio>
  </transition>
</template>

<script setup lang="ts">
import { Transition, h, ref } from "vue";
import { NButton, NIcon, type DataTableColumn, type DataTableColumnGroup, NFlex, NScrollbar, NBackTop } from "naive-ui";
import { basicColumns, createlevelSubCloumn } from "@/stores/song";
import type { DifficlutyType, DifficultyInfo, Song } from "@server/song";
import { ArrowBackCircleOutline as BackIcon } from "@vicons/ionicons5";
import { createBeatmap } from "@/scripts/beatmap";
import { previewBeatmap } from "@/scripts/beatmap";
import SongTable from "@/components/SongTable.vue";

const canvasRef = ref<HTMLCanvasElement>();
const audioRef = ref<HTMLAudioElement>();

const canvasHeight = ref(1200);

const currentSong = ref<Song>();
const currentDifficulty = ref<DifficlutyType>("oni");

const isPreview = ref(false);

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
  isPreview.value = currentSong.value !== undefined;
  if (!currentSong.value) return;
  if (!audioRef.value) return;
  if (!canvasRef.value) return;
  createBeatmap(canvasRef.value, currentSong.value, currentDifficulty.value);
  canvasHeight.value = canvasRef.value.height + 1000;

  const { dir, wave } = currentSong.value;
  audioRef.value.src = dir + "\\" + wave;

  const difficultyInfo = currentSong.value.difficulties.find(
    (d) => d.name === currentDifficulty.value
  ) as DifficultyInfo;

  previewBeatmap(canvasRef.value, audioRef.value, currentSong.value, difficultyInfo);
}
</script>
