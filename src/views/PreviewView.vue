<template>
  <audio ref="audioRef" :src="currentSongUrl" autoplay="true"></audio>
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
  </n-flex>
  <canvas ref="canvasRef"></canvas>
</template>

<script setup lang="ts">
import { h, onMounted, ref, watch } from "vue";
import {
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
import {
  currentSongUrl,
  genre,
  getSongUrl,
  allSongs,
  showSongs,
  levels,
  type DifficultyTypes,
  type LevelTypes,
} from "@/stores/song";
import type { DifficultyInfo, Song } from "@server/song";
import { PlayCircleOutline as PlayIcon, StopCircleOutline as StopIcon } from "@vicons/ionicons5";
import { createBeatmapImage } from "@/scripts/canvas";

const canvasRef = ref<HTMLCanvasElement>();

const audioRef = ref<HTMLAudioElement>();
const currentSong = ref("");

const genreSelect = ref(genre);
const difficultySelect = ref<DifficultyTypes>("all");
const levelSelect = ref<LevelTypes>(0);

onMounted(() => {
  currentSongUrl.value = "";
  showSongs.length = 0;
  showSongs.push(...allSongs);

  const context = canvasRef.value?.getContext("2d") as CanvasRenderingContext2D;
  createBeatmapImage(context);
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
        const anyMatch = ["easy", "normal", "hard", "oni", "extreme"].find((d) => {
          if (d === "easy" || d === "normal" || d === "hard" || d === "oni") {
            return s[d].level === levelSelect.value;
          } else if (d === "extreme" && s.extreme) {
            return s.extreme.level === levelSelect.value;
          }
          return false;
        });
        isMatch = anyMatch !== undefined;
      }
    } else if (s[dValue]) {
      isMatch = levelSelect.value === 0 || (s[dValue] as DifficultyInfo).level === levelSelect.value;
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
  {
    title: "播放",
    key: "play",
    align: "center",
    width: 100,
    render(row, rowIndex) {
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
            if (currentSong.value === row.name) {
              currentSong.value = "";
              audioRef.value?.pause();
            } else {
              currentSong.value = row.name;
              await getSongUrl(row.dir + "\\" + row.name + ".ogg");
              audioRef.value?.load();
              audioRef.value?.play();
            }
          },
        },
        () => [h(NIcon, currentSong.value !== row.name ? () => [h(PlayIcon)] : () => [h(StopIcon)])]
      );
    },
  },
  createDiffultyColumn("梅", "easy"),
  createDiffultyColumn("竹", "normal"),
  createDiffultyColumn("松", "hard"),
  createDiffultyColumn("鬼", "oni"),
  createDiffultyColumn("里", "extreme"),
];

function createDiffultyColumn(title: string, key: string): DataTableColumnGroup<Song> {
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
          if (key === "easy" || key === "normal" || key === "hard" || key === "oni" || key === "extreme") {
            return row[key] ? `${row[key]?.level}★` : "";
          }
          return "";
        },
      },
      {
        title: "谱面预览",
        key: `${key}preview`,
        align: "center",
        width: 110,
        render(row, rowIndex) {
          if (key === "easy" || key === "normal" || key === "hard" || key === "oni" || key === "extreme") {
            if (row[key] && row[key]?.level !== 0) {
              return h(
                NButton,
                {
                  onClick() {},
                },
                () => "预览"
              );
            }
          }
          return "";
        },
      },
    ],
  };
}
</script>
