# Learn Lab

一个使用 **React + TypeScript + Vite** 搭建的前端学习网站，聚焦以下方向：

- Canvas
- WebCodecs
- Web Audio
- WebGL
- FFmpeg
- LeetCode 练习跳转

## 特性

- 左侧完整学习菜单
- 模块化课程结构
- Monaco 可编辑代码块
- 可运行的 iframe 预览（适用于部分 HTML 示例）
- 文件上传实验台（WebCodecs / Web Audio / WebGL / FFmpeg）
- 章节练习建议与外部资料链接

## 启动

```bash
pnpm install
pnpm dev
```

如果你使用 npm：

```bash
npm install
npm run dev
```

## 目录结构

```text
learn/
├── src/
│   ├── components/
│   ├── data/
│   ├── pages/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

## 当前内容说明

- `Canvas` 模块参考了 `interview.poetries.top` 的 Canvas 目录，并做了更完整的课程化整理。
- `WebCodecs / Web Audio / WebGL / FFmpeg` 模块补充了核心概念、工程边界和练习建议。
- `WebCodecs / Web Audio / WebGL / FFmpeg` 模块都已带实验台入口，可上传样本文件做本地练习。
- `LeetCode` 页面提供了常用题目分组跳转。

## 当前覆盖情况

- `WebCodecs`：有文档、有练习、有支持探测代码块、有视频上传实验台
- `Web Audio`：有文档、有练习、有频谱实验代码块、有音频上传实验台
- `WebGL`：有文档、有练习、有最小三角形代码块、有图片纹理上传实验台
- `FFmpeg`：有文档、有练习、有代码模板、有命令生成型上传实验台

> 说明：`FFmpeg` 当前实验台先聚焦上传、命令感知和任务编排；真正接入 `ffmpeg.wasm` 执行链路还可以继续增强。

## 备注

仓库中保留了之前的 `canvas/` 静态原型目录，当前主学习站以根目录下的 React 项目为准。
