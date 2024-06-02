import { statSync } from "fs";

export async function isDir(path: string) {
  return new Promise<boolean>(async (resolve) => {
    const stat = statSync(path);
    resolve(stat.isDirectory());
  });
}