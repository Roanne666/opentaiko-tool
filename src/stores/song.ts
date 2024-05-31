import type { Song } from "@server/song";
import { reactive, ref } from "vue";

export const songs = reactive<Song[]>([]);

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

  songs.length = 0;
  songs.push(...newSongs);
}

fetchSongs();

export const currentSongUrl = ref("");

export async function getSongUrl(songPath: string) {
  const res = await fetch("/api/playSong?songPath=" + songPath);
  const bs = await res.text();
  currentSongUrl.value = "data:audio/mp3;base64," + bs;
}
