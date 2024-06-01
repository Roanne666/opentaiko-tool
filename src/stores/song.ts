import type { Song } from "@server/song";
import { reactive, ref } from "vue";

export const allSongs = reactive<Song[]>([]);

export const showSongs = reactive<Song[]>([]);

export const genre = reactive<string[]>([]);

export async function fetchSongs() {
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

  allSongs.length = 0;
  allSongs.push(...newSongs);
  showSongs.length = 0
  showSongs.push(...newSongs)
  
  for (const s of allSongs) {
    if (genre.includes(s.genre)) continue;
    genre.push(s.genre);
  }
}

export const currentSongUrl = ref("");

export async function getSongUrl(songPath: string) {
  const res = await fetch("/api/playSong?songPath=" + songPath);
  const bs = await res.text();
  currentSongUrl.value = "data:audio/mp3;base64," + bs;
}
