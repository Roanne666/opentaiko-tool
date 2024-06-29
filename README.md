# taiko-tool

taiko-tool是一个包含读取成绩、读取谱面和编辑谱面等功能的工具软件。

将taiko-tool解压后的文件夹放入太鼓模拟器根目录即可

太鼓模拟器目录示例：
- opentaiko
  - opentaiko.exe
  - Songs
    - 01 Pop
      - RPG
        - RPG.ogg
        - RPG.tja
      - box.def
    - ...
  - taiko-tool
    - taiko-tool.exe

注：开发时将Songs文件夹拖入到本项目根目录即可读取

## 安装依赖库

```sh
npm install
```

### 分别启动前端和后端

```sh
npm run dev
```

```sh
npm run start
```

### 打包前后端

```sh
npm run build
```
