import { useEffect, useMemo, useRef, useState } from "react";
import type { ExperimentLabConfig } from "../data/modules";

interface ExperimentLabProps {
  config: ExperimentLabConfig;
}

function formatBytes(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export function ExperimentLab({ config }: ExperimentLabProps) {
  const [file, setFile] = useState<File | null>(null);
  const [logLines, setLogLines] = useState<string[]>([
    "等待上传文件，实验台还很安静。",
  ]);
  const [objectUrl, setObjectUrl] = useState<string>("");
  const [audioReady, setAudioReady] = useState(false);
  const [ffmpegCommand, setFfmpegCommand] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number>(0);
  const objectUrlRef = useRef("");
  const webglCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioContextRef.current?.close().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    if (config.kind !== "webgl" || !objectUrl || !webglCanvasRef.current) {
      return;
    }

    const canvas = webglCanvasRef.current;
    const gl = canvas.getContext("webgl");
    if (!gl) {
      setLogLines((prev) => [...prev, "当前环境不支持 WebGL，无法做纹理实验。"]);
      return;
    }

    const vertexSource = `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentSource = `
      precision mediump float;
      varying vec2 vUv;
      uniform sampler2D textureSampler;
      void main() {
        gl_FragColor = texture2D(textureSampler, vUv);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) {
        return null;
      }
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) {
      setLogLines((prev) => [...prev, "WebGL Shader 创建失败。"]);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      setLogLines((prev) => [...prev, "WebGL Program 创建失败。"]);
      return;
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const vertices = new Float32Array([
      -1, 1, 0, 1,
      -1, -1, 0, 0,
      1, 1, 1, 1,
      1, -1, 1, 0,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "position");
    const uvLocation = gl.getAttribLocation(program, "uv");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(uvLocation);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 16, 8);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const image = new Image();
    image.onload = () => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.02, 0.05, 0.09, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      setLogLines((prev) => [...prev, "图片纹理已上传到 WebGL 并完成绘制。"]);
    };
    image.src = objectUrl;
  }, [config.kind, objectUrl]);

  const fileMeta = useMemo(() => {
    if (!file) {
      return [];
    }
    return [
      `文件名：${file.name}`,
      `类型：${file.type || "未知"}`,
      `大小：${formatBytes(file.size)}`,
      `最近修改：${new Date(file.lastModified).toLocaleString()}`,
    ];
  }, [file]);

  const updateLog = (lines: string[]) => {
    setLogLines(lines);
  };

  const setupAudioVisualizer = async (nextUrl: string) => {
    if (!audioRef.current || !audioCanvasRef.current) {
      return;
    }

    const AudioContextRef = window.AudioContext || (window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    }).webkitAudioContext;

    if (!AudioContextRef) {
      updateLog(["当前浏览器不支持 AudioContext。"]);
      return;
    }

    const context = audioContextRef.current ?? new AudioContextRef();
    audioContextRef.current = context;

    if (!audioSourceRef.current) {
      audioSourceRef.current = context.createMediaElementSource(audioRef.current);
    }
    if (!analyserRef.current) {
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      audioSourceRef.current.connect(analyser);
      analyser.connect(context.destination);
      analyserRef.current = analyser;
    }
    const analyser = analyserRef.current;
    setAudioReady(true);

    const canvas = audioCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const data = new Uint8Array(analyser.frequencyBinCount);
    const draw = () => {
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#081120";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / data.length;
      data.forEach((value, index) => {
        const height = (value / 255) * canvas.height;
        ctx.fillStyle = "#2A55E5";
        ctx.fillRect(index * barWidth, canvas.height - height, Math.max(1, barWidth - 1), height);
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    audioRef.current.src = nextUrl;
    draw();
  };

  const handleFileChange = async (nextFile: File | null) => {
    if (!nextFile) {
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const nextUrl = URL.createObjectURL(nextFile);
    objectUrlRef.current = nextUrl;
    setFile(nextFile);
    setObjectUrl(nextUrl);

    const baseLines = [
      `已加载文件：${nextFile.name}`,
      `MIME：${nextFile.type || "未知"}`,
      `大小：${formatBytes(nextFile.size)}`,
    ];

    if (config.kind === "webcodecs") {
      const supportState = "VideoEncoder" in window ? "支持 VideoEncoder" : "当前浏览器不支持 VideoEncoder";
      updateLog([...baseLines, supportState, "下一步你可以结合 VideoFrame 和解码链路继续扩展。"]);
      return;
    }

    if (config.kind === "webaudio") {
      updateLog([...baseLines, "音频文件已准备好，可以点击播放按钮开始频谱分析。"]);
      await setupAudioVisualizer(nextUrl);
      return;
    }

    if (config.kind === "webgl") {
      updateLog([...baseLines, "图片已准备作为纹理资源上传到 WebGL。"]);
      return;
    }

    if (config.kind === "ffmpeg") {
      const inputName = nextFile.name.replace(/\s+/g, "_");
      const command = nextFile.type.startsWith("video/")
        ? `ffmpeg -i ${inputName} -vn -acodec libmp3lame output.mp3`
        : nextFile.type.startsWith("audio/")
          ? `ffmpeg -i ${inputName} -filter:a "volume=1.5" boosted-output.mp3`
          : `ffmpeg -i ${inputName} -vf scale=1280:-1 resized-output.png`;

      setFfmpegCommand(command);
      updateLog([
        ...baseLines,
        "已根据文件类型生成一个常见任务命令草稿。",
        "你可以继续把这条命令接到 ffmpeg.wasm 执行链路里。",
      ]);
    }
  };

  const handleAudioStart = async () => {
    if (!audioContextRef.current || !audioRef.current) {
      return;
    }
    await audioContextRef.current.resume();
    await audioRef.current.play();
    setLogLines((prev) => [...prev, "音频开始播放，频谱分析正在进行。"]);
  };

  return (
    <section className="panel" style={{ marginTop: 24 }}>
      <h2 className="panel__title">{config.title}</h2>
      <p className="muted">{config.description}</p>

      <div className="upload-shell">
        <label className="upload-input">
          <span>选择文件</span>
          <input
            type="file"
            accept={config.accept}
            onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
          />
        </label>

        <div className="tag-row">
          {config.hints.map((hint) => (
            <span key={hint} className="tag">
              {hint}
            </span>
          ))}
        </div>
      </div>

      {fileMeta.length ? (
        <div className="resource-list">
          {fileMeta.map((item) => (
            <div key={item} className="resource-card upload-meta-card">
              {item}
            </div>
          ))}
        </div>
      ) : null}

      {config.kind === "webaudio" ? (
        <div className="lab-stack">
          <div className="button-row">
            <button onClick={handleAudioStart} disabled={!audioReady}>
              播放并分析
            </button>
            <button
              className="secondary"
              onClick={() => {
                audioRef.current?.pause();
                setLogLines((prev) => [...prev, "音频已暂停。"]);
              }}
            >
              暂停
            </button>
          </div>
          <audio ref={audioRef} controls className="native-media" />
          <canvas
            ref={audioCanvasRef}
            className="preview-frame"
            width={640}
            height={180}
          />
        </div>
      ) : null}

      {config.kind === "webcodecs" && objectUrl ? (
        <video className="native-media" src={objectUrl} controls />
      ) : null}

      {config.kind === "webgl" ? (
        <canvas
          ref={webglCanvasRef}
          className="preview-frame"
          width={640}
          height={320}
        />
      ) : null}

      {config.kind === "ffmpeg" && ffmpegCommand ? (
        <div className="panel" style={{ marginTop: 16 }}>
          <strong>命令草稿</strong>
          <pre className="command-preview">{ffmpegCommand}</pre>
        </div>
      ) : null}

      <div className="panel" style={{ marginTop: 16 }}>
        <strong>实验日志</strong>
        <ul>
          {logLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
