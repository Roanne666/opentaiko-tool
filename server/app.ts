import { exec } from "child_process";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import type { AddressInfo } from "net";
import { loadSongs } from "./song";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { convertSongToTja } from "./utils";
import type { Song } from "./types";
const history = require("connect-history-api-fallback");
const iconv = require("iconv-lite");

const SONG_DIR = process.env.NODE_ENV ? "Songs" : "../Songs";

const app = express();
app.use(express.json());

app.use(
  history({
    rewrites: [
      {
        from: /^\/index\/.*$/,
        to: (context: any) => {
          return context.parsedUrl.path;
        },
      },
      {
        from: /^\/api\/.*$/,
        to: (context: any) => {
          return context.parsedUrl.path;
        },
      },
    ],
  })
);

if (!process.env.NODE_ENV) {
  app.use(express.static("web"));
  app.use(express.static(".."));
}

app.get("/api/songs", async (req: Request, res: Response, next: NextFunction) => {
  const songs = await loadSongs(SONG_DIR);
  res.send(songs);
});

app.post("/api/modifySong", async (req: Request, res: Response, next: NextFunction) => {
  const song: Song = req.body;
  const tjaString = convertSongToTja(song);
  const buffers = iconv.encode(tjaString, "Shift_JIS");
  writeFileSync(resolve(song.dir, song.name + ".tja"), buffers);
  res.send(true);
});

if (process.env.NODE_ENV) {
  app.listen(3000, () => {
    console.log(`Example app listening on http://localhost:3000`);
  });
} else {
  const server = app.listen(0, () => {
    const address = server.address() as AddressInfo;
    console.log(`- opentaiko-tool启动 作者：Roanne（滑滑） B站：https://space.bilibili.com/23383232`);
    console.log(`- 正在打开网页`);
    exec(`start http://localhost:${address.port}`);
    console.log(`- 如意外关闭请重新打开网页：http://localhost:${address.port}`);
    console.log(`- 请勿重复启动软件，否则可能会造成卡顿`);
    console.log(`- 使用完毕后请关闭此窗口`);
  });
}
