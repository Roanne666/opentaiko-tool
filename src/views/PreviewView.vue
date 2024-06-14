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
  <transition v-show="!currentSong" @after-leave="enterPreview" name="slide-fade">
    <n-flex vertical justify="center">
      <song-table :use-score="false" :columns="columns"></song-table>
    </n-flex>
  </transition>

  <transition v-show="isPreview" name="slide-fade">
    <n-flex vertical justify="center">
      <n-scrollbar style="max-height: 90vh">
        <n-flex justify="center">
          <canvas ref="canvasRef" width="1080" height="1200"></canvas>
        </n-flex>
        <n-back-top :right="100" :bottom="20" />
      </n-scrollbar>
      <n-flex justify="center">
        <audio ref="audioRef" controls oncontextmenu="return false" controlslist="nodownload" style="width: 1000px" />
      </n-flex>
    </n-flex>
  </transition>

  <transition v-show="isPreview" name="slide-fade">
    <n-icon class="back-songs" @click="backToSongs" size="30">
      <back-icon></back-icon>
    </n-icon>
  </transition>
</template>

<script setup lang="ts">
import { Transition, h, ref } from "vue";
import { NButton, NIcon, type DataTableColumn, type DataTableColumnGroup, NFlex, NScrollbar, NBackTop } from "naive-ui";
import { basicColumns, createlevelSubCloumn } from "@/stores/song";
import type { DifficlutyType, Song } from "@server/song";
import { ArrowBackCircleOutline as BackIcon } from "@vicons/ionicons5";
import { createBeatmap } from "@/scripts/beatmap";
import SongTable from "@/components/SongTable.vue";
import { BeatmapViewer } from "@/scripts/beatmap/viewer";

const canvasRef = ref<HTMLCanvasElement>();
const audioRef = ref<HTMLAudioElement>();

const canvasHeight = ref(1200);

const currentSong = ref<Song>();
const currentDifficulty = ref<DifficlutyType>("oni");

let beatmapViewer: BeatmapViewer | undefined;
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
                  enterPreview();
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

async function backToSongs() {
  isPreview.value = false;
  await new Promise((resolve) => setTimeout(() => resolve(true), 250));
  currentSong.value = undefined;
  if (!audioRef.value) return;
  audioRef.value.pause();
  audioRef.value.currentTime = 0;
}

// 提前绘制谱面和获取音频时长
async function enterPreview() {
  await new Promise((resolve) => setTimeout(() => resolve(true), 250));
  isPreview.value = true;
  if (!currentSong.value) return;
  if (!audioRef.value) return;
  if (!canvasRef.value) return;
  const { beatmap, imageData } = createBeatmap(canvasRef.value, currentSong.value, currentDifficulty.value);
  canvasHeight.value = canvasRef.value.height + 1000;

  const { dir, wave } = currentSong.value;
  audioRef.value.src = dir + "\\" + wave;

  if (!beatmapViewer) beatmapViewer = new BeatmapViewer(canvasRef.value, audioRef.value);
  beatmapViewer.init(beatmap, imageData, currentSong.value);
}
</script>
