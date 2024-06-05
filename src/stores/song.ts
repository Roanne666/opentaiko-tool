import type { DifficlutyType, Song } from "@server/song";
import { reactive, ref } from "vue";

// ------- 常量 -------
export type DifficultyTypes = "all" | DifficlutyType;

/**
 * 等级列表
 */
export const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export type LevelTypes = (typeof levels)[number];

/**
 * 分数评价列表
 */
export const scores = {
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

/**
 * 分数评价类型
 */
export type ScoreTypes = keyof typeof scores;

// ------- 歌曲相关 -------

/**
 * 所有歌曲
 */
export const allSongs = reactive<Song[]>([]);

/**
 * 展示在页面的歌曲
 */
export const showSongs = reactive<Song[]>([]);

/**
 * 歌曲类目
 */
export const genre = reactive<string[]>([]);

/**
 * 获取所有歌曲
 */
export async function fetchAllSongs() {
  const res = await fetch("/api/songs", {
    method: "GET",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const newSongs = await res.json();
  console.log(newSongs);

  allSongs.length = 0;
  allSongs.push(...newSongs);
  showSongs.length = 0;
  showSongs.push(...newSongs);

  for (const s of allSongs) {
    if (genre.includes(s.genre)) continue;
    genre.push(s.genre);
  }
}

// ------- 播放音乐 -------

/**
 * 当前播放音乐的Url(base64)
 */
export const currentSongUrl = ref("");

/**
 * 获取音乐的Url(base64)
 * @param songPath
 */
export async function getSongUrl(songPath: string) {
  const res = await fetch("/api/playSong?songPath=" + songPath);
  const bs = await res.text();
  currentSongUrl.value = "data:audio/mp3;base64," + bs;
}
