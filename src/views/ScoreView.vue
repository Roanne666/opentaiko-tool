<style scoped></style>

<template>
  <n-flex vertical justify="center">
    <song-table :use-score="true" :columns="columns"></song-table>
  </n-flex>
</template>

<script setup lang="ts">
import { type DataTableColumn, type DataTableColumnGroup, NFlex } from "naive-ui";
import { basicColumns, createlevelSubCloumn } from "@/stores/song";
import type { DifficlutyType, Song } from "@server/song";
import SongTable from "@/components/SongTable.vue";

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
