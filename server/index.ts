import { exec } from "child_process";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import type { AddressInfo } from "net";
import { type Song, loadSongs } from "./song";
const history = require("connect-history-api-fallback");

const app = express();

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
  if (process.env.NODE_ENV) {
    const songs: Song[] = await loadSongs("Songs");
    res.send(songs);
  } else {
    const songs: Song[] = await loadSongs("../Songs");
    res.send(songs);
  }
});

if (process.env.NODE_ENV) {
  app.listen(3000, () => {
    console.log(`Example app listening on http://localhost:3000`);
  });
} else {
  const server = app.listen(0, () => {
    const address = server.address() as AddressInfo;
    console.log(`- opentaiko启动 作者：Roanne（滑滑） B站：https://space.bilibili.com/23383232`);
    console.log(`- 正在打开网页`);
    exec(`start http://localhost:${address.port}`);
    console.log(`- 如意外关闭请重新打开网页：http://localhost:${address.port}`);
    console.log(`- 请勿重复启动软件，否则可能会造成卡顿`);
    console.log(`- 使用完毕后请关闭此窗口`);
  });
}
