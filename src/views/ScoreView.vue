<style scoped></style>

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
          <n-radio :value="0"> 全部 </n-radio>
          <n-radio v-for="l of levels" :key="`${l}`" :value="l">
            {{ l }}
          </n-radio>
        </n-space>
      </n-radio-group>
    </div>
    <div>
      <n-radio-group v-model:value="scoreSelcet" name="radiogroup">
        <n-space>
          <span>分数：</span>
          <n-radio v-for="(value, key) of scores" :key="key" :value="key"> {{ key }} </n-radio>
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
</template>

<script setup lang="ts">
import { h, reactive, ref, watch } from "vue";
import { NButton, NDataTable, NIcon, type DataTableColumn, type DataTableColumnGroup, NCheckboxGroup, NSpace, NCheckbox, NRadioGroup, NRadio, NFlex } from "naive-ui";
import { currentSongUrl, genre, getSongUrl, allSongs, showSongs } from "@/stores/song";
import type { ScoreInfo, Song } from "@server/song";
import { PlayCircleOutline as PlayIcon, PauseCircleOutline as PauseIcon } from "@vicons/ionicons5";

const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const scores = {
  全部: [0, 9999999],
  未合格: [0, 500000],
  白粋: [500000, 600000],
  銅粋: [600000, 700000],
  銀粋: [700000, 800000],
  金雅: [800000, 900000],
  桃雅: [900000, 950000],
  紫雅: [950000, 1000000],
  極: [1000000, 9999999],
} as const;

type scoresType = keyof typeof scores;

const audioRef = ref<HTMLAudioElement>();
const currentSong = ref("");

const genreSelect = ref(genre);
const difficultySelect = ref<"all" | "easy" | "normal" | "hard" | "oni" | "extreme">("all");
const levelSelect = ref(0);
const scoreSelcet = ref<scoresType>("全部");

watch([genreSelect, difficultySelect, levelSelect, scoreSelcet], () => {
  showSongs.length = 0;
  showSongs.push(
    ...allSongs.filter((s) => {
      let isMatch = false;

      const d = difficultySelect.value;

      if (d === "all") {
        let levelMatch =
          levelSelect.value === 0 ||
          s.easy.level === levelSelect.value ||
          s.normal.level === levelSelect.value ||
          s.hard.level === levelSelect.value ||
          s.oni.level === levelSelect.value;

        if (!levelMatch && s.extreme) {
          levelMatch = s.extreme.level === levelSelect.value;
        }

        let scoreMatch = scoreSelcet.value === "全部";
        if (!scoreMatch) {
          const easyLevelMatch = s.easy.score >= scores[scoreSelcet.value][0] && s.easy.score < scores[scoreSelcet.value][1];
          const normalLevelMatch = s.normal.score >= scores[scoreSelcet.value][0] && s.normal.score < scores[scoreSelcet.value][1];
          const hardLevelMatch = s.hard.score >= scores[scoreSelcet.value][0] && s.hard.score < scores[scoreSelcet.value][1];
          const oniLevelMatch = s.oni.score >= scores[scoreSelcet.value][0] && s.oni.score < scores[scoreSelcet.value][1];
          const extremeLevelMatch = s.extreme ? (s.extreme as ScoreInfo).score >= scores[scoreSelcet.value][0] && s.oni.level < scores[scoreSelcet.value][1] : false;
          scoreMatch = easyLevelMatch || normalLevelMatch || hardLevelMatch || oniLevelMatch || extremeLevelMatch;
        }

        isMatch = levelMatch && scoreMatch;
      } else if (s[d]) {
        const levelMatch = levelSelect.value === 0 || (s[d] as ScoreInfo).level === levelSelect.value;
        let scoreMatch = scoreSelcet.value === "全部";
        if (!scoreMatch) {
          scoreMatch = (s[d] as ScoreInfo).score >= scores[scoreSelcet.value][0] && (s[d] as ScoreInfo).score < scores[scoreSelcet.value][1];
        }
        isMatch = levelMatch && scoreMatch;
      }

      return genreSelect.value.includes(s.genre) && isMatch;
    })
  );
});

const columns: (DataTableColumn<Song> | DataTableColumnGroup<Song>)[] = reactive([
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
            currentSong.value = row.name;
            await getSongUrl(row.dir + "\\" + row.name + ".ogg");
            audioRef.value?.load();
            audioRef.value?.play();
          },
        },
        () => [h(NIcon, currentSong.value !== row.name ? () => [h(PlayIcon)] : () => [h(PauseIcon)])]
      );
    },
  },
  createDiffultyColumn("梅", "easy"),
  createDiffultyColumn("竹", "normal"),
  createDiffultyColumn("松", "hard"),
  createDiffultyColumn("鬼", "oni"),
  createDiffultyColumn("里", "extreme"),
]);

function createDiffultyColumn(title: string, key: string): DataTableColumnGroup<Song> {
  return reactive({
    title,
    key,
    align: "center",
    children: [
      {
        title: "等级",
        key: `${key}level`,
        align: "center",
        width: 90,
        render(row, rowIndex) {
          if (key === "easy" || key === "normal" || key === "hard" || key === "oni" || key === "extreme") {
            return row[key] ? `${row[key]?.level}★` : "";
          }
          return "";
        },
        sorter(rowA, rowB) {
          if (key === "easy" || key === "normal" || key === "hard" || key === "oni" || key === "extreme") {
            return (rowA[key]?.level || 0) - (rowB[key]?.level || 0);
          }
          return 0;
        },
      },
      {
        title: "分数",
        key: `${key}score`,
        align: "center",
        width: 110,
        render(row, rowIndex) {
          if (key === "easy" || key === "normal" || key === "hard" || key === "oni" || key === "extreme") {
            return row[key] ? row[key]?.score : "";
          }
          return "";
        },
        sorter(rowA, rowB) {
          if (key === "easy" || key === "normal" || key === "hard" || key === "oni" || key === "extreme") {
            return (rowA[key]?.score || 0) - (rowB[key]?.score || 0);
          }
          return 0;
        },
      },
    ],
  });
}

function getScoreRank(score: number) {
  if (score >= 1000000) {
    return "極";
  } else if (score >= 950000) {
    return "紫雅";
  } else if (score >= 900000) {
    return "桃雅";
  } else if (score >= 800000) {
    return "金雅";
  } else if (score >= 700000) {
    return "銀粋";
  } else if (score >= 600000) {
    return "銅粋";
  } else if (score >= 500000) {
    return "白粋";
  }
  return "未合格";
}
</script>
