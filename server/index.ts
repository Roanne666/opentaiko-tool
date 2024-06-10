import { exec } from "child_process";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import type { AddressInfo } from "net";
import { type Song, loadSongs } from "./song";

const app = express();

app.use(express.static("web"));

app.get("/api/songs", async (req: Request, res: Response, next: NextFunction) => {
  const songs: Song[] = await loadSongs();
  res.send(songs);
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
