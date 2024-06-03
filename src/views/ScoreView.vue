<style scoped></style>

<template>
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
import { onMounted, ref, watch } from "vue";
import {
  NDataTable,
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
  allSongs,
  showSongs,
  type ScoreTypes,
  levels,
  scores,
  type DifficultyTypes,
  type LevelTypes,
} from "@/stores/song";
import type { DifficultyInfo, Song } from "@server/song";

const genreSelect = ref(genre);
const difficultySelect = ref<DifficultyTypes>("all");
const levelSelect = ref<LevelTypes>(0);
const scoreSelcet = ref<ScoreTypes>("全部");

onMounted(() => {
  currentSongUrl.value = "";
  showSongs.length = 0;
  showSongs.push(...allSongs);
});

// 根据选项过滤歌曲
watch([genreSelect, difficultySelect, levelSelect, scoreSelcet], () => {
  const filterSongs = allSongs.filter((s) => {
    let isMatch = false;

    const dValue = difficultySelect.value;

    if (dValue === "all") {
      let levelMatch = levelSelect.value === 0;
      if (!levelMatch) {
        const anyMatch = ["easy", "normal", "hard", "oni", "extreme"].find((d) => {
          if (d === "easy" || d === "normal" || d === "hard" || d === "oni") {
            return s[d].level === levelSelect.value;
          } else if (d === "extreme" && s.extreme) {
            return s.extreme.level === levelSelect.value;
          }
          return false;
        });
        levelMatch = anyMatch !== undefined;
      }

      let scoreMatch = scoreSelcet.value === "全部";
      if (!scoreMatch) {
        const anyMatch = ["easy", "normal", "hard", "oni", "extreme"].find((d) => {
          if (d === "easy" || d === "normal" || d === "hard" || d === "oni") {
            const overMin = s[d].score >= scores[scoreSelcet.value][0];
            const lowerMax = s[d].score < scores[scoreSelcet.value][1];
            return overMin && lowerMax;
          } else if (d === "extreme" && s.extreme) {
            const overMin = s.extreme.score >= scores[scoreSelcet.value][0];
            const lowerMax = s.extreme.score < scores[scoreSelcet.value][1];
            return overMin && lowerMax;
          }
          return false;
        });
        scoreMatch = anyMatch !== undefined;
      }

      isMatch = levelMatch && scoreMatch;
    } else if (s[dValue]) {
      const levelMatch = levelSelect.value === 0 || (s[dValue] as DifficultyInfo).level === levelSelect.value;
      let scoreMatch = scoreSelcet.value === "全部";
      if (!scoreMatch) {
        const overMin = (s[dValue] as DifficultyInfo).score >= scores[scoreSelcet.value][0];
        const lowerMax = (s[dValue] as DifficultyInfo).score < scores[scoreSelcet.value][1];
        scoreMatch = overMin && lowerMax;
      }
      isMatch = levelMatch && scoreMatch;
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
  };
}
</script>
