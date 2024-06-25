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
  <transition v-show="!currentSong" @after-leave="isEdit = true" name="slide-fade">
    <n-flex vertical justify="center">
      <song-table
        :use-score="false"
        :columns="columns"
        @change-options="
          (options) => {
            showOptions = options;
          }
        "
      ></song-table>
    </n-flex>
  </transition>

  <transition v-show="isEdit" name="slide-fade">
    <n-flex justify="center">
      <n-flex vertical style="width: 450px; margin-left: 50px; margin-right: 20px">
        <n-input
          type="textarea"
          placeholder="请输入谱面内容"
          :resizable="false"
          v-model:value="beatmapInput"
          @input="updateBeatmap"
          style="height: 90vh"
        />
        <n-flex style="margin-top: 10px" justify="center">
          <n-button :disabled="isUpdating" @click="saveSong" style="margin-top: -5px">保存谱面</n-button>
          <n-divider vertical style="height: 100%" />
          <span>预览延迟：</span>
          <n-slider
            v-model:value="previewDelay"
            :step="0.5"
            :max="2"
            :min="0"
            style="width: 200px; padding-top: 10px"
          />
        </n-flex>
      </n-flex>

      <preview-canvas
        :current-song="currentSong"
        :current-difficulty="currentDifficulty"
        :back-top-right="50"
        :updateCount="updateCount"
        :showOptions="showOptions"
      ></preview-canvas>
    </n-flex>
  </transition>

  <transition v-show="isEdit" name="slide-fade">
    <n-icon class="back-songs" @click="backToSongs" size="30">
      <back-icon></back-icon>
    </n-icon>
  </transition>
</template>

<script setup lang="ts">
import { Transition, h, ref } from "vue";
import {
  NButton,
  NIcon,
  type DataTableColumn,
  type DataTableColumnGroup,
  NFlex,
  NInput,
  NSlider,
  NDivider,
  useMessage,
} from "naive-ui";
import { basicColumns, createlevelSubCloumn } from "@/scripts/stores/song";
import type { DifficlutyType, DifficultyInfo, Song } from "@server/types";
import { ArrowBackCircleOutline as BackIcon } from "@vicons/ionicons5";
import SongTable from "@/components/SongTable.vue";
import { Throttler } from "@/scripts/utils";
import { hideSideBar } from "@/scripts/stores/global";
import PreviewCanvas from "@/components/PreviewCanvas.vue";

const currentSong = ref<Song>();
const currentDifficulty = ref<DifficlutyType>("oni");
const updateCount = ref(0);
const showOptions = ref<string[]>([]);

const isEdit = ref(false);

const beatmapInput = ref("");
const previewDelay = ref(1);
const isUpdating = ref(false);

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
                  beatmapInput.value = d.beatmapData.join("\n");
                  hideSideBar.value = true;
                },
              },
              () => "编辑"
            );
          }
          return "";
        },
      },
    ],
  };
}

async function backToSongs() {
  isEdit.value = false;
  hideSideBar.value = false;
  await new Promise((resolve) => setTimeout(() => resolve(true), 250));
  currentSong.value = undefined;
  updateCount.value = 0;
}

const throttle = new Throttler(previewDelay);
async function updateBeatmap() {
  isUpdating.value = true;
  const status = await throttle.update();
  if (status) {
    if (!currentSong.value) return;

    const d = currentSong.value.difficulties.find((d) => d.name === currentDifficulty.value) as DifficultyInfo;
    d.beatmapData = beatmapInput.value.split("\n");

    updateCount.value += 1;
    isUpdating.value = false;
  }
}

const message = useMessage();
async function saveSong() {
  const response = await fetch("/api/modifySong", {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify(currentSong.value),
  });

  const status = await response.json();
  if (status) {
    message.success("保存成功");
  } else {
    message.success("保存失败，请手动保存");
  }
}
</script>
