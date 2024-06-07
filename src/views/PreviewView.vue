<template>
  <audio ref="audioRef"></audio>
  <n-flex vertical>
    <div>
      <n-checkbox-group v-model:value="genreSelect">
        <n-space item-style="display: flex;">
          <span>类目：</span>
          <n-checkbox v-for="g of genre" :value="g" :label="g" />
        </n-space>
      </n-checkbox-group>
    </div>
    <div>
      <n-radio-group v-model:value="difficultySelect" name="radiogroup">
        <n-space>
          <span>难度：</span>
          <n-radio value="all"> 全部 </n-radio>
          <n-radio value="easy"> 梅 </n-radio>
          <n-radio value="normal"> 竹 </n-radio>
          <n-radio value="hard"> 松 </n-radio>
          <n-radio value="oni"> 鬼 </n-radio>
          <n-radio value="extreme"> 里 </n-radio>
        </n-space>
      </n-radio-group>
    </div>
    <div>
      <n-radio-group v-model:value="levelSelect" name="radiogroup">
        <n-space>
          <span>等级：</span>
          <n-radio v-for="l of levels" :key="`${l}`" :value="l">
            {{ l === 0 ? "全部" : l }}
          </n-radio>
        </n-space>
      </n-radio-group>
    </div>
    <n-data-table
      :columns="columns"
      :data="showSongs"
      :pagination="{
        pageSize: 10,
      }"
      :single-line="false"
    ></n-data-table>
    <n-divider></n-divider>
    <div v-show="currentSong">
      <n-icon v-if="playing" @click="handleBeatmap(false)"><stop-icon /></n-icon>
      <n-icon v-else @click="handleBeatmap(true)"><play-icon /></n-icon>
    </div>

    <div style="margin: auto">
      <canvas ref="canvasRef" width="1060" height="1200" style=""></canvas>
    </div>
  </n-flex>
</template>

<script setup lang="ts">
import { h, onMounted, ref, watch } from "vue";
import {
  NDivider,
  NButton,
  NDataTable,
  NIcon,
  type DataTableColumn,
  type DataTableColumnGroup,
  NCheckboxGroup,
  NSpace,
  NCheckbox,
  NRadioGroup,
  NRadio,
  NFlex,
} from "naive-ui";
import { genre, allSongs, showSongs, levels, type DifficultyTypes, type LevelTypes } from "@/stores/song";
import type { DifficlutyType, Song } from "@server/song";
import { PlayCircleOutline as PlayIcon, StopCircleOutline as StopIcon } from "@vicons/ionicons5";
import { createBeatmap } from "@/scripts/beatmap";
import { wait } from "@/scripts/beatmap/utils";
import { playBeatmap, playing } from "@/scripts/beatmap/play";

const canvasRef = ref<HTMLCanvasElement>();

const audioRef = ref<HTMLAudioElement>();

const genreSelect = ref(genre);
const difficultySelect = ref<DifficultyTypes>("all");
const levelSelect = ref<LevelTypes>(0);

const currentSong = ref<Song>();
const currentDifficulty = ref<DifficlutyType>("oni");

onMounted(() => {
  currentSong.value = undefined;
  showSongs.length = 0;
  showSongs.push(...allSongs);
});

onMounted(() => {});

// 根据选项过滤歌曲
watch([genreSelect, difficultySelect, levelSelect], () => {
  const filterSongs = allSongs.filter((s) => {
    let isMatch = false;

    const dValue = difficultySelect.value;

    if (dValue === "all") {
      isMatch = levelSelect.value === 0;
      if (!isMatch) {
        isMatch = s.difficulties.find((d) => d.level === levelSelect.value) ? true : false;
      }
    } else {
      const d = s.difficulties.find((d) => d.name === dValue);
      if (d) isMatch = levelSelect.value === 0 || d.level === levelSelect.value;
    }

    return genreSelect.value.includes(s.genre) && isMatch;
  });

  showSongs.length = 0;
  showSongs.push(...filterSongs);
});

const columns: (DataTableColumn<Song> | DataTableColumnGroup<Song>)[] = [
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
      {
        title: "等级",
        key: `${key}level`,
        align: "center",
        width: 80,
        render(row, rowIndex) {
          const d = row.difficulties.find((d) => d.name === key);
          return d ? `${d.level}★` : "";
        },
      },
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
                  createBeatmap(canvasRef.value as HTMLCanvasElement, row, key);
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

async function handleBeatmap(play: boolean) {
  if (!audioRef.value || !currentSong.value) return;
  if (play) {
    playing.value = true;
    createBeatmap(canvasRef.value as HTMLCanvasElement, currentSong.value, currentDifficulty.value);

    const { offset, dir, name } = currentSong.value;
    audioRef.value.src = dir + "\\" + name + ".ogg";

    if (offset >= 0) {
      playBeatmap(canvasRef.value as HTMLCanvasElement, currentSong.value, currentDifficulty.value);
      await wait(offset * 1000);
      if (audioRef.value) audioRef.value.play();
    } else {
      if (audioRef.value) audioRef.value.play();
      await wait(Math.abs(offset) * 1000);
      playBeatmap(canvasRef.value as HTMLCanvasElement, currentSong.value, currentDifficulty.value);
    }
  } else {
    playing.value = false;
    stopMusic();
  }
}

function stopMusic() {
  if (audioRef.value) {
    audioRef.value.pause();
    audioRef.value.currentTime = 0;
  }
}
</script>
