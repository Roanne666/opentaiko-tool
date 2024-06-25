<style scoped></style>

<template>
  <n-flex vertical justify="center">
    <n-scrollbar style="max-height: 90vh">
      <n-flex justify="center">
        <canvas ref="canvasRef" width="1080" height="1200"></canvas>
      </n-flex>
      <n-back-top :right="props.backTopRight" :bottom="20" />
    </n-scrollbar>
    <n-flex justify="center">
      <audio ref="audioRef" controls oncontextmenu="return false" controlslist="nodownload" style="width: 1000px" />
    </n-flex>
  </n-flex>
</template>

<script setup lang="ts">
import { BeatmapViewer } from "@/scripts/beatmap";
import type { DifficlutyType, Song } from "@server/types";
import { NFlex, NScrollbar, NBackTop } from "naive-ui";
import { ref, watch } from "vue";
const canvasRef = ref<HTMLCanvasElement>();
const audioRef = ref<HTMLAudioElement>();
const canvasHeight = ref(1200);

let beatmapViewer: BeatmapViewer | undefined;

const props = defineProps<{
  currentSong: Song | undefined;
  currentDifficulty: DifficlutyType;
  backTopRight: number;
  showOptions: string[];
  updateCount?: number;
}>();

watch(props, () => {
  if (!audioRef.value) return;
  if (!canvasRef.value) return;
  if (props.currentSong) {
    if (!props.updateCount || props.updateCount === 0) {
      const { dir, wave } = props.currentSong;
      audioRef.value.src = dir + "\\" + wave;
    }

    if (!beatmapViewer) beatmapViewer = new BeatmapViewer(canvasRef.value, audioRef.value);
    beatmapViewer.init(props.currentSong, props.currentDifficulty, props.showOptions);
    canvasHeight.value = canvasRef.value.height + 1000;
  } else {
    audioRef.value.pause();
    audioRef.value.currentTime = 0;
  }
});
</script>
