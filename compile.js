import { compile } from "nexe";

compile({
  input: "./server_dist/app.js",
  build: true, //required to use patches
  ico: "./public/favicon.ico",
  target: "windows",
  output: "./bundle/taiko-tool.exe",
  verbose: true,
}).then(() => {
  console.log("success");
});
