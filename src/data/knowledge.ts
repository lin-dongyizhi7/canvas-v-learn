import type { LearningModule } from "./modules";

type ModuleId = LearningModule["id"];

export interface KnowledgeBlock {
  title: string;
  bullets: string[];
}

export interface InterviewQuestion {
  question: string;
  answer: string;
  tags: string[];
}

export interface ModuleKnowledge {
  mustKnow: KnowledgeBlock[];
  engineeringNotes: KnowledgeBlock[];
  interviewHighlights: InterviewQuestion[];
}

export const moduleKnowledgeMap: Record<ModuleId, ModuleKnowledge> = {
  canvas: {
    mustKnow: [
      {
        title: "核心原理",
        bullets: [
          "Canvas 是立即模式的位图绘制系统，图形一旦画上去，浏览器不会继续替你维护对象树。",
          "它和 SVG 的最大差异不是 API 写法，而是渲染模型：Canvas 偏像素、SVG 偏结构化图元。",
          "高频动画、粒子、大量点线面渲染更适合 Canvas；少量图形、精细交互和无损缩放更适合 SVG。",
        ],
      },
      {
        title: "图像质量",
        bullets: [
          "高分屏要考虑 devicePixelRatio，否则只改 CSS 宽高会模糊。",
          "文字、阴影、渐变、路径和像素处理会叠加性能成本，很多卡顿都不是单一 API 造成的。",
          "Canvas 天生不保存语义结构，所以可访问性、SEO 和图元级事件都需要你补额外方案。",
        ],
      },
      {
        title: "常见场景",
        bullets: [
          "图表、白板、海报合成、游戏、特效背景、可视化大屏、图像编辑器都是典型战场。",
          "如果是专业白板或图形编辑器，Canvas 常常只是渲染层，状态管理、命中检测、选区系统仍在 JS 数据层。",
        ],
      },
    ],
    engineeringNotes: [
      {
        title: "性能方法",
        bullets: [
          "减少高频循环中的对象创建，分层绘制，静态内容预渲染到离屏 Canvas。",
          "统一批量设置样式，少切 fillStyle / strokeStyle / shadow 参数，降低状态切换成本。",
          "尽量按脏区局部重绘，而不是每一帧全屏清空再重画所有元素。",
        ],
      },
      {
        title: "工程边界",
        bullets: [
          "命中检测、拖拽、缩放、选中态一般要自己实现，浏览器不会替你托底。",
          "复杂场景往往需要相机系统、变换矩阵、图层管理和撤销重做栈。",
        ],
      },
    ],
    interviewHighlights: [
      {
        question: "Canvas 和 SVG 的根本区别是什么？",
        answer:
          "核心差异是渲染模型。Canvas 是像素级立即模式，绘制后没有独立图元；SVG 是保留模式，每个图形都是 DOM 节点，可单独绑定事件和样式。高频动态场景更偏 Canvas，结构化矢量图与复杂交互更偏 SVG。",
        tags: ["基础", "高频"],
      },
      {
        question: "为什么 Canvas 在高频动画场景更常见？",
        answer:
          "因为它内部没有成百上千个 DOM 节点参与布局和样式计算，大量图元更新时整体渲染效率更高。但代价是你要自己做命中检测、状态管理和重绘策略。",
        tags: ["性能"],
      },
      {
        question: "Canvas 模糊通常怎么处理？",
        answer:
          "一般会根据 devicePixelRatio 放大内部像素尺寸，再用 ctx.scale 做适配。只改 CSS 宽高不改画布实际像素，会直接导致模糊。",
        tags: ["高频", "细节"],
      },
    ],
  },
  webcodecs: {
    mustKnow: [
      {
        title: "对象体系",
        bullets: [
          "WebCodecs 直接暴露浏览器原生编解码能力，核心对象包括 VideoFrame、AudioData、EncodedVideoChunk、EncodedAudioChunk、VideoEncoder、VideoDecoder 等。",
          "它工作在‘容器之外’，也就是更偏裸编码流和帧级控制，不负责 MP4 等容器格式的封装与拆封。",
          "编码和解码都是异步队列模型，吞吐和延迟控制比‘能不能 encode’本身更重要。",
        ],
      },
      {
        title: "适用场景",
        bullets: [
          "浏览器内视频编辑、实时滤镜、直播推流、视频会议、浏览器端导出和逐帧媒体处理都很适合。",
          "如果你只是要录个屏或简单导出，MediaRecorder 更省心；如果需要逐帧控制、硬件加速和低延迟，WebCodecs 更强。",
        ],
      },
      {
        title: "关键坑点",
        bullets: [
          "VideoFrame 占用的通常是 GPU / 媒体资源，忘记 close 会非常容易造成内存泄漏和卡死。",
          "接口支持是拆开的，VideoEncoder 有不代表 MediaStreamTrackProcessor 也齐全，兼容性要按接口颗粒度判断。",
        ],
      },
    ],
    engineeringNotes: [
      {
        title: "处理链路",
        bullets: [
          "典型实时链路是 MediaStreamTrackProcessor -> TransformStream -> VideoTrackGenerator，再接到 video 或 WebRTC。",
          "大部分实际项目还要加 mux / demux 层，因为 WebCodecs 不直接处理 MP4 等容器。",
          "真实生产里要控制队列长度、丢帧策略、worker 线程边界和异常恢复。",
        ],
      },
      {
        title: "性能策略",
        bullets: [
          "尽量把逐帧处理放到 Worker 或 OffscreenCanvas，减轻主线程 UI 压力。",
          "编码参数要根据实时性和质量目标取舍，比如 bitrate、framerate、latencyMode、keyframe 间隔。",
        ],
      },
    ],
    interviewHighlights: [
      {
        question: "WebCodecs 和 MediaRecorder 有什么区别？",
        answer:
          "MediaRecorder 更高层、更易用，适合录制现成的 MediaStream；WebCodecs 更底层，能直接处理帧和 chunk，适合自定义编码、逐帧滤镜和低延迟场景，但也需要你自己处理更多资源管理和容器问题。",
        tags: ["高频", "对比"],
      },
      {
        question: "为什么 WebCodecs 经常和 Worker 一起出现？",
        answer:
          "因为逐帧视频处理很重，主线程既要管 UI 又要管媒体，很容易掉帧。Worker 能把编解码和图像处理搬离主线程，降低卡顿风险。",
        tags: ["性能"],
      },
      {
        question: "WebCodecs 最大的工程边界是什么？",
        answer:
          "它不是完整视频文件处理方案，不负责容器层。你能拿到 chunk 和 frame，但如果要生成 MP4、拆流或做复杂媒体编排，还要引入 muxer / demuxer 或额外库。",
        tags: ["边界"],
      },
    ],
  },
  webaudio: {
    mustKnow: [
      {
        title: "音频图模型",
        bullets: [
          "Web Audio 的核心是 AudioContext 和一张节点图，音频从 source 节点流向处理节点，最后流向 destination。",
          "常见节点包括 AudioBufferSourceNode、OscillatorNode、GainNode、AnalyserNode、BiquadFilterNode、ConvolverNode。",
          "相比 `<audio>` 标签，Web Audio 更偏实时控制、合成、调度和分析。",
        ],
      },
      {
        title: "关键概念",
        bullets: [
          "AudioBufferSourceNode 和 OscillatorNode 都是一次性 source，播完通常就废弃，需要重新创建。",
          "AnalyserNode 能提供时域和频域数据，是可视化、音量检测、频谱分析的基础。",
          "AudioContext 往往默认处于 suspended，需要用户手势里 resume 才能真正出声。",
        ],
      },
      {
        title: "进阶能力",
        bullets: [
          "AudioWorklet 是现代自定义音频处理首选，能把 DSP 逻辑从主线程移开。",
          "OfflineAudioContext 适合做离线渲染、批处理效果和快于实时的音频计算。",
        ],
      },
    ],
    engineeringNotes: [
      {
        title: "工程实践",
        bullets: [
          "大多数应用建议只维护一个 AudioContext，多个上下文会增加资源消耗并让时序更难管理。",
          "麦克风输入通常经由 getUserMedia + MediaStreamAudioSourceNode 进入图。",
          "复杂效果链要注意 CPU 开销和移动端电量消耗，页面隐藏时可以 suspend。 ",
        ],
      },
      {
        title: "常见限制",
        bullets: [
          "自动播放策略、权限申请、设备输出切换和浏览器差异经常是踩坑源头。",
          "ScriptProcessorNode 已经过时，面试里如果还把它当推荐方案，基本属于自己递刀。",
        ],
      },
    ],
    interviewHighlights: [
      {
        question: "为什么不用 `<audio>`，而要用 Web Audio？",
        answer:
          "因为 `<audio>` 更偏线性播放，控制粒度有限。Web Audio 能做节点式处理、精确调度、实时分析、滤镜、空间音频和音频合成，适合互动式场景。",
        tags: ["高频"],
      },
      {
        question: "AnalyserNode 有什么用？",
        answer:
          "它可以输出实时时域和频域数据，常用来做频谱、波形、音量检测、节奏响应和语音可视化，本身不修改音频信号。",
        tags: ["基础"],
      },
      {
        question: "AudioWorklet 为什么比 ScriptProcessorNode 更推荐？",
        answer:
          "因为 AudioWorklet 运行在专门的音频渲染线程，时序更稳定、延迟更低，主线程卡顿时也不容易导致爆音或掉帧。",
        tags: ["现代实践", "性能"],
      },
    ],
  },
  webgl: {
    mustKnow: [
      {
        title: "渲染管线",
        bullets: [
          "WebGL 是浏览器里的 GPU 图形接口，基于 OpenGL ES 思路，通过 shader、buffer、texture、framebuffer 等对象工作。",
          "最小链路通常是：准备顶点数据 -> 上传 buffer -> 编译 / 链接 shader program -> 设置 attribute / uniform -> draw。",
          "顶点着色器负责处理顶点坐标与插值数据，片元着色器负责最终像素颜色。",
        ],
      },
      {
        title: "常见对象",
        bullets: [
          "Buffer 存数据，Texture 存纹理，Framebuffer 用于离屏渲染和后处理。",
          "矩阵变换负责模型、视图、投影坐标空间转换，是 2D/3D 图形的基础。",
          "深度测试、剔除、混合和视口设置都是高频状态配置项。",
        ],
      },
      {
        title: "现实世界关系",
        bullets: [
          "WebGL 学会后再看 three.js / pixi.js / regl 会顺很多，因为你知道它们在底层帮你封装了什么。",
          "WebGL1 和 WebGL2 能力不同，很多高级功能如 VAO、instancing、MRT 在 WebGL2 中更自然。",
        ],
      },
    ],
    engineeringNotes: [
      {
        title: "调试与性能",
        bullets: [
          "Shader 编译和 program 链接错误必须检查日志，不然黑屏时会像和宇宙对视一样沉默。",
          "减少 draw call、批量提交数据、合理复用纹理和 buffer，是 WebGL 性能优化主线。",
          "纹理尺寸、状态切换、过度 overdraw、频繁 readPixels 都可能拖垮性能。",
        ],
      },
      {
        title: "工程边界",
        bullets: [
          "直接写 WebGL 灵活但心智负担高，业务项目经常用 three.js 做场景层抽象。",
          "如果只是 2D 游戏或可视化，也可能选 Canvas / WebGPU / 封装库，而不是直接手搓 WebGL。",
        ],
      },
    ],
    interviewHighlights: [
      {
        question: "WebGL 的渲染管线大致是什么？",
        answer:
          "一般会从顶点数据进入，经过顶点着色器、图元装配、光栅化、片元着色器，最后输出到 framebuffer。真实项目里还会叠加深度测试、混合、纹理采样和后处理。",
        tags: ["高频"],
      },
      {
        question: "什么是 shader？为什么 WebGL 离不开它？",
        answer:
          "Shader 是运行在 GPU 上的小程序，决定顶点如何变换、像素如何着色。WebGL 走的是可编程管线，不写 shader 就没法定义渲染逻辑。",
        tags: ["基础"],
      },
      {
        question: "Framebuffer 有什么用？",
        answer:
          "它可以把渲染结果先输出到纹理或离屏目标，而不是直接上屏，所以常用于后处理、阴影贴图、屏幕特效和多阶段渲染。",
        tags: ["进阶", "高频"],
      },
    ],
  },
  ffmpeg: {
    mustKnow: [
      {
        title: "认知框架",
        bullets: [
          "FFmpeg 不只是一个命令行工具，更是一套音视频处理库和工具链。",
          "它常见的认知框架是：输入 -> 解封装 / 解码 -> 处理 / 滤镜 -> 编码 -> 封装 -> 输出。",
          "容器格式和编码格式不是一回事，MP4 / MKV 是容器，H.264 / H.265 / AAC 是编码。",
        ],
      },
      {
        title: "高频命令思维",
        bullets: [
          "转码、抽帧、裁剪、提取音频、加水印、截图、推流和滤镜链是面试高频区。",
          "只会背 `ffmpeg -i input output` 不够，真正加分的是能解释 `-c:v`、`-preset`、`-crf`、`-b:v`、`-vf`、`-af` 为什么这样配。",
        ],
      },
      {
        title: "前端视角",
        bullets: [
          "浏览器里常见形态是 ffmpeg.wasm，优点是本地处理与免服务端，代价是包体积、CPU 和内存消耗。",
          "很多前端多媒体项目会把 FFmpeg 用于上传预处理、封面生成、音频提取、GIF 生成和格式兼容兜底。",
        ],
      },
    ],
    engineeringNotes: [
      {
        title: "参数理解",
        bullets: [
          "CRF 控制质量导向编码，preset 控制编码速度与压缩率权衡，二者经常一起出现。",
          "直播或实时场景更关心延迟、GOP、关键帧间隔、码率峰值与缓冲，而不只是离线导出质量。",
          "硬件加速要看平台和编码器支持，真正瓶颈不只在 encode，也可能在 IO、拷贝和滤镜链。",
        ],
      },
      {
        title: "工程边界",
        bullets: [
          "前端直接跑 ffmpeg.wasm 很适合中小文件或隐私敏感任务，但不适合无脑处理长视频大文件。",
          "真实产品里要补进度、任务取消、错误恢复、worker 隔离和磁盘 / 内存预算。",
        ],
      },
    ],
    interviewHighlights: [
      {
        question: "容器格式和编码格式有什么区别？",
        answer:
          "容器是装音视频流、字幕、元信息的盒子，比如 MP4 / MKV；编码格式是压缩算法，比如 H.264 / H.265 / AAC。面试里把这两个混在一起，通常会被顺手追问。",
        tags: ["高频"],
      },
      {
        question: "为什么转码命令里经常同时出现 `-preset` 和 `-crf`？",
        answer:
          "`crf` 更偏画质控制，`preset` 更偏编码速度和压缩率权衡。它们作用维度不同，经常一起使用来找到质量、速度、体积的平衡点。",
        tags: ["参数", "高频"],
      },
      {
        question: "FFmpeg 和 WebCodecs 在前端多媒体里怎么分工？",
        answer:
          "WebCodecs 更偏浏览器原生编解码和逐帧处理，FFmpeg 更偏容器、滤镜、转码任务编排与多格式兼容。很多项目不是二选一，而是组合拳。",
        tags: ["对比", "架构"],
      },
    ],
  },
};

export interface InterviewGroup {
  id: string;
  title: string;
  intro: string;
  questions: InterviewQuestion[];
}

export const interviewGroups: InterviewGroup[] = [
  {
    id: "general-media",
    title: "通用多媒体前端",
    intro: "这组题不盯死某一个 API，更像面试官在摸你对整体媒体系统的认识边界。",
    questions: [
      {
        question: "前端做多媒体处理时，什么时候选浏览器原生 API，什么时候选 wasm 或服务端？",
        answer:
          "要看延迟、文件体积、隐私和算力预算。轻量、实时、交互强的优先浏览器原生；复杂容器和重转码可选 wasm；长视频、批处理和稳定性要求极高的场景通常还是服务端更稳。",
        tags: ["系统设计", "高频"],
      },
      {
        question: "多媒体前端最常见的性能瓶颈有哪些？",
        answer:
          "主线程卡顿、GPU / CPU 资源争抢、内存泄漏、帧队列堆积、IO 开销、纹理 / buffer 过大、Worker 切换成本和不合理的重绘策略都很常见。",
        tags: ["性能"],
      },
      {
        question: "你会如何回答‘你做过的多媒体项目里最难的问题是什么’？",
        answer:
          "不要只说 bug 名字，最好从场景、瓶颈、定位方法、取舍方案、结果指标五段来讲。比如帧率不稳、转码超时、音画不同步、WebGL 黑屏、浏览器兼容性等都适合展开。",
        tags: ["项目题", "行为题"],
      },
      {
        question: "为什么面试官总爱追问兼容性和降级？",
        answer:
          "因为多媒体 API 的支持颗粒度很碎，很多能力不是‘浏览器支持 / 不支持’二元问题，而是某些接口、编码器、线程模型、权限策略分别支持与否。能讲清降级策略，说明你真的做过工程。",
        tags: ["兼容性", "高频"],
      },
    ],
  },
  {
    id: "system-design-media",
    title: "系统设计与项目追问题",
    intro: "这一组更像二面和项目追问，重点看你是否能把 API 放进完整架构里思考。",
    questions: [
      {
        question: "如何设计一个浏览器端视频处理链路？",
        answer:
          "通常先拆成采集 / 上传、解码、逐帧处理、编码、封装、预览、导出七段，再决定哪些用浏览器原生、哪些下沉到 Worker 或服务端。关键不是 API 名称，而是吞吐、内存、兼容性和失败兜底。",
        tags: ["系统设计", "高频"],
      },
      {
        question: "如果用户上传的是大视频文件，前端应注意什么？",
        answer:
          "需要考虑文件切片、预览首帧、元信息探测、任务取消、进度提示、Worker 隔离和失败回退。不能一股脑把整个文件和所有帧都压进主线程内存里。",
        tags: ["上传", "工程"],
      },
      {
        question: "为什么很多多媒体功能需要 Worker？",
        answer:
          "因为这类任务通常 CPU / 内存占用高、持续时间长、对交互卡顿极敏感。Worker 能把逐帧处理、wasm 计算、频谱分析等任务从主线程剥离开，保护 UI 响应。",
        tags: ["Worker", "性能"],
      },
      {
        question: "如果浏览器 API 能力不齐，你怎么做降级？",
        answer:
          "先做 feature detection，再根据能力拆出原生路径、wasm 路径和服务端路径。比如 WebCodecs 不行时回退 MediaRecorder 或服务端转码；WebGL 不行时回退 Canvas/SVG；音频工作线程不行时降级到较轻的效果链。",
        tags: ["降级", "架构"],
      },
      {
        question: "如何向面试官证明你不是只会抄 demo？",
        answer:
          "最有效的是讲出你真正踩过的坑：比如 frame.close 泄漏、AudioContext autoplay、纹理跨域、ffmpeg.wasm 内存爆炸、Canvas 高清适配、关键帧策略等。只要能说清楚原因和取舍，可信度会一下子抬起来。",
        tags: ["项目", "表达"],
      },
    ],
  },
  {
    id: "canvas-interview",
    title: "Canvas 面试高频题",
    intro: "围绕渲染模型、性能优化、SVG 对比和工程实践来问，是白板、图表和可视化岗位的常客。",
    questions: moduleKnowledgeMap.canvas.interviewHighlights,
  },
  {
    id: "webcodecs-interview",
    title: "WebCodecs 面试高频题",
    intro: "偏媒体工程、浏览器视频处理、实时协作和视频编辑器方向最爱追问。",
    questions: moduleKnowledgeMap.webcodecs.interviewHighlights,
  },
  {
    id: "webaudio-interview",
    title: "Web Audio 面试高频题",
    intro: "多见于音频可视化、在线乐器、游戏音频和语音互动场景。",
    questions: moduleKnowledgeMap.webaudio.interviewHighlights,
  },
  {
    id: "webgl-interview",
    title: "WebGL 面试高频题",
    intro: "核心考点通常是 shader、渲染管线、纹理、坐标变换、framebuffer 和性能调优。",
    questions: moduleKnowledgeMap.webgl.interviewHighlights,
  },
  {
    id: "ffmpeg-interview",
    title: "FFmpeg 面试高频题",
    intro: "核心考点通常是参数理解、容器与编码、质量控制、滤镜链和工程上的资源取舍。",
    questions: moduleKnowledgeMap.ffmpeg.interviewHighlights,
  },
];
