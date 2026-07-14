import type { PlaygroundConfig, SectionContent } from "./modules";

export interface SectionApiParameter {
  name: string;
  type: string;
  description: string;
}

export interface SectionApiDocLink {
  label: string;
  href: string;
}

export interface SectionApiReference {
  name: string;
  description: string;
  params?: SectionApiParameter[];
  docs?: SectionApiDocLink[];
}

const mdn = (label: string, href: string): SectionApiDocLink => ({
  label,
  href,
});

const sectionApiMap: Record<string, SectionApiReference[]> = {
  "canvas-intro": [
    {
      name: "HTMLCanvasElement.getContext",
      description: "从 canvas 元素拿到绘图上下文，是一切 Canvas 能力的入口。",
      params: [
        {
          name: "contextType",
          type: `"2d" | "webgl" | "webgl2" | "bitmaprenderer"`,
          description: "指定要获取的渲染上下文类型。Canvas 基础学习里最常用的是 `2d`。",
        },
        {
          name: "contextAttributes",
          type: "object",
          description: "可选配置对象。比如 WebGL 会用到 `alpha`、`antialias` 等参数。",
        },
      ],
      docs: [
        mdn(
          "MDN getContext",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/getContext",
        ),
      ],
    },
    {
      name: "CanvasRenderingContext2D",
      description: "2D 绘图上下文对象，后续的路径、样式、文字和图像 API 都挂在它上面。",
      params: [
        {
          name: "this",
          type: "CanvasRenderingContext2D",
          description: "它不是普通函数，而是通过 `canvas.getContext('2d')` 获取到的实例对象。",
        },
      ],
      docs: [
        mdn(
          "MDN CanvasRenderingContext2D",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D",
        ),
      ],
    },
    {
      name: "requestAnimationFrame",
      description: "和 Canvas 高频重绘搭配最自然的动画调度 API，能尽量贴合浏览器刷新节奏。",
      params: [
        {
          name: "callback",
          type: "(timestamp: DOMHighResTimeStamp) => void",
          description: "浏览器下一帧绘制前调用的回调，`timestamp` 常用来做时间差动画。",
        },
      ],
      docs: [
        mdn(
          "MDN requestAnimationFrame",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/window/requestAnimationFrame",
        ),
      ],
    },
  ],
  "create-canvas": [
    {
      name: "canvas.width / canvas.height",
      description: "设置真实绘图缓冲区尺寸，直接影响清晰度和坐标系范围。",
      params: [
        {
          name: "width / height",
          type: "number",
          description: "画布内部像素尺寸，不是 CSS 展示尺寸。高分屏适配时往往要乘上 `devicePixelRatio`。",
        },
      ],
      docs: [
        mdn(
          "MDN HTMLCanvasElement.width",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/width",
        ),
        mdn(
          "MDN HTMLCanvasElement.height",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/height",
        ),
      ],
    },
    {
      name: "ctx.fillRect",
      description: "直接绘制实心矩形，是最常见的 Canvas 入门 API。",
      params: [
        { name: "x", type: "number", description: "矩形左上角横坐标。" },
        { name: "y", type: "number", description: "矩形左上角纵坐标。" },
        { name: "width", type: "number", description: "矩形宽度。" },
        { name: "height", type: "number", description: "矩形高度。" },
      ],
      docs: [
        mdn(
          "MDN fillRect",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/fillRect",
        ),
      ],
    },
    {
      name: "ctx.strokeRect",
      description: "绘制矩形边框，适合理解描边与填充的差异。",
      params: [
        { name: "x", type: "number", description: "矩形左上角横坐标。" },
        { name: "y", type: "number", description: "矩形左上角纵坐标。" },
        { name: "width", type: "number", description: "矩形宽度。" },
        { name: "height", type: "number", description: "矩形高度。" },
      ],
      docs: [
        mdn(
          "MDN strokeRect",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/strokeRect",
        ),
      ],
    },
    {
      name: "ctx.clearRect",
      description: "清理指定区域，动画循环和局部重绘里很常见。",
      params: [
        { name: "x", type: "number", description: "清理区域左上角横坐标。" },
        { name: "y", type: "number", description: "清理区域左上角纵坐标。" },
        { name: "width", type: "number", description: "清理区域宽度。" },
        { name: "height", type: "number", description: "清理区域高度。" },
      ],
      docs: [
        mdn(
          "MDN clearRect",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/clearRect",
        ),
      ],
    },
  ],
  "path-style-transform": [
    {
      name: "ctx.beginPath / ctx.moveTo / ctx.lineTo",
      description: "路径绘制三件套，用来描述折线、轮廓和任意形状。",
      params: [
        {
          name: "beginPath()",
          type: "void",
          description: "开启一条新路径，避免前后路径串在一起。",
        },
        {
          name: "moveTo(x, y)",
          type: "number, number",
          description: "把画笔移动到起点，不会直接画线。",
        },
        {
          name: "lineTo(x, y)",
          type: "number, number",
          description: "从当前点画一条线到目标点。",
        },
      ],
      docs: [
        mdn(
          "MDN beginPath",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/beginPath",
        ),
        mdn(
          "MDN moveTo",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/moveTo",
        ),
        mdn(
          "MDN lineTo",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/lineTo",
        ),
      ],
    },
    {
      name: "ctx.arc",
      description: "绘制圆弧和圆形，是按钮、头像、粒子等场景的高频 API。",
      params: [
        { name: "x", type: "number", description: "圆心横坐标。" },
        { name: "y", type: "number", description: "圆心纵坐标。" },
        { name: "radius", type: "number", description: "半径。" },
        {
          name: "startAngle / endAngle",
          type: "number",
          description: "起止弧度，完整圆常用 `0` 到 `Math.PI * 2`。",
        },
        {
          name: "counterclockwise",
          type: "boolean",
          description: "是否逆时针绘制，默认顺时针。",
        },
      ],
      docs: [
        mdn(
          "MDN arc",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/arc",
        ),
      ],
    },
    {
      name: "ctx.save / ctx.restore",
      description: "保存和恢复状态栈，避免样式和变换把后续绘图一起带偏。",
      params: [
        {
          name: "save()",
          type: "void",
          description: "把当前绘图状态压入栈中，包括样式、变换矩阵、裁剪区等。",
        },
        {
          name: "restore()",
          type: "void",
          description: "从状态栈恢复上一个状态，适合包裹局部绘图逻辑。",
        },
      ],
      docs: [
        mdn(
          "MDN save",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/save",
        ),
        mdn(
          "MDN restore",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/restore",
        ),
      ],
    },
    {
      name: "ctx.translate / ctx.rotate / ctx.scale",
      description: "常见几何变换 API，配合状态栈能更优雅地组织复杂绘制。",
      params: [
        {
          name: "translate(x, y)",
          type: "number, number",
          description: "平移坐标原点，后续所有绘图都会基于新原点计算。",
        },
        {
          name: "rotate(angle)",
          type: "number",
          description: "按弧度旋转坐标系，`Math.PI / 180 * 角度` 是常见写法。",
        },
        {
          name: "scale(x, y)",
          type: "number, number",
          description: "在 x、y 方向缩放坐标系，可以用来镜像或整体放大缩小。",
        },
      ],
      docs: [
        mdn(
          "MDN translate",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/translate",
        ),
        mdn(
          "MDN rotate",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/rotate",
        ),
        mdn(
          "MDN scale",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/scale",
        ),
      ],
    },
  ],
  "image-pixels": [
    {
      name: "ctx.drawImage",
      description: "把图片、视频帧或另一个 canvas 绘制到当前画布上，是图像合成的核心入口。",
      params: [
        {
          name: "image",
          type: "CanvasImageSource",
          description: "可以是 `img`、`video`、`canvas`、`ImageBitmap` 等可绘制源。",
        },
        {
          name: "dx / dy",
          type: "number",
          description: "绘制到目标画布上的起始位置。",
        },
        {
          name: "dWidth / dHeight",
          type: "number",
          description: "目标绘制尺寸，可用来缩放输出。",
        },
        {
          name: "sx / sy / sWidth / sHeight",
          type: "number",
          description: "九参数版本中用于裁剪源图像区域。",
        },
      ],
      docs: [
        mdn(
          "MDN drawImage",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/drawImage",
        ),
      ],
    },
    {
      name: "ctx.getImageData",
      description: "读取像素数组，适合做滤镜、取色和图像分析，但要注意性能成本。",
      params: [
        { name: "sx", type: "number", description: "读取区域起点横坐标。" },
        { name: "sy", type: "number", description: "读取区域起点纵坐标。" },
        { name: "sw", type: "number", description: "读取区域宽度。" },
        { name: "sh", type: "number", description: "读取区域高度。" },
      ],
      docs: [
        mdn(
          "MDN getImageData",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/getImageData",
        ),
      ],
    },
    {
      name: "ctx.putImageData",
      description: "把修改后的像素重新写回画布，用于像素级处理结果回填。",
      params: [
        {
          name: "imageData",
          type: "ImageData",
          description: "通过 `getImageData` 或 `new ImageData()` 得到的像素数据对象。",
        },
        { name: "dx", type: "number", description: "写回目标横坐标。" },
        { name: "dy", type: "number", description: "写回目标纵坐标。" },
      ],
      docs: [
        mdn(
          "MDN putImageData",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/putImageData",
        ),
      ],
    },
  ],
  "particle-animation": [
    {
      name: "requestAnimationFrame",
      description: "动画主循环入口，用来驱动粒子位置更新与逐帧重绘。",
      params: [
        {
          name: "callback",
          type: "(timestamp: DOMHighResTimeStamp) => void",
          description: "每一帧调用一次，可配合时间差做速度与动画同步。",
        },
      ],
      docs: [
        mdn(
          "MDN requestAnimationFrame",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/window/requestAnimationFrame",
        ),
      ],
    },
    {
      name: "canvas.addEventListener",
      description: "监听鼠标移动、点击等交互事件，给粒子系统加上外部输入。",
      params: [
        {
          name: "type",
          type: "string",
          description: "事件类型，例如 `mousemove`、`click`、`pointermove`。",
        },
        {
          name: "listener",
          type: "(event: Event) => void",
          description: "事件回调函数，通常需要从中读取鼠标坐标。",
        },
        {
          name: "options",
          type: "boolean | AddEventListenerOptions",
          description: "可选配置，比如是否捕获、是否 passive。",
        },
      ],
      docs: [
        mdn(
          "MDN addEventListener",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener",
        ),
      ],
    },
    {
      name: "Math.hypot",
      description: "计算二维距离很顺手，常用来做粒子与鼠标之间的吸引或排斥效果。",
      params: [
        {
          name: "...values",
          type: "number[]",
          description: "任意数量的数值参数。二维距离常用 `Math.hypot(dx, dy)`。",
        },
      ],
      docs: [
        mdn("MDN Math.hypot", "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/hypot"),
      ],
    },
    {
      name: "ctx.arc / ctx.fill",
      description: "用圆形快速表达粒子，再通过 fill 形成可见实体。",
      params: [
        {
          name: "arc(x, y, radius, startAngle, endAngle)",
          type: "number",
          description: "定义圆弧路径，粒子系统里常用于画单个粒子。",
        },
        {
          name: "fill(fillRule?)",
          type: `"nonzero" | "evenodd"`,
          description: "把当前路径填充成实体。常见用法直接 `ctx.fill()` 即可。",
        },
      ],
      docs: [
        mdn(
          "MDN arc",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/arc",
        ),
        mdn(
          "MDN fill",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/fill",
        ),
      ],
    },
  ],
  optimization: [
    {
      name: "OffscreenCanvas",
      description: "离屏绘制能力，适合缓存复杂图层或放进 Worker 中减轻主线程压力。",
      params: [
        { name: "width", type: "number", description: "离屏画布宽度。" },
        { name: "height", type: "number", description: "离屏画布高度。" },
      ],
      docs: [
        mdn(
          "MDN OffscreenCanvas",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/OffscreenCanvas",
        ),
      ],
    },
    {
      name: "ctx.clearRect",
      description: "局部清理比整屏重绘更省，脏区更新时尤其常见。",
      params: [
        { name: "x", type: "number", description: "清理区域左上角横坐标。" },
        { name: "y", type: "number", description: "清理区域左上角纵坐标。" },
        { name: "width", type: "number", description: "清理区域宽度。" },
        { name: "height", type: "number", description: "清理区域高度。" },
      ],
      docs: [
        mdn(
          "MDN clearRect",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/clearRect",
        ),
      ],
    },
    {
      name: "requestAnimationFrame",
      description: "动画循环依然建议以它为主，再配合脏区和缓存策略降低总开销。",
      params: [
        {
          name: "callback",
          type: "(timestamp: DOMHighResTimeStamp) => void",
          description: "回调里可以组合脏区计算、缓存命中判断和实际绘制逻辑。",
        },
      ],
      docs: [
        mdn(
          "MDN requestAnimationFrame",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/window/requestAnimationFrame",
        ),
      ],
    },
  ],
  "webcodecs-intro": [
    {
      name: "VideoFrame",
      description: "表示原始视频帧数据，逐帧处理和编码前预处理都离不开它。",
      params: [
        {
          name: "image / data",
          type: "CanvasImageSource | BufferSource",
          description: "可以从图像源或原始缓冲区创建帧对象。",
        },
        {
          name: "init",
          type: "VideoFrameInit",
          description: "常见字段包括 `timestamp`、`duration`、`codedWidth`、`codedHeight`。",
        },
      ],
      docs: [
        mdn("MDN VideoFrame", "https://developer.mozilla.org/en-US/docs/Web/API/VideoFrame"),
      ],
    },
    {
      name: "EncodedVideoChunk",
      description: "表示编码后的压缩视频块，是编码器输出、解码器输入的关键数据结构。",
      params: [
        {
          name: "type",
          type: `"key" | "delta"`,
          description: "标记关键帧还是差分帧，解码器和封装层都很关心这个信息。",
        },
        {
          name: "timestamp",
          type: "number",
          description: "时间戳，通常用微秒表达媒体时间轴位置。",
        },
        {
          name: "data",
          type: "BufferSource",
          description: "真正的压缩码流字节数据。",
        },
      ],
      docs: [
        mdn(
          "MDN EncodedVideoChunk",
          "https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk",
        ),
      ],
    },
    {
      name: "VideoEncoder / VideoDecoder",
      description: "浏览器原生视频编解码对象，分别负责帧到 chunk、chunk 到帧的转换。",
      params: [
        {
          name: "output",
          type: "callback",
          description: "编码器输出 chunk 或解码器输出 frame 时触发的回调。",
        },
        {
          name: "error",
          type: "callback",
          description: "编解码异常回调，调试和恢复逻辑里很关键。",
        },
        {
          name: "configure(config)",
          type: "VideoEncoderConfig / VideoDecoderConfig",
          description: "真正指定 codec、分辨率、码率、帧率等能力配置。",
        },
      ],
      docs: [
        mdn("MDN VideoEncoder", "https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder"),
        mdn("MDN VideoDecoder", "https://developer.mozilla.org/en-US/docs/Web/API/VideoDecoder"),
      ],
    },
  ],
  "support-check": [
    {
      name: "VideoEncoder.isConfigSupported",
      description: "编码前先探测配置是否可用，能少踩很多浏览器和 codec 兼容坑。",
      params: [
        {
          name: "config.codec",
          type: "string",
          description: "编码格式标识，例如 `avc1.42001E`、`vp09.00.10.08`。",
        },
        {
          name: "config.width / config.height",
          type: "number",
          description: "目标编码分辨率。",
        },
        {
          name: "config.bitrate / config.framerate",
          type: "number",
          description: "码率和帧率配置，用来描述实时性与质量目标。",
        },
      ],
      docs: [
        mdn(
          "MDN VideoEncoder.isConfigSupported",
          "https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder/isConfigSupported_static",
        ),
      ],
    },
    {
      name: "VideoDecoder.isConfigSupported",
      description: "解码能力探测接口，适合在真正加载处理链前先做能力分流。",
      params: [
        {
          name: "config.codec",
          type: "string",
          description: "待解码流的 codec 标识。",
        },
        {
          name: "config.codedWidth / config.codedHeight",
          type: "number",
          description: "可选分辨率描述，某些环境下有助于更精确探测。",
        },
      ],
      docs: [
        mdn(
          "MDN VideoDecoder.isConfigSupported",
          "https://developer.mozilla.org/en-US/docs/Web/API/VideoDecoder/isConfigSupported_static",
        ),
      ],
    },
    {
      name: "Worker",
      description: "逐帧媒体处理通常要搬进 Worker，避免主线程被编解码拖慢。",
      params: [
        {
          name: "scriptURL",
          type: "string | URL",
          description: "Worker 脚本路径或模块 URL。",
        },
        {
          name: "options.type",
          type: `"classic" | "module"`,
          description: "现代前端里更常用 `module`，便于配合 ESM。",
        },
      ],
      docs: [
        mdn("MDN Worker", "https://developer.mozilla.org/zh-CN/docs/Web/API/Worker"),
      ],
    },
  ],
  "webcodecs-practice": [
    {
      name: "MediaStreamTrackProcessor",
      description: "把媒体轨道转成可读取的帧流，是浏览器实时视频处理常见起点。",
      params: [
        {
          name: "track",
          type: "MediaStreamTrack",
          description: "要处理的视频轨道，常由摄像头或屏幕共享得到。",
        },
      ],
      docs: [
        mdn(
          "MDN MediaStreamTrackProcessor",
          "https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrackProcessor",
        ),
      ],
    },
    {
      name: "TransformStream",
      description: "把帧处理逻辑插入流式链路，适合滤镜、裁剪和特效场景。",
      params: [
        {
          name: "transform(chunk, controller)",
          type: "function",
          description: "对输入块做处理并通过 `controller.enqueue` 继续往下游传递。",
        },
        {
          name: "flush(controller)",
          type: "function",
          description: "流结束时的收尾逻辑，可选。",
        },
      ],
      docs: [
        mdn(
          "MDN TransformStream",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/TransformStream",
        ),
      ],
    },
    {
      name: "VideoFrame.close",
      description: "释放帧占用的底层资源，忘记调用时很容易内存一路飞升。",
      params: [
        {
          name: "close()",
          type: "void",
          description: "没有参数，但时机非常重要。处理完成后要尽快调用。",
        },
      ],
      docs: [
        mdn("MDN VideoFrame.close", "https://developer.mozilla.org/en-US/docs/Web/API/VideoFrame/close"),
      ],
    },
  ],
  "audio-graph": [
    {
      name: "AudioContext",
      description: "音频图的根上下文，几乎所有 Web Audio 节点都从这里创建。",
      params: [
        {
          name: "options.sampleRate",
          type: "number",
          description: "可选采样率配置，不传时通常使用浏览器或设备默认值。",
        },
        {
          name: "options.latencyHint",
          type: `"interactive" | "playback" | "balanced" | number`,
          description: "延迟优化偏好，实时交互场景常选 `interactive`。",
        },
      ],
      docs: [
        mdn(
          "MDN AudioContext",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/AudioContext",
        ),
      ],
    },
    {
      name: "AudioNode.connect",
      description: "把节点连成处理图的核心方法，决定音频如何流动。",
      params: [
        {
          name: "destinationNode",
          type: "AudioNode | AudioParam",
          description: "当前节点的输出要连接到哪里。",
        },
        {
          name: "output / input",
          type: "number",
          description: "可选的输出通道和输入通道索引，复杂节点图时会用到。",
        },
      ],
      docs: [
        mdn(
          "MDN AudioNode.connect",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/AudioNode/connect",
        ),
      ],
    },
    {
      name: "audioContext.resume",
      description: "浏览器通常要求用户手势后显式恢复音频上下文，才能真正播放。",
      params: [
        {
          name: "resume()",
          type: "Promise<void>",
          description: "没有参数，常在点击按钮等用户交互里 await 调用。",
        },
      ],
      docs: [
        mdn(
          "MDN AudioContext.resume",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/AudioContext/resume",
        ),
      ],
    },
  ],
  "audio-lab": [
    {
      name: "AnalyserNode",
      description: "提供时域和频域数据，是波形图、频谱图等可视化效果的基础。",
      params: [
        {
          name: "fftSize",
          type: "number",
          description: "FFT 大小，必须是 2 的幂。越大频率分辨率越高，计算量也越大。",
        },
        {
          name: "smoothingTimeConstant",
          type: "number",
          description: "频谱平滑程度，越大越柔和。",
        },
      ],
      docs: [
        mdn(
          "MDN AnalyserNode",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/AnalyserNode",
        ),
      ],
    },
    {
      name: "OscillatorNode",
      description: "生成基础波形，适合做最小可运行的音频实验。",
      params: [
        {
          name: "type",
          type: `"sine" | "square" | "sawtooth" | "triangle" | "custom"`,
          description: "指定波形类型，不同波形听感差别很明显。",
        },
        {
          name: "frequency.value",
          type: "number",
          description: "频率值，单位 Hz，影响音高。",
        },
      ],
      docs: [
        mdn(
          "MDN OscillatorNode",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/OscillatorNode",
        ),
      ],
    },
    {
      name: "GainNode",
      description: "用于控制音量和过渡强度，避免声音直接炸到用户脸上。",
      params: [
        {
          name: "gain.value",
          type: "number",
          description: "音量倍率，`1` 表示原始音量，`0` 表示静音。",
        },
      ],
      docs: [
        mdn(
          "MDN GainNode",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/GainNode",
        ),
      ],
    },
  ],
  "audio-practice": [
    {
      name: "navigator.mediaDevices.getUserMedia",
      description: "获取麦克风输入或摄像头流，是接入真实音频源的关键起点。",
      params: [
        {
          name: "constraints.audio / constraints.video",
          type: "boolean | MediaTrackConstraints",
          description: "媒体约束对象。麦克风场景常配回声消除、降噪等参数。",
        },
      ],
      docs: [
        mdn(
          "MDN getUserMedia",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia",
        ),
      ],
    },
    {
      name: "MediaStreamAudioSourceNode",
      description: "把 MediaStream 接入 Audio Graph，让麦克风输入进入处理链。",
      params: [
        {
          name: "mediaStream",
          type: "MediaStream",
          description: "通常来自 `getUserMedia` 获取到的输入流。",
        },
      ],
      docs: [
        mdn(
          "MDN MediaStreamAudioSourceNode",
          "https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamAudioSourceNode",
        ),
      ],
    },
    {
      name: "BiquadFilterNode / DynamicsCompressorNode",
      description: "常见的滤波和压缩节点，适合构建更有工程味的效果器链路。",
      params: [
        {
          name: "BiquadFilterNode.type / frequency / Q",
          type: "string / number / number",
          description: "分别控制滤波类型、中心频率和品质因数。",
        },
        {
          name: "DynamicsCompressorNode.threshold / ratio / attack / release",
          type: "number",
          description: "控制压缩器阈值、压缩比和动态响应速度。",
        },
      ],
      docs: [
        mdn(
          "MDN BiquadFilterNode",
          "https://developer.mozilla.org/zh-CN/docs/Web/API/BiquadFilterNode",
        ),
        mdn(
          "MDN DynamicsCompressorNode",
          "https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode",
        ),
      ],
    },
  ],
  "webgl-pipeline": [
    {
      name: "gl.createShader / gl.shaderSource / gl.compileShader",
      description: "着色器编译三步曲，用来把 GLSL 代码变成 GPU 可执行对象。",
      params: [
        {
          name: "createShader(type)",
          type: "GLenum",
          description: "传入 `gl.VERTEX_SHADER` 或 `gl.FRAGMENT_SHADER`。",
        },
        {
          name: "shaderSource(shader, source)",
          type: "WebGLShader, string",
          description: "把 GLSL 源码字符串绑定到 shader 对象。",
        },
        {
          name: "compileShader(shader)",
          type: "WebGLShader",
          description: "触发编译，失败时记得配合 `getShaderInfoLog` 排查。",
        },
      ],
      docs: [
        mdn("MDN createShader", "https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/createShader"),
        mdn("MDN shaderSource", "https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/shaderSource"),
        mdn("MDN compileShader", "https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/compileShader"),
      ],
    },
    {
      name: "gl.createProgram / gl.linkProgram / gl.useProgram",
      description: "把顶点和片元着色器组合成可用 program，并切换到当前渲染管线。",
      params: [
        {
          name: "attachShader(program, shader)",
          type: "WebGLProgram, WebGLShader",
          description: "在 link 前把着色器挂到 program 上。",
        },
        {
          name: "linkProgram(program)",
          type: "WebGLProgram",
          description: "链接 program，生成真正可执行的 GPU 程序。",
        },
        {
          name: "useProgram(program)",
          type: "WebGLProgram | null",
          description: "指定当前绘制要使用的 program。",
        },
      ],
      docs: [
        mdn("MDN createProgram", "https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/createProgram"),
        mdn("MDN linkProgram", "https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/linkProgram"),
        mdn("MDN useProgram", "https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/useProgram"),
      ],
    },
    {
      name: "gl.drawArrays",
      description: "真正触发绘制的调用，前面所有配置都在为它铺路。",
      params: [
        {
          name: "mode",
          type: "GLenum",
          description: "绘制模式，例如 `gl.TRIANGLES`、`gl.LINES`、`gl.POINTS`。",
        },
        {
          name: "first",
          type: "number",
          description: "从顶点数组的第几个元素开始读。",
        },
        {
          name: "count",
          type: "number",
          description: "要绘制多少个顶点。",
        },
      ],
      docs: [
        mdn("MDN drawArrays", "https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays"),
      ],
    },
  ],
  "webgl-transform": [
    {
      name: "gl.uniformMatrix4fv",
      description: "把矩阵数据传进 shader，是平移、旋转、缩放和相机变换的常见入口。",
      params: [
        {
          name: "location",
          type: "WebGLUniformLocation",
          description: "通过 `getUniformLocation` 获取到的 uniform 地址。",
        },
        {
          name: "transpose",
          type: "boolean",
          description: "WebGL 里通常固定传 `false`。",
        },
        {
          name: "data",
          type: "Float32Array",
          description: "16 个数字组成的 4x4 矩阵数据。",
        },
      ],
      docs: [
        mdn("MDN uniformMatrix4fv", "https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniformMatrix"),
      ],
    },
    {
      name: "requestAnimationFrame",
      description: "驱动 WebGL 场景更新的常见动画调度方式。",
      params: [
        {
          name: "callback",
          type: "(timestamp: DOMHighResTimeStamp) => void",
          description: "每一帧回调，常在其中更新矩阵、相机或 uniform 数据。",
        },
      ],
      docs: [
        mdn("MDN requestAnimationFrame", "https://developer.mozilla.org/zh-CN/docs/Web/API/window/requestAnimationFrame"),
      ],
    },
    {
      name: "gl.viewport",
      description: "设置当前渲染目标的视口范围，尺寸不对时很容易出现画面异常。",
      params: [
        { name: "x", type: "number", description: "视口左下角横坐标。" },
        { name: "y", type: "number", description: "视口左下角纵坐标。" },
        { name: "width", type: "number", description: "视口宽度。" },
        { name: "height", type: "number", description: "视口高度。" },
      ],
      docs: [
        mdn("MDN viewport", "https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/viewport"),
      ],
    },
  ],
  "webgl-texture": [
    {
      name: "gl.createTexture / gl.bindTexture",
      description: "创建并绑定纹理对象，是图片进入 GPU 世界的第一步。",
      params: [
        {
          name: "createTexture()",
          type: "WebGLTexture | null",
          description: "创建一个空纹理对象。",
        },
        {
          name: "bindTexture(target, texture)",
          type: "GLenum, WebGLTexture | null",
          description: "通常把纹理绑定到 `gl.TEXTURE_2D`。",
        },
      ],
      docs: [
        mdn("MDN createTexture", "https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/createTexture"),
        mdn("MDN bindTexture", "https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindTexture"),
      ],
    },
    {
      name: "gl.texImage2D",
      description: "把图像数据上传到纹理中，纹理贴图的关键 API。",
      params: [
        {
          name: "target / level / internalformat",
          type: "GLenum / number / GLenum",
          description: "目标通常是 `gl.TEXTURE_2D`，`level` 多为 `0`。",
        },
        {
          name: "format / type",
          type: "GLenum / GLenum",
          description: "常见组合是 `gl.RGBA` + `gl.UNSIGNED_BYTE`。",
        },
        {
          name: "source",
          type: "TexImageSource",
          description: "可以是 `ImageBitmap`、`HTMLImageElement`、`HTMLCanvasElement` 等。",
        },
      ],
      docs: [
        mdn("MDN texImage2D", "https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D"),
      ],
    },
    {
      name: "gl.texParameteri",
      description: "设置纹理采样和边界策略，影响清晰度、缩放和重复方式。",
      params: [
        {
          name: "target",
          type: "GLenum",
          description: "通常传 `gl.TEXTURE_2D`。",
        },
        {
          name: "pname",
          type: "GLenum",
          description: "要修改的参数名，例如 `gl.TEXTURE_MIN_FILTER`、`gl.TEXTURE_WRAP_S`。",
        },
        {
          name: "param",
          type: "GLint",
          description: "实际参数值，例如 `gl.LINEAR`、`gl.CLAMP_TO_EDGE`。",
        },
      ],
      docs: [
        mdn("MDN texParameteri", "https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter"),
      ],
    },
  ],
  "ffmpeg-basics": [
    {
      name: "ffmpeg -i",
      description: "声明输入文件，是 FFmpeg 命令建模的标准起点。",
      params: [
        {
          name: "-i input",
          type: "string",
          description: "指定输入媒体文件或流地址。多个输入时可以写多个 `-i`。",
        },
      ],
      docs: [
        mdn("FFmpeg Documentation", "https://ffmpeg.org/ffmpeg.html"),
      ],
    },
    {
      name: "-vf / -af",
      description: "分别用于视频滤镜和音频滤镜，是裁剪、缩放、叠字、音量处理的高频参数。",
      params: [
        {
          name: "-vf filtergraph",
          type: "string",
          description: "视频滤镜链，例如 `scale=1280:720`、`fps=15`、`crop=...`。",
        },
        {
          name: "-af filtergraph",
          type: "string",
          description: "音频滤镜链，例如 `volume=0.8`、`atempo=1.25`。",
        },
      ],
      docs: [
        mdn("FFmpeg Filters", "https://ffmpeg.org/ffmpeg-filters.html"),
      ],
    },
    {
      name: "-c:v / -c:a",
      description: "指定视频和音频编码器，决定输出格式与编码策略。",
      params: [
        {
          name: "-c:v codec",
          type: "string",
          description: "视频编码器，例如 `libx264`、`copy`、`libvpx-vp9`。",
        },
        {
          name: "-c:a codec",
          type: "string",
          description: "音频编码器，例如 `aac`、`libmp3lame`、`copy`。",
        },
      ],
      docs: [
        mdn("FFmpeg Codecs", "https://ffmpeg.org/ffmpeg-codecs.html"),
      ],
    },
  ],
  "ffmpeg-wasm": [
    {
      name: "FFmpeg.load",
      description: "加载 wasm 核心资源，是浏览器端 FFmpeg 真正启动前的准备步骤。",
      params: [
        {
          name: "options",
          type: "object",
          description: "可传 core 路径、日志开关等初始化参数，具体取决于封装版本。",
        },
      ],
      docs: [
        mdn("ffmpeg.wasm Docs", "https://ffmpegwasm.netlify.app/docs/overview"),
      ],
    },
    {
      name: "FFmpeg.writeFile / readFile",
      description: "在虚拟文件系统里写入输入文件、读取输出文件，构成基本处理闭环。",
      params: [
        {
          name: "writeFile(path, data)",
          type: "string, Uint8Array",
          description: "把浏览器中的文件数据写入 wasm 虚拟文件系统。",
        },
        {
          name: "readFile(path)",
          type: "string",
          description: "从虚拟文件系统中读取处理后的文件数据。",
        },
      ],
      docs: [
        mdn("ffmpeg.wasm API", "https://ffmpegwasm.netlify.app/docs/api/ffmpeg/classes/ffmpeg"),
      ],
    },
    {
      name: "FFmpeg.exec",
      description: "执行 FFmpeg 参数数组，是前端把命令模型真正跑起来的关键接口。",
      params: [
        {
          name: "args",
          type: "string[]",
          description: "等价于命令行参数数组，例如 `['-i', 'input.mp4', 'output.mp3']`。",
        },
      ],
      docs: [
        mdn("ffmpeg.wasm exec", "https://ffmpegwasm.netlify.app/docs/api/ffmpeg/classes/ffmpeg#exec"),
      ],
    },
  ],
  "ffmpeg-architecture": [
    {
      name: "Worker",
      description: "前端多媒体重任务几乎离不开 Worker，用来把耗时处理从主线程搬走。",
      params: [
        {
          name: "scriptURL",
          type: "string | URL",
          description: "Worker 入口脚本或模块地址。",
        },
        {
          name: "options.type",
          type: `"classic" | "module"`,
          description: "Vite/React 项目里通常更适合 `module` worker。",
        },
      ],
      docs: [
        mdn("MDN Worker", "https://developer.mozilla.org/zh-CN/docs/Web/API/Worker"),
      ],
    },
    {
      name: "File / Blob / URL.createObjectURL",
      description: "浏览器端上传、预览和导出媒体文件时最常用的一组文件对象 API。",
      params: [
        {
          name: "new Blob(parts, options)",
          type: "BlobPart[], BlobPropertyBag",
          description: "把字节数据重新拼成浏览器可下载、可预览的文件对象。",
        },
        {
          name: "URL.createObjectURL(blob)",
          type: "Blob | MediaSource",
          description: "生成临时可访问 URL，常用于音视频预览或下载链接。",
        },
      ],
      docs: [
        mdn("MDN Blob", "https://developer.mozilla.org/zh-CN/docs/Web/API/Blob"),
        mdn("MDN URL.createObjectURL", "https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL_static"),
      ],
    },
    {
      name: "AbortController",
      description: "给长任务加取消能力时很好用，避免用户想停却只能干瞪眼。",
      params: [
        {
          name: "new AbortController()",
          type: "AbortController",
          description: "创建控制器实例，再通过 `signal` 下发给异步任务。",
        },
        {
          name: "abort(reason?)",
          type: "any",
          description: "主动取消任务，可附带取消原因。",
        },
      ],
      docs: [
        mdn("MDN AbortController", "https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController"),
      ],
    },
  ],
};

function createDefaultPlaygroundCode(
  section: SectionContent,
  keyApis: SectionApiReference[],
) {
  const conceptList = JSON.stringify(section.concepts.slice(0, 4));
  const apiList = JSON.stringify(keyApis);
  const title = JSON.stringify(section.title);
  const summary = JSON.stringify(section.summary);

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>${section.title} 练习台</title>
  </head>
  <body style="margin:0;padding:18px;background:#0b1120;color:#e5eefc;font-family:Inter,Arial,sans-serif;">
    <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:16px;">
      <button id="repaint" style="border:none;border-radius:12px;padding:10px 14px;background:#2A55E5;color:#fff;cursor:pointer;">刷新示意卡</button>
      <button id="toggle" style="border:none;border-radius:12px;padding:10px 14px;background:#475467;color:#fff;cursor:pointer;">切换主题色</button>
      <span style="padding:6px 10px;border-radius:999px;background:rgba(42,85,229,0.14);color:#9bb2ff;">这里是本节的默认练习台，你可以直接把整段代码改成自己的实验。</span>
    </div>

    <canvas id="stage" width="900" height="420" style="display:block;width:100%;background:linear-gradient(180deg,#111827 0%,#07111d 100%);border-radius:18px;border:1px solid #23314f;"></canvas>
    <div id="tips" style="margin-top:16px;padding:16px;border-radius:16px;background:#111a2b;border:1px solid #23314f;line-height:1.7;"></div>

    <script>
      const title = ${title};
      const summary = ${summary};
      const concepts = ${conceptList};
      const keyApis = ${apiList};
      const canvas = document.getElementById("stage");
      const ctx = canvas.getContext("2d");
      const tips = document.getElementById("tips");
      let accent = "#2A55E5";

      function drawBoard() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#091426";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = accent;
        ctx.fillRect(32, 28, 12, 364);

        ctx.fillStyle = "#F8FBFF";
        ctx.font = "bold 32px sans-serif";
        ctx.fillText(title, 64, 74);

        ctx.fillStyle = "#AFC5FF";
        ctx.font = "18px sans-serif";
        ctx.fillText(summary, 64, 112);

        ctx.font = "bold 20px sans-serif";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("关键 API", 64, 170);

        keyApis.forEach((item, index) => {
          const top = 208 + index * 66;
          ctx.fillStyle = "rgba(255,255,255,0.06)";
          ctx.fillRect(64, top - 28, 772, 48);
          ctx.fillStyle = "#7CB3FF";
          ctx.font = "bold 16px sans-serif";
          ctx.fillText(item.name, 84, top);
          ctx.fillStyle = "#D8E6FF";
          ctx.font = "14px sans-serif";
          ctx.fillText(item.description.slice(0, 42), 320, top);
        });

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText("练习提示：试着改按钮逻辑、改颜色、改画布内容，直接把这里改成你的实验代码。", 64, 378);
      }

      function renderTips() {
        tips.innerHTML = \`
          <strong style="display:block;margin-bottom:8px;">本节知识点</strong>
          <ul style="margin:0;padding-left:20px;">
            \${concepts.map((item) => \`<li>\${item}</li>\`).join("")}
          </ul>
        \`;
      }

      document.getElementById("repaint").addEventListener("click", drawBoard);
      document.getElementById("toggle").addEventListener("click", () => {
        accent = accent === "#2A55E5" ? "#8B5CF6" : "#2A55E5";
        drawBoard();
      });

      drawBoard();
      renderTips();
    </script>
  </body>
</html>`;
}

export function getSectionApiReferences(sectionId: string) {
  return sectionApiMap[sectionId] ?? [];
}

export function getSectionPlayground(section: SectionContent): PlaygroundConfig {
  const keyApis = getSectionApiReferences(section.id);

  if (section.playground?.language === "html" && section.playground.runnable) {
    return section.playground;
  }

  return {
    title: `${section.title} 练习台`,
    description:
      "这是系统为本节补的统一练习区。你可以直接改代码、点运行，然后在右侧预览里验证想法。",
    initialCode: createDefaultPlaygroundCode(section, keyApis),
    runnable: true,
    language: "html",
  };
}
