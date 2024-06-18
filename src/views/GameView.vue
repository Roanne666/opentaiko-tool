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
  <transition v-show="!currentSong" @after-leave="enterPlay" name="slide-fade">
    <n-flex vertical justify="center">
      <song-table :use-score="false" :columns="columns"></song-table>
    </n-flex>
  </transition>

  <transition v-show="isPlay" name="slide-fade">
    <n-flex justify="center">
      <canvas ref="canvasRef" width="1200" height="1000" style="scale: 0.7" />
    </n-flex>
  </transition>

  <transition v-show="isPlay" name="slide-fade">
    <n-icon class="back-songs" @click="backToSongs" size="30">
      <back-icon></back-icon>
    </n-icon>
  </transition>

  <audio ref="audioRef" />
</template>

<script setup lang="ts">
import { Transition, h, ref } from "vue";
import { NButton, NIcon, type DataTableColumn, type DataTableColumnGroup, NFlex } from "naive-ui";
import { basicColumns, createlevelSubCloumn } from "@/scripts/stores/song";
import type { DifficlutyType, Song } from "@server/song";
import { ArrowBackCircleOutline as BackIcon } from "@vicons/ionicons5";
import SongTable from "@/components/SongTable.vue";
import { isInGame } from "@/scripts/stores/global";
import { GameController } from "@/scripts/game/gameController";

const canvasRef = ref<HTMLCanvasElement>();
const audioRef = ref<HTMLAudioElement>();

const currentSong = ref<Song>();
const currentDifficulty = ref<DifficlutyType>("oni");

let gameController: GameController | undefined;
const isPlay = ref(false);

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
        title: "操作",
        key: `${key}handle`,
        align: "center",
        width: 100,
        render(row, rowIndex) {
          const d = row.difficulties.find((d) => d.name === key);
          if (d && d.level !== 0) {
            return h(
              NButton,
              {
                onClick() {
                  currentSong.value = row;
                  currentDifficulty.value = key;
                  isInGame.value = true;
                },
              },
              () => "游玩"
            );
          }
          return "";
        },
      },
    ],
  };
}

async function backToSongs() {
  isPlay.value = false;
  gameController?.stop();
  await new Promise((resolve) => setTimeout(() => resolve(true), 250));
  isInGame.value = false;
  currentSong.value = undefined;
  if (!audioRef.value) return;
  audioRef.value.pause();
  audioRef.value.currentTime = 0;
}

// 提前绘制谱面和获取音频时长
async function enterPlay() {
  isPlay.value = true;
  if (!currentSong.value) return;
  if (!audioRef.value) return;
  if (!canvasRef.value) return;

  if (!gameController) gameController = new GameController(canvasRef.value, audioRef.value);
  gameController.play(currentSong.value, currentDifficulty.value);
}
</script>
