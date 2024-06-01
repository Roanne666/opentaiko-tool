import { statSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

export type ScoreInfo = {
  level: number;
  score: number;
};

export type Song = {
  name: string;
  dir: string;
  genre: string;
  easy: ScoreInfo;
  normal: ScoreInfo;
  hard: ScoreInfo;
  oni: ScoreInfo;
  extreme?: ScoreInfo;
};

const defaultExclude = ["S1 Dan-i Dojo", "S2 Taiko Towers", "X1 Favorite", "X2 Recent", "X3 Search By Difficulty"];

export async function loadSongs(root = "Songs", exclude = defaultExclude) {
  const stat = await isDir(root);
  if (!stat) return [];
  const songs: Song[] = await parseSongs(root, exclude);
  return songs;
}

async function parseSongs(path: string, exclude: string[], use1P = true) {
  return new Promise<Song[]>(async (resolve) => {
    const songs: Song[] = [];

    const genreDirs = readdirSync(path);

    for (const g of genreDirs) {
      const genreDirPath = join(path, g);
      if (exclude.includes(g)) continue;

      const stat = await isDir(genreDirPath);
      if (!stat) continue;

      const songDirs = readdirSync(genreDirPath);
      if (!songDirs.includes("box.def")) continue;
      const { genre } = parseBoxDef(join(genreDirPath, "box.def"));

      for (const d of songDirs) {
        const songDirPath = join(genreDirPath, d);
        const stat = await isDir(songDirPath);
        if (!stat) continue;

        const songFiles = readdirSync(songDirPath);
        if (!songFiles.find((s) => s.includes(".tja"))) continue;

        for (const f of songFiles) {
          if (!f.endsWith("tja")) continue;
          const songName = f.split(".tja")[0];
          const song: Song = parseSong(songName, songDirPath, genre, join(songDirPath, f));
          songs.push(song);

          if (!songFiles.find((s) => (use1P ? s.includes("tja1P.score") : s.includes("tja2P.score")))) continue;
          const scorePath = use1P ? join(songDirPath, songName + ".tja1P.score.ini") : join(songDirPath, songName + ".tja2P.score.ini");
          const scores = parseScores(scorePath);
          song.easy.score = scores.easy;
          song.normal.score = scores.normal;
          song.hard.score = scores.hard;
          song.oni.score = scores.oni;
          if (song.extreme) song.extreme.score = scores.extreme;
        }
      }
    }

    resolve(songs);
  });
}

function parseBoxDef(path: string) {
  const content = readFileSync(path).toString();
  const lines = content.split("#");
  return { genre: lines[1].split(":")[1].trim() };
}

function parseSong(songName: string, dir: string, genre: string, filePath: string) {
  const song: Song = {
    name: songName,
    dir,
    genre,
    easy: { level: 0, score: 0 },
    normal: { level: 0, score: 0 },
    hard: { level: 0, score: 0 },
    oni: { level: 0, score: 0 },
  };

  const content = readFileSync(filePath).toString();
  const lines = content.split("\n");

  let currentScoreInfo: ScoreInfo = song.oni;

  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i].toLowerCase();

    if (line.includes("course:edit") || line.includes("course:extreme") || line.includes("course:4")) {
      song.extreme = { level: 0, score: 0 };
      currentScoreInfo = song.extreme;
    } else if (line.includes("course:oni") || line.includes("course:3")) {
      currentScoreInfo = song.oni;
    } else if (line.includes("course:hard") || line.includes("course:2")) {
      currentScoreInfo = song.hard;
    } else if (line.includes("course:normal") || line.includes("course:1")) {
      currentScoreInfo = song.normal;
    } else if (line.includes("course:easy") || line.includes("course:0")) {
      currentScoreInfo = song.easy;
    }

    if (line.includes("level:")) {
      currentScoreInfo.level = Number(lines[i].split(":")[1].trim());
    }
  }

  return song;
}

function parseScores(path: string) {
  const scores = {
    easy: 0,
    normal: 0,
    hard: 0,
    oni: 0,
    extreme: 0,
  };

  const content = readFileSync(path).toString();
  const lines = content.split("\r\n");
  for (const l of lines) {
    if (l.includes("HiScore1")) scores.easy = Number(l.split("=")[1]);
    if (l.includes("HiScore2")) scores.normal = Number(l.split("=")[1]);
    if (l.includes("HiScore3")) scores.hard = Number(l.split("=")[1]);
    if (l.includes("HiScore4")) scores.oni = Number(l.split("=")[1]);
    if (l.includes("HiScore5")) scores.extreme = Number(l.split("=")[1]);
  }
  return scores;
}

async function isDir(path: string) {
  return new Promise<boolean>(async (resolve) => {
    const stat = statSync(path);
    resolve(stat.isDirectory());
  });
}
