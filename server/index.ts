import { exec } from "child_process";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { AddressInfo } from "net";
import test from "@/test";

const app = express();

app.use(express.static("dist"));

app.get("/api/test", (req: Request, res: Response, next: NextFunction) => {
  test
  res.send({ info: "Hello World!" });
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
