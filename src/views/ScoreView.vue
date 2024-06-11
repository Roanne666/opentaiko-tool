<style scoped></style>

<template>
  <n-flex vertical>
    <song-filter :use-score="true"></song-filter>

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
import { onMounted } from "vue";
import { NDataTable, type DataTableColumn, type DataTableColumnGroup, NFlex } from "naive-ui";
import { allSongs, basicColumns, createlevelSubCloumn, showSongs } from "@/stores/song";
import type { DifficlutyType, Song } from "@server/song";
import SongFilter from "@/components/SongFilter.vue";

onMounted(() => {
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
        title: "分数",
        key: `${key}score`,
        align: "center",
        width: 110,
        render(row, rowIndex) {
          const d = row.difficulties.find((d) => d.name === key);
          return d ? d.score : "";
        },
        sorter(rowA, rowB) {
          const dA = rowA.difficulties.find((d) => d.name === key);
          const dB = rowB.difficulties.find((d) => d.name === key);
          if (dA && dB) return dA.score - dB.score;
          return 0;
        },
      },
    ],
  };
}
</script>
