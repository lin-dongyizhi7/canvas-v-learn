# [OPEN] cut-timeline-debug

## 背景
- 目标 1：为“图片转 3 秒视频素材”的核心路径补充详细运行时日志，便于排查导入异常。
- 目标 2：为“点击时间轴顶部刻度跳转”的核心路径补充详细运行时日志，便于排查 seek 偏移。
- 目标 3：将顶部刻度从固定值改为随项目时长自适应。

## 可证伪假设
1. 图片导入时 `file.type`、映射后的 `asset.type`、最终 `duration` 之间存在不一致。
2. 时间轴跳转使用的参考宽度与当前缩放后的实际可点击区域不一致，导致 seek 偏移。
3. 顶部刻度由固定数组生成，没有根据 `state.duration` 重新计算，导致标尺显示失真。
4. 点击跳转与拖拽游标复用逻辑时存在事件时序差异，可能造成重复 seek 或结果被覆盖。

## 计划
1. 读取调试日志规范。
2. 在图片导入与时间轴跳转路径中增加 instrumentation。
3. 将顶部刻度改为按项目时长自适应生成。
4. 复查变更并给出验证建议。

## 已完成变更
- 已启动 Debug Server：`http://127.0.0.1:7777/event`。
- 已在 `CutTopbar.tsx` 的文件导入链路记录批量导入、图片转视频映射、`addAsset` 派发信息。
- 已在 `TimelinePanel.tsx` 的顶部标尺点击、游标拖拽、坐标换算、刻度生成逻辑记录运行时信息。
- 已将顶部刻度由固定数组改为按项目时长计算步长。

## 当前证据
- 已收到 `adaptive timeline ticks generated` 日志，当前 `duration=60`、`tickStep=10`、`tickCount=7`、`lastTick=60`。
- 日志在开发环境下出现双份，入口 `src/main.tsx` 使用 `React.StrictMode`，该重复符合 React 开发模式下 effect 双调用特征。

## 验证建议
1. 导入一张图片，观察日志中 `isImportedImage=true`、`inferredAssetType=video`、`assetDuration=3`。
2. 点击时间轴顶部标尺，观察日志中 `clientX`、`rulerLeft`、`rulerWidth`、`progress`、`nextTime` 是否符合点击位置。
3. 插入较长素材后观察 `duration` 变化，确认 `tickStep` 和 `tickCount` 随项目时长变化。
