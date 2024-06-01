import { exec } from "child_process";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import type { AddressInfo } from "net";
import { type Song, loadSongs } from "./song";
import { createReadStream } from "fs";

const app = express();

app.use(express.static("dist"));

let isClose = false;

app.get("/api/closeServer", (req: Request, res: Response, next: NextFunction) => {
  isClose = true;
  res.send(true);
  setTimeout(() => {
    if (isClose) process.exit();
  }, 10000);
});

app.get("/api/stopCloseServer", (req: Request, res: Response, next: NextFunction) => {
  isClose = false;
  res.send(true);
});

app.get("/api/songs", async (req: Request, res: Response, next: NextFunction) => {
  const songs: Song[] = await loadSongs("D:\\Game\\OpenTaiko-v0.5.3.1\\Songs");
  res.send(songs);
});

app.get("/api/playSong", (req: Request, res: Response, next: NextFunction) => {
  const path = req.query.songPath as string;

  const chunks: Buffer[] = [];
  const rs = createReadStream(path, { flags: "r", autoClose: true, start: 0 });

  rs.on("data", (chunk) => chunks.push(chunk as Buffer));
  rs.on("end", () => {
    const bs = Buffer.concat(chunks).toString("base64");
    res.send(bs);
  });
});

if (process.env.NODE_ENV) {
  app.listen(3000, () => {
    console.log(`Example app listening on http://localhost:3000`);
  });
} else {
  const server = app.listen(0, () => {
    const address = server.address() as AddressInfo;
    console.log(`Example app listening on http://localhost:${address.port}`);
    exec(`start http://localhost:${address.port}`);
  });
}
