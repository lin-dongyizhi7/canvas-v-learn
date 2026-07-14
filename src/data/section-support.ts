import type { PlaygroundConfig, SectionContent } from "./modules";

export interface SectionApiReference {
  name: string;
  description: string;
}

const sectionApiMap: Record<string, SectionApiReference[]> = {
  "canvas-intro": [
    {
      name: "HTMLCanvasElement.getContext",
      description: "从 canvas 元素拿到绘图上下文，是一切 Canvas 能力的入口。",
    },
    {
      name: "CanvasRenderingContext2D",
      description: "2D 绘图上下文对象，后续的路径、样式、文字和图像 API 都挂在它上面。",
    },
    {
      name: "requestAnimationFrame",
      description: "和 Canvas 高频重绘搭配最自然的动画调度 API，能尽量贴合浏览器刷新节奏。",
    },
  ],
  "create-canvas": [
    {
      name: "canvas.width / canvas.height",
      description: "设置真实绘图缓冲区尺寸，直接影响清晰度和坐标系范围。",
    },
    {
      name: "ctx.fillRect",
      description: "直接绘制实心矩形，是最常见的 Canvas 入门 API。",
    },
    {
      name: "ctx.strokeRect",
      description: "绘制矩形边框，适合理解描边与填充的差异。",
    },
    {
      name: "ctx.clearRect",
      description: "清理指定区域，动画循环和局部重绘里很常见。",
    },
  ],
  "path-style-transform": [
    {
      name: "ctx.beginPath / ctx.moveTo / ctx.lineTo",
      description: "路径绘制三件套，用来描述折线、轮廓和任意形状。",
    },
    {
      name: "ctx.arc",
      description: "绘制圆弧和圆形，是按钮、头像、粒子等场景的高频 API。",
    },
    {
      name: "ctx.save / ctx.restore",
      description: "保存和恢复状态栈，避免样式和变换把后续绘图一起带偏。",
    },
    {
      name: "ctx.translate / ctx.rotate / ctx.scale",
      description: "常见几何变换 API，配合状态栈能更优雅地组织复杂绘制。",
    },
  ],
  "image-pixels": [
    {
      name: "ctx.drawImage",
      description: "把图片、视频帧或另一个 canvas 绘制到当前画布上，是图像合成的核心入口。",
    },
    {
      name: "ctx.getImageData",
      description: "读取像素数组，适合做滤镜、取色和图像分析，但要注意性能成本。",
    },
    {
      name: "ctx.putImageData",
      description: "把修改后的像素重新写回画布，用于像素级处理结果回填。",
    },
  ],
  "particle-animation": [
    {
      name: "requestAnimationFrame",
      description: "动画主循环入口，用来驱动粒子位置更新与逐帧重绘。",
    },
    {
      name: "canvas.addEventListener",
      description: "监听鼠标移动、点击等交互事件，给粒子系统加上外部输入。",
    },
    {
      name: "Math.hypot",
      description: "计算二维距离很顺手，常用来做粒子与鼠标之间的吸引或排斥效果。",
    },
    {
      name: "ctx.arc / ctx.fill",
      description: "用圆形快速表达粒子，再通过 fill 形成可见实体。",
    },
  ],
  optimization: [
    {
      name: "OffscreenCanvas",
      description: "离屏绘制能力，适合缓存复杂图层或放进 Worker 中减轻主线程压力。",
    },
    {
      name: "ctx.clearRect",
      description: "局部清理比整屏重绘更省，脏区更新时尤其常见。",
    },
    {
      name: "requestAnimationFrame",
      description: "动画循环依然建议以它为主，再配合脏区和缓存策略降低总开销。",
    },
  ],
  "webcodecs-intro": [
    {
      name: "VideoFrame",
      description: "表示原始视频帧数据，逐帧处理和编码前预处理都离不开它。",
    },
    {
      name: "EncodedVideoChunk",
      description: "表示编码后的压缩视频块，是编码器输出、解码器输入的关键数据结构。",
    },
    {
      name: "VideoEncoder / VideoDecoder",
      description: "浏览器原生视频编解码对象，分别负责帧到 chunk、chunk 到帧的转换。",
    },
  ],
  "support-check": [
    {
      name: "VideoEncoder.isConfigSupported",
      description: "编码前先探测配置是否可用，能少踩很多浏览器和 codec 兼容坑。",
    },
    {
      name: "VideoDecoder.isConfigSupported",
      description: "解码能力探测接口，适合在真正加载处理链前先做能力分流。",
    },
    {
      name: "Worker",
      description: "逐帧媒体处理通常要搬进 Worker，避免主线程被编解码拖慢。",
    },
  ],
  "webcodecs-practice": [
    {
      name: "MediaStreamTrackProcessor",
      description: "把媒体轨道转成可读取的帧流，是浏览器实时视频处理常见起点。",
    },
    {
      name: "TransformStream",
      description: "把帧处理逻辑插入流式链路，适合滤镜、裁剪和特效场景。",
    },
    {
      name: "VideoFrame.close",
      description: "释放帧占用的底层资源，忘记调用时很容易内存一路飞升。",
    },
  ],
  "audio-graph": [
    {
      name: "AudioContext",
      description: "音频图的根上下文，几乎所有 Web Audio 节点都从这里创建。",
    },
    {
      name: "AudioNode.connect",
      description: "把节点连成处理图的核心方法，决定音频如何流动。",
    },
    {
      name: "audioContext.resume",
      description: "浏览器通常要求用户手势后显式恢复音频上下文，才能真正播放。",
    },
  ],
  "audio-lab": [
    {
      name: "AnalyserNode",
      description: "提供时域和频域数据，是波形图、频谱图等可视化效果的基础。",
    },
    {
      name: "OscillatorNode",
      description: "生成基础波形，适合做最小可运行的音频实验。",
    },
    {
      name: "GainNode",
      description: "用于控制音量和过渡强度，避免声音直接炸到用户脸上。",
    },
  ],
  "audio-practice": [
    {
      name: "navigator.mediaDevices.getUserMedia",
      description: "获取麦克风输入或摄像头流，是接入真实音频源的关键起点。",
    },
    {
      name: "MediaStreamAudioSourceNode",
      description: "把 MediaStream 接入 Audio Graph，让麦克风输入进入处理链。",
    },
    {
      name: "BiquadFilterNode / DynamicsCompressorNode",
      description: "常见的滤波和压缩节点，适合构建更有工程味的效果器链路。",
    },
  ],
  "webgl-pipeline": [
    {
      name: "gl.createShader / gl.shaderSource / gl.compileShader",
      description: "着色器编译三步曲，用来把 GLSL 代码变成 GPU 可执行对象。",
    },
    {
      name: "gl.createProgram / gl.linkProgram / gl.useProgram",
      description: "把顶点和片元着色器组合成可用 program，并切换到当前渲染管线。",
    },
    {
      name: "gl.drawArrays",
      description: "真正触发绘制的调用，前面所有配置都在为它铺路。",
    },
  ],
  "webgl-transform": [
    {
      name: "gl.uniformMatrix4fv",
      description: "把矩阵数据传进 shader，是平移、旋转、缩放和相机变换的常见入口。",
    },
    {
      name: "requestAnimationFrame",
      description: "驱动 WebGL 场景更新的常见动画调度方式。",
    },
    {
      name: "gl.viewport",
      description: "设置当前渲染目标的视口范围，尺寸不对时很容易出现画面异常。",
    },
  ],
  "webgl-texture": [
    {
      name: "gl.createTexture / gl.bindTexture",
      description: "创建并绑定纹理对象，是图片进入 GPU 世界的第一步。",
    },
    {
      name: "gl.texImage2D",
      description: "把图像数据上传到纹理中，纹理贴图的关键 API。",
    },
    {
      name: "gl.texParameteri",
      description: "设置纹理采样和边界策略，影响清晰度、缩放和重复方式。",
    },
  ],
  "ffmpeg-basics": [
    {
      name: "ffmpeg -i",
      description: "声明输入文件，是 FFmpeg 命令建模的标准起点。",
    },
    {
      name: "-vf / -af",
      description: "分别用于视频滤镜和音频滤镜，是裁剪、缩放、叠字、音量处理的高频参数。",
    },
    {
      name: "-c:v / -c:a",
      description: "指定视频和音频编码器，决定输出格式与编码策略。",
    },
  ],
  "ffmpeg-wasm": [
    {
      name: "FFmpeg.load",
      description: "加载 wasm 核心资源，是浏览器端 FFmpeg 真正启动前的准备步骤。",
    },
    {
      name: "FFmpeg.writeFile / readFile",
      description: "在虚拟文件系统里写入输入文件、读取输出文件，构成基本处理闭环。",
    },
    {
      name: "FFmpeg.exec",
      description: "执行 FFmpeg 参数数组，是前端把命令模型真正跑起来的关键接口。",
    },
  ],
  "ffmpeg-architecture": [
    {
      name: "Worker",
      description: "前端多媒体重任务几乎离不开 Worker，用来把耗时处理从主线程搬走。",
    },
    {
      name: "File / Blob / URL.createObjectURL",
      description: "浏览器端上传、预览和导出媒体文件时最常用的一组文件对象 API。",
    },
    {
      name: "AbortController",
      description: "给长任务加取消能力时很好用，避免用户想停却只能干瞪眼。",
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
