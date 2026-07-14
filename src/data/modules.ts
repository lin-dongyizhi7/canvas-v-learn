import {
  canvasBasicsSnippet,
  canvasParticlesSnippet,
  ffmpegSnippet,
  webAudioSnippet,
  webCodecsSnippet,
  webGlSnippet,
} from "./snippets";

export interface ResourceLink {
  label: string;
  href: string;
  description: string;
}

export interface PlaygroundConfig {
  title: string;
  description: string;
  initialCode: string;
  runnable?: boolean;
  language: "html" | "ts";
}

export interface ExperimentLabConfig {
  kind: "webcodecs" | "webaudio" | "webgl" | "ffmpeg";
  title: string;
  description: string;
  accept: string;
  hints: string[];
}

export interface SectionContent {
  id: string;
  title: string;
  summary: string;
  concepts: string[];
  practice: string[];
  tags: string[];
  playground?: PlaygroundConfig;
}

export interface LearningModule {
  id: "canvas" | "webcodecs" | "webaudio" | "webgl" | "ffmpeg";
  title: string;
  badge: string;
  description: string;
  overview: string;
  outcomes: string[];
  sections: SectionContent[];
  resources: ResourceLink[];
  experimentLab?: ExperimentLabConfig;
}

export function getModuleById(moduleId?: string) {
  return learningModules.find((item) => item.id === moduleId);
}

export function getSectionById(moduleId?: string, sectionId?: string) {
  const module = getModuleById(moduleId);
  if (!module) {
    return null;
  }

  return module.sections.find((section) => section.id === sectionId) ?? null;
}

export function buildModulePath(moduleId: LearningModule["id"]) {
  return `/module/${moduleId}`;
}

export function buildSectionPath(
  moduleId: LearningModule["id"],
  sectionId: string,
) {
  return `/module/${moduleId}/section/${sectionId}`;
}

export const learningModules: LearningModule[] = [
  {
    id: "canvas",
    title: "Canvas",
    badge: "2D 图形与即时渲染",
    description:
      "从创建画布、路径、样式、图像处理，一路学到粒子特效、动画循环和性能优化。",
    overview:
      "本模块参考了你给的 Canvas 学习目录，并进一步补全了‘创建画布 -> 绘制路径 -> 样式与变换 -> 粒子交互 -> 优化策略’这条完整主线。",
    outcomes: [
      "理解 Canvas 为什么适合游戏、活动页、图表和酷炫背景。",
      "掌握 width/height、坐标系、路径 API、样式状态和重绘循环。",
      "能写出具备鼠标交互与粒子动画的基础效果。",
    ],
    sections: [
      {
        id: "canvas-intro",
        title: "Canvas 介绍、应用场景与 SVG 对比",
        summary:
          "先把‘它是什么、为什么存在、跟 SVG 有什么根本差异’讲清楚，后面很多技术选择就不会靠拍脑袋。",
        concepts: [
          "Canvas 是基于像素的即时模式绘图系统，适合高频重绘、动画、粒子和游戏场景。",
          "SVG 是基于形状的保留模式图形系统，每个图元都更像 DOM，可单独被样式和事件系统感知。",
          "图表、小游戏、活动页、炫酷背景、画板工具，都是 Canvas 的经典战场。",
          "如果需求更偏静态矢量图、可访问性和节点级交互，SVG 往往更合适。",
        ],
        practice: [
          "尝试总结：同样是画一个圆，图片、CSS、SVG、Canvas 各自优缺点是什么。",
          "列出你熟悉的业务场景，判断它更适合 Canvas 还是 SVG。",
        ],
        tags: ["canvas", "svg", "scene", "graphics"],
      },
      {
        id: "create-canvas",
        title: "创建 Canvas 画布",
        summary:
          "先把最容易被忽视但最容易踩坑的基础打牢：画布尺寸、CSS 尺寸、像素尺寸和上下文对象。",
        concepts: [
          "Canvas 标签默认尺寸是 300 x 150，HTML 属性改的是绘图缓冲区，CSS 改的是显示尺寸。",
          "如果只用 CSS 拉伸画布，图会模糊，因为底层像素没跟着变大。",
          "获取 2D 上下文后，后续大多数 API 都挂在 ctx 上，状态也是共享的。",
          "相较于参考文档，这里额外强调了设备像素比和响应式尺寸这两个实战坑点。",
        ],
        practice: [
          "把代码里的矩形位置和尺寸改掉，感受坐标变化。",
          "尝试把画布尺寸调成 800 x 400，再观察图形比例。",
        ],
        tags: ["canvas", "2d", "getContext", "width", "height"],
        playground: {
          title: "基础绘制练习",
          description: "这是一段可以直接编辑并运行的 HTML 代码，修改后点击运行即可预览。",
          initialCode: canvasBasicsSnippet,
          runnable: true,
          language: "html",
        },
      },
      {
        id: "path-style-transform",
        title: "路径、样式与图形变换",
        summary:
          "路径是自由绘图的核心；样式和状态栈决定了图形如何看起来像一个真正的界面而不是课堂粉笔画。",
        concepts: [
          "常见路径 API 包括 beginPath、moveTo、lineTo、arc、closePath、stroke 和 fill。",
          "fillStyle、strokeStyle、lineWidth、shadowBlur、globalAlpha 都是上下文状态。",
          "save / restore 能保存和恢复状态栈，适合配合 translate / rotate / scale 使用。",
          "文字绘制依赖 font、textAlign、textBaseline，本身不会自动换行。",
        ],
        practice: [
          "画一个带阴影的按钮卡片，并在按钮里写上文字。",
          "用 rotate 把普通矩形旋转成 30 度，理解坐标系变换。",
        ],
        tags: ["path", "fillStyle", "shadow", "save", "rotate"],
      },
      {
        id: "image-pixels",
        title: "图像绘制与像素处理",
        summary:
          "当你不再满足于几何图形，Canvas 就会把你带进图片绘制、离屏合成和像素级处理的世界。",
        concepts: [
          "drawImage 可以绘制图片、视频帧，甚至另一个 Canvas。",
          "getImageData / putImageData 能读写像素，但代价不低，要谨慎使用。",
          "图像处理常见任务包括灰度、反色、裁剪、缩放和生成缩略图。",
          "如果某个复杂图层不会频繁变化，离屏 Canvas 缓存会比每帧重算更友好。",
        ],
        practice: [
          "写一个灰度滤镜，把 RGB 三通道平均值重新写回去。",
          "思考 drawImage 在海报合成、视频封面生成中的作用。",
        ],
        tags: ["drawImage", "imageData", "pixel", "offscreen"],
      },
      {
        id: "particle-animation",
        title: "粒子动画与鼠标交互",
        summary:
          "这是参考资料里最吸引人的部分之一：随机粒子、动画循环、鼠标参与，页面立刻从静态小卡片升级成会呼吸的东西。",
        concepts: [
          "粒子系统本质上是一组带位置、速度、尺寸等属性的数据对象。",
          "requestAnimationFrame 是动画更新主循环，它会尽量跟浏览器刷新节奏对齐。",
          "鼠标交互通常要先把 client 坐标转换成 Canvas 内部坐标，再计算距离或方向。",
          "Canvas 没有内部 DOM 结构，所以命中检测和状态管理都要自己维护。",
        ],
        practice: [
          "把粒子颜色改成渐变色系，做出更柔和的背景。",
          "尝试在粒子之间加连线，形成星空网络效果。",
        ],
        tags: ["particles", "animation", "mousemove", "requestAnimationFrame"],
        playground: {
          title: "粒子互动实验",
          description: "移动鼠标看看粒子如何被吸引，改改速度和数量很有教学意义。",
          initialCode: canvasParticlesSnippet,
          runnable: true,
          language: "html",
        },
      },
      {
        id: "optimization",
        title: "离屏渲染与性能优化",
        summary:
          "Canvas 的性能不是单靠热爱支撑的，真正的大场景要靠离屏渲染、减少状态切换和降低重绘成本。",
        concepts: [
          "减少每帧对象创建，尤其不要在高频循环里无脑 new 对象或拼数组。",
          "离屏 Canvas 适合缓存不常变化的背景、图块、阴影和复杂形状。",
          "批量绘制同类型图元、少切换 fillStyle / strokeStyle，能有效减少开销。",
          "如果只是局部变化，尽量局部 clearRect，而不是整屏推倒重来。",
        ],
        practice: [
          "给粒子系统补一个暂停按钮，并观察 CPU 占用差异。",
          "尝试把背景网格缓存到离屏 Canvas 中再复用。",
        ],
        tags: ["offscreen", "performance", "cache", "clearRect"],
      },
    ],
    resources: [
      {
        label: "MDN Canvas API",
        href: "https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API",
        description: "官方 API 总览，查细节很靠谱。",
      },
      {
        label: "参考 Canvas 学习目录",
        href: "https://interview.poetries.top/improve-learn/canvas.html",
        description: "你给的参考文章，我已基于它补全课程脉络。",
      },
      {
        label: "MDN CanvasRenderingContext2D",
        href: "https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D",
        description: "2D 上下文方法大全。",
      },
    ],
  },
  {
    id: "webcodecs",
    title: "WebCodecs",
    badge: "浏览器级音视频编解码",
    description:
      "理解 VideoFrame、EncodedVideoChunk、VideoEncoder / VideoDecoder，建立现代 Web 媒体处理心智模型。",
    overview:
      "WebCodecs 是前端多媒体进阶能力里很关键的一环，它让浏览器能更直接地处理编码、解码和帧级别数据。",
    outcomes: [
      "知道 WebCodecs 和 MediaRecorder、MSE、WebRTC 的边界。",
      "理解编码配置、帧生命周期和性能注意事项。",
      "能在支持环境下做基础能力探测和实验。",
    ],
    sections: [
      {
        id: "webcodecs-intro",
        title: "核心对象与处理链路",
        summary:
          "先把对象关系理顺，不然后面看到 VideoFrame、AudioData、Chunk 会像参加媒体 API 选秀。",
        concepts: [
          "VideoFrame 表示一帧原始视频数据，EncodedVideoChunk 表示编码后的压缩块。",
          "编码器接收帧，输出 chunk；解码器接收 chunk，输出帧。",
          "WebCodecs 关注低层处理能力，不负责完整播放器 UI 和传输协议。",
          "处理完的 VideoFrame 要及时 close，否则内存会被你薅得非常明显。",
        ],
        practice: [
          "自己写一张流程图：Frame -> Encoder -> Chunk -> Decoder -> Frame。",
          "总结它与 MediaRecorder 在使用目标上的区别。",
        ],
        tags: ["VideoFrame", "EncodedVideoChunk", "VideoEncoder", "VideoDecoder"],
      },
      {
        id: "support-check",
        title: "浏览器支持与配置探测",
        summary:
          "在真正写编码任务前，先探测环境支持，这是做媒体功能时最像安全带的一步。",
        concepts: [
          "不同浏览器对编码器、解码器和 codec 字符串支持不一致。",
          "isConfigSupported 可以先判断配置是否大概率可用。",
          "WebCodecs 往往要和 Web Workers、OffscreenCanvas 一起搭配，避免主线程卡顿。",
        ],
        practice: [
          "把 H.264 改成 VP8 或 AV1，比较返回结果。",
          "在代码里补一个‘不支持时回退到 MediaRecorder’的伪代码分支。",
        ],
        tags: ["support", "codec", "worker", "fallback"],
        playground: {
          title: "编码支持检查器",
          description: "这段代码能直接运行，适合先判断当前浏览器对 WebCodecs 的支持度。",
          initialCode: webCodecsSnippet,
          runnable: true,
          language: "html",
        },
      },
      {
        id: "webcodecs-practice",
        title: "实战建议与性能边界",
        summary:
          "WebCodecs 很强，但不是银弹。真正落地时要考虑帧率、内存、线程和传输链路。",
        concepts: [
          "高分辨率帧处理要控制并发，避免大量帧堆积在队列中。",
          "对实时场景，通常需要丢帧策略而不是无止境排队。",
          "如果做直播推流或录制，往往还要结合 WebRTC、MSE 或容器封装库。",
        ],
        practice: [
          "思考‘实时预览’和‘离线转码’在缓冲策略上的不同。",
          "列出一个媒体前端链路的监控指标：帧率、延迟、内存、错误率。",
        ],
        tags: ["realtime", "queue", "latency", "memory"],
      },
    ],
    resources: [
      {
        label: "MDN WebCodecs API",
        href: "https://developer.mozilla.org/zh-CN/docs/Web/API/WebCodecs_API",
        description: "WebCodecs 概念与对象说明。",
      },
    ],
    experimentLab: {
      kind: "webcodecs",
      title: "WebCodecs 文件上传实验台",
      description: "上传本地视频文件后，查看基础元数据、浏览器支持信息与编码能力探测结果。",
      accept: "video/*",
      hints: [
        "建议先上传较小的视频文件，避免浏览器预加载太重。",
        "这个实验台聚焦“理解链路”，不是完整的视频编辑器。",
      ],
    },
  },
  {
    id: "webaudio",
    title: "Web Audio",
    badge: "浏览器音频图谱",
    description:
      "从 AudioContext、节点图到频谱分析与麦克风输入，建立浏览器音频处理基础。",
    overview:
      "Web Audio 的关键不只是‘会播声音’，而是理解节点图（Audio Graph）如何组合、控制和分析音频。",
    outcomes: [
      "理解 AudioContext 与常见节点职责。",
      "掌握 OscillatorNode、GainNode、AnalyserNode 的基本使用。",
      "能做一个最小可交互音频实验。",
    ],
    sections: [
      {
        id: "audio-graph",
        title: "Audio Graph 心智模型",
        summary:
          "Web Audio 像一条音频流水线，每个节点都有职责：产生、加工、分析、输出。",
        concepts: [
          "AudioContext 是音频世界的根上下文，很多节点都从它创建。",
          "常见节点包括 OscillatorNode、GainNode、BiquadFilterNode、AnalyserNode。",
          "节点通过 connect 连接成图，最后通常连到 destination。",
          "浏览器会要求用户手势后再恢复 AudioContext，这是防止页面自动发声吓人。",
        ],
        practice: [
          "画出‘振荡器 -> 音量 -> 分析器 -> 扬声器’的节点图。",
          "思考为什么音频相关按钮通常要点一下才生效。",
        ],
        tags: ["AudioContext", "GainNode", "AnalyserNode"],
      },
      {
        id: "audio-lab",
        title: "频谱可视化练习",
        summary:
          "音频最适合边听边看，这个实验会让你同时看到频谱变化，手感一下就上来了。",
        concepts: [
          "AnalyserNode 可以输出时域或频域数据，适合做波形和频谱图。",
          "频谱可视化通常和 Canvas 一起使用，因为一帧一帧画柱状图非常顺手。",
          "GainNode 是最简单的音量控制节点，能避免直接把音量怼满。",
        ],
        practice: [
          "把波形颜色改掉，做出更明显的视觉风格。",
          "尝试把振荡器频率从 220 改成 440，对应 A3 到 A4。",
        ],
        tags: ["frequency", "canvas", "analyser", "oscillator"],
        playground: {
          title: "音频频谱实验室",
          description: "点击播放音调后，频谱柱会开始跳动；这就是音频节点图最小闭环。",
          initialCode: webAudioSnippet,
          runnable: true,
          language: "html",
        },
      },
      {
        id: "audio-practice",
        title: "进阶练习：麦克风与效果器",
        summary:
          "当你从‘合成声音’走向‘处理真实输入’，Web Audio 才真正开始有工程味道。",
        concepts: [
          "通过 getUserMedia 获取麦克风输入，再接入 MediaStreamAudioSourceNode。",
          "滤波器、压缩器和卷积混响可以做更复杂的处理效果。",
          "实时音频场景要注意权限申请、回声消除和延迟体验。",
        ],
        practice: [
          "写一份麦克风录入的伪代码流程。",
          "思考音乐可视化、在线乐器、语音降噪分别需要哪些节点。",
        ],
        tags: ["getUserMedia", "effects", "microphone"],
      },
    ],
    resources: [
      {
        label: "MDN Web Audio API",
        href: "https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API",
        description: "Web Audio API 概念与示例。",
      },
    ],
    experimentLab: {
      kind: "webaudio",
      title: "Web Audio 文件上传实验台",
      description: "上传音频后直接播放，并把频谱分析结果渲染到 Canvas 上。",
      accept: "audio/*",
      hints: [
        "播放前要先点一下按钮恢复 AudioContext，这是浏览器的正常防线。",
        "频谱跳不起来时，先检查文件是否可播放、浏览器是否静音。",
      ],
    },
  },
  {
    id: "webgl",
    title: "WebGL",
    badge: "GPU 渲染基础",
    description:
      "理解着色器、缓冲区、顶点属性和渲染管线，从绘制三角形开始进入 GPU 世界。",
    overview:
      "WebGL 是比 Canvas 2D 更底层的图形接口，学它最怕一上来被概念密度打懵，所以这里用最短路径切进去。",
    outcomes: [
      "知道 WebGL 与 Canvas 2D 的差异。",
      "掌握最小三角形渲染的完整链路。",
      "理解 shader、buffer、attribute 的职责划分。",
    ],
    sections: [
      {
        id: "webgl-pipeline",
        title: "渲染管线与着色器",
        summary:
          "WebGL 的门槛主要来自概念密度，但一旦你把‘顶点着色器 -> 光栅化 -> 片元着色器’串起来，雾就会散很多。",
        concepts: [
          "顶点着色器决定顶点位置，片元着色器决定最终像素颜色。",
          "缓冲区负责把顶点数据送到 GPU，attribute 把 buffer 解释给 shader。",
          "WebGL 很多 API 都是配置状态机，因此调用顺序很重要。",
        ],
        practice: [
          "解释一下为什么一个三角形也要写两段 shader。",
          "把片元着色器颜色改成你自己的品牌色。",
        ],
        tags: ["shader", "buffer", "attribute", "pipeline"],
        playground: {
          title: "最小三角形渲染",
          description: "这是 WebGL 教材里的经典开局，能跑起来就说明你的 GPU 通道打通了。",
          initialCode: webGlSnippet,
          runnable: true,
          language: "html",
        },
      },
      {
        id: "webgl-transform",
        title: "坐标、矩阵与动画",
        summary:
          "真正开始做场景之后，矩阵会成为高频角色。先知道它为什么存在，比硬背公式更重要。",
        concepts: [
          "WebGL 默认坐标是裁剪空间，x 和 y 范围通常在 -1 到 1。",
          "平移、旋转、缩放往往通过矩阵统一描述。",
          "动画依旧常用 requestAnimationFrame，只是绘制工作更多交给 GPU。",
        ],
        practice: [
          "给三角形做一个左右移动动画。",
          "查一下 mat3 / mat4 在二维和三维中的差别。",
        ],
        tags: ["matrix", "clip-space", "animation"],
      },
      {
        id: "webgl-texture",
        title: "纹理与性能意识",
        summary:
          "从纯色图形迈向真实 UI 或 3D 场景时，纹理和资源管理会迅速变成重点。",
        concepts: [
          "纹理本质是 GPU 可采样的图像资源。",
          "大纹理、频繁上传、状态切换都可能让性能直线下滑。",
          "复杂场景通常会借助 three.js、pixi.js 等库封装底层细节。",
        ],
        practice: [
          "总结什么时候该直接写 WebGL，什么时候更适合用 three.js。",
          "试着为一个图片上传任务设计纹理加载流程。",
        ],
        tags: ["texture", "gpu", "performance"],
      },
    ],
    resources: [
      {
        label: "MDN WebGL API",
        href: "https://developer.mozilla.org/zh-CN/docs/Web/API/WebGL_API",
        description: "WebGL 基础与 API 入口。",
      },
    ],
    experimentLab: {
      kind: "webgl",
      title: "WebGL 纹理上传实验台",
      description: "上传本地图片并作为纹理贴到一个 WebGL 画布中，理解纹理资源进入 GPU 的最小路径。",
      accept: "image/*",
      hints: [
        "优先选择 png 或 jpg 图片，能更快看到纹理效果。",
        "这不是 three.js 封装版，看到图说明你真的把底层流程走通了。",
      ],
    },
  },
  {
    id: "ffmpeg",
    title: "FFmpeg",
    badge: "多媒体处理瑞士军刀",
    description:
      "理解 FFmpeg 命令模型、ffmpeg.wasm 浏览器方案与常见转码任务，在前端多媒体场景里建立执行力。",
    overview:
      "FFmpeg 是媒体工具链里绕不开的角色。前端常见落地形态包括后端命令行、Node 服务和浏览器内的 ffmpeg.wasm。",
    outcomes: [
      "理解 FFmpeg 的输入、滤镜、输出三段式思路。",
      "知道浏览器内运行 ffmpeg.wasm 的收益与代价。",
      "能设计常见转码、抽帧、提音频任务。",
    ],
    sections: [
      {
        id: "ffmpeg-basics",
        title: "命令模型与常见任务",
        summary:
          "FFmpeg 最有价值的不是记住每个参数，而是先理解它如何组合输入、滤镜和输出。",
        concepts: [
          "最常见的任务包括转码、裁剪、抽帧、提取音频、拼接与加水印。",
          "命令行思路通常是 ffmpeg -i input ... output。",
          "前端项目里经常要把这些任务抽象成配置面板和可追踪任务流。",
        ],
        practice: [
          "写出把 mp4 提取成 mp3 的命令。",
          "思考抽取视频封面和生成 GIF 分别需要哪些参数。",
        ],
        tags: ["transcode", "thumbnail", "audio-extract"],
      },
      {
        id: "ffmpeg-wasm",
        title: "浏览器中的 ffmpeg.wasm",
        summary:
          "把 FFmpeg 搬进浏览器很酷，但它会占 CPU、内存和加载时间，所以要带着工程意识使用。",
        concepts: [
          "ffmpeg.wasm 本质上是把 FFmpeg 编译成 WebAssembly，在浏览器内执行。",
          "适合中小文件、本地隐私处理、无后端依赖的场景。",
          "大文件处理通常需要 Worker、进度条、取消按钮和失败兜底。",
        ],
        practice: [
          "给这段代码补一个进度更新设计。",
          "列出‘浏览器转码’和‘服务端转码’的优缺点对比。",
        ],
        tags: ["wasm", "worker", "progress", "memory"],
        playground: {
          title: "ffmpeg.wasm 代码模板",
          description: "这段示例默认不在 iframe 中执行，但你可以直接编辑、复制并迁移到真实项目里。",
          initialCode: ffmpegSnippet,
          runnable: false,
          language: "ts",
        },
      },
      {
        id: "ffmpeg-architecture",
        title: "前端多媒体架构中的位置",
        summary:
          "FFmpeg 不该孤零零出现，它通常是整条媒体工作流中的一个环节。",
        concepts: [
          "典型链路可能是：上传 -> 预处理 -> 转码 -> 预览 -> 发布 -> 回放。",
          "浏览器端可以做轻处理和即时反馈，重任务更适合放到服务端。",
          "和 WebCodecs 搭配时，要明确谁负责低层编解码，谁负责容器处理和任务编排。",
        ],
        practice: [
          "画出一个视频发布系统的前端媒体处理链路。",
          "思考什么时候该优先用 FFmpeg，什么时候该先考虑 WebCodecs。",
        ],
        tags: ["architecture", "pipeline", "upload"],
      },
    ],
    resources: [
      {
        label: "FFmpeg 官方文档",
        href: "https://ffmpeg.org/documentation.html",
        description: "命令参数的终极来源。",
      },
      {
        label: "ffmpeg.wasm",
        href: "https://ffmpegwasm.netlify.app/",
        description: "浏览器端 FFmpeg 方案。",
      },
    ],
    experimentLab: {
      kind: "ffmpeg",
      title: "FFmpeg 上传实验台",
      description: "上传媒体文件后生成常见任务命令草稿，并为后续接入 ffmpeg.wasm 预留运行入口。",
      accept: "video/*,audio/*,image/*",
      hints: [
        "这个实验台先聚焦任务编排、命令感知和输入输出关系。",
        "真要跑大文件转码，建议再加 worker、进度条和取消机制。",
      ],
    },
  },
];

export const leetCodeGroups = [
  {
    title: "前端高频基础",
    description: "数组、字符串、哈希表，适合建立算法手感。",
    links: [
      { label: "两数之和", href: "https://leetcode.cn/problems/two-sum/" },
      { label: "最长无重复子串", href: "https://leetcode.cn/problems/longest-substring-without-repeating-characters/" },
      { label: "有效的括号", href: "https://leetcode.cn/problems/valid-parentheses/" },
    ],
  },
  {
    title: "树与递归",
    description: "做可视化、编辑器、AST、组件树时很有共鸣。",
    links: [
      { label: "二叉树的层序遍历", href: "https://leetcode.cn/problems/binary-tree-level-order-traversal/" },
      { label: "对称二叉树", href: "https://leetcode.cn/problems/symmetric-tree/" },
      { label: "路径总和", href: "https://leetcode.cn/problems/path-sum/" },
    ],
  },
  {
    title: "图与搜索",
    description: "适合训练状态建模和 BFS / DFS。",
    links: [
      { label: "岛屿数量", href: "https://leetcode.cn/problems/number-of-islands/" },
      { label: "打开转盘锁", href: "https://leetcode.cn/problems/open-the-lock/" },
      { label: "课程表", href: "https://leetcode.cn/problems/course-schedule/" },
    ],
  },
  {
    title: "动态规划",
    description: "练习把复杂问题拆成状态转移，脑子会疼但会变强。",
    links: [
      { label: "爬楼梯", href: "https://leetcode.cn/problems/climbing-stairs/" },
      { label: "打家劫舍", href: "https://leetcode.cn/problems/house-robber/" },
      { label: "最长递增子序列", href: "https://leetcode.cn/problems/longest-increasing-subsequence/" },
    ],
  },
];

export const moduleRouteMeta = learningModules.map((module) => ({
  id: module.id,
  label: module.title,
  href: buildModulePath(module.id),
  description: module.badge,
}));
