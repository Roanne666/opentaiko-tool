import { readdirSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { type Beatmap, parseBeatmap } from "./beatmap";
import { isDir } from "./utils";
import iconv from "iconv-lite";

export type DifficlutyType = "easy" | "normal" | "hard" | "oni" | "extreme";

export type DifficultyInfo = {
  name: DifficlutyType;
  level: number;
  score: number;
  scoreInit: number;
  scoreDiff: number;
  balloon: number[];
  beatmap: Beatmap;
};

export type Song = {
  name: string;
  bpm: number;
  wave: string;
  offset: number;
  dir: string;
  genre: string;
  difficulties: DifficultyInfo[];
};

const defaultExclude = ["S1 Dan-i Dojo", "S2 Taiko Towers", "X1 Favorite", "X2 Recent", "X3 Search By Difficulty"];

export async function loadSongs(root: string, exclude = defaultExclude) {
  const stat = await isDir(root);
  if (!stat) return [];
  const songs: Song[] = await parseSongs(root, exclude);
  return songs;
}

async function parseSongs(path: string, exclude: string[], use1P = true) {
  return new Promise<Song[]>(async (res) => {
    const songs: Song[] = [];

    // 读取类目文件夹
    const genreDirs = readdirSync(path);

    for (const g of genreDirs) {
      const genreDirPath = join(path, g);
      if (exclude.includes(g)) continue;

      const stat = await isDir(genreDirPath);
      if (!stat) continue;

      // 读取歌曲文件夹
      const songDirs = readdirSync(genreDirPath);
      if (!songDirs.includes("box.def")) continue;
      const { genre } = parseBoxDef(join(genreDirPath, "box.def"));

      for (const d of songDirs) {
        const songDirPath = join(genreDirPath, d);
        const stat = await isDir(songDirPath);
        if (!stat) continue;

        // 读取歌曲相关文件
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

          for (const key in scores) {
            const d = song.difficulties.find((d) => d.name === key);
            if (d) d.score = scores[key as DifficlutyType];
          }
        }
      }
    }
    res(songs);
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
    bpm: 0,
    offset: 0,
    wave: "",
    difficulties: [],
  };

  let content = readFileSync(filePath).toString();
  if (content.includes("�")) {
    const binary = readFileSync(filePath, { encoding: "binary" });
    const buffers = Buffer.from(binary, "binary");
    content = iconv.decode(buffers, "Shift_JIS");
  }

  const lines = content.split("\n");

  // 当前难度信息
  let dInfo: DifficultyInfo | undefined = undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();

    if (line.includes("wave:")) song.wave = lines[i].split(":")[1];

    if (line.includes("bpm:")) song.bpm = Number(line.split(":")[1]);

    if (line.includes("offset:")) song.offset = Number(line.split(":")[1]);

    if (line.includes("course:")) {
      const d = line.split(":")[1];
      if (d === "edit" || d === "extreme" || d === "4") {
        dInfo = createNewDifficultyInfo("extreme");
        song.difficulties.push(dInfo);
      } else if (d === "oni" || d === "3") {
        dInfo = createNewDifficultyInfo("oni");
        song.difficulties.push(dInfo);
      } else if (d === "hard" || d === "2") {
        dInfo = createNewDifficultyInfo("hard");
        song.difficulties.push(dInfo);
      } else if (d === "normal" || d === "1") {
        dInfo = createNewDifficultyInfo("normal");
        song.difficulties.push(dInfo);
      } else if (d === "easy" || d === "0") {
        dInfo = createNewDifficultyInfo("easy");
        song.difficulties.push(dInfo);
      }
    }

    if (line.includes("level:") && dInfo) dInfo.level = Number(line.split(":")[1]);

    if (line.includes("balloon:") && dInfo) {
      dInfo.balloon = line
        .split(":")[1]
        .split(",")
        .map((s) => Number(s));
    }
    if (line.includes("scoreinit:") && dInfo) dInfo.scoreInit = Number(line.split(":")[1]);
    if (line.includes("scorediff:") && dInfo) dInfo.scoreDiff = Number(line.split(":")[1]);

    if (line.includes("#start") && dInfo) {
      const { end, beatmap } = parseBeatmap(lines, i);
      dInfo.beatmap = beatmap;
      i = end;
    }
  }

  return song;
}

function createNewDifficultyInfo(difficulty: "easy" | "normal" | "hard" | "oni" | "extreme"): DifficultyInfo {
  return {
    name: difficulty,
    level: 0,
    score: 0,
    scoreInit: 0,
    scoreDiff: 0,
    balloon: [],
    beatmap: {
      changes: {},
      beats: [],
    },
  };
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
