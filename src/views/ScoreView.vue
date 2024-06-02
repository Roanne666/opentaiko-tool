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
import { h, ref, watch } from "vue";
import { NButton, NDataTable, NIcon, type DataTableColumn, type DataTableColumnGroup, NCheckboxGroup, NSpace, NCheckbox, NRadioGroup, NRadio, NFlex } from "naive-ui";
import { currentSongUrl, genre, getSongUrl, allSongs, showSongs, type ScoreTypes, levels, scores, type DifficultyTypes, type LevelTypes } from "@/stores/song";
import type { ScoreInfo, Song } from "@server/song";
import { PlayCircleOutline as PlayIcon, PauseCircleOutline as PauseIcon } from "@vicons/ionicons5";

const audioRef = ref<HTMLAudioElement>();
const currentSong = ref("");

const genreSelect = ref(genre);
const difficultySelect = ref<DifficultyTypes>("all");
const levelSelect = ref<LevelTypes>(0);
const scoreSelcet = ref<ScoreTypes>("全部");

watch([genreSelect, difficultySelect, levelSelect, scoreSelcet], () => {
  showSongs.length = 0;
  showSongs.push(
    ...allSongs.filter((s) => {
      let isMatch = false;

      const currentDifficulty = difficultySelect.value;

      if (currentDifficulty === "all") {
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
          const anyMatch = ["easy", "normal", "hard", "oni", "extreme"].find((d) => {
            if (d === "easy" || d === "normal" || d === "hard" || d === "oni") {
              return s[d].score >= scores[scoreSelcet.value][0] && s[d].score < scores[scoreSelcet.value][1];
            } else if (d === "extreme" && s.extreme) {
              return (s.extreme as ScoreInfo).score >= scores[scoreSelcet.value][0] && (s.extreme as ScoreInfo).level < scores[scoreSelcet.value][1];
            }
            return false;
          });
          scoreMatch = anyMatch !== undefined;
        }

        isMatch = levelMatch && scoreMatch;
      } else if (s[currentDifficulty]) {
        const levelMatch = levelSelect.value === 0 || (s[currentDifficulty] as ScoreInfo).level === levelSelect.value;
        let scoreMatch = scoreSelcet.value === "全部";
        if (!scoreMatch) {
          scoreMatch = (s[currentDifficulty] as ScoreInfo).score >= scores[scoreSelcet.value][0] && (s[currentDifficulty] as ScoreInfo).score < scores[scoreSelcet.value][1];
        }
        isMatch = levelMatch && scoreMatch;
      }

      return genreSelect.value.includes(s.genre) && isMatch;
    })
  );
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
