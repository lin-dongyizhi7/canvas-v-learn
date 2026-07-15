import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

interface DemoVideoSource {
  id: string;
  title: string;
  description: string;
  src: string;
  type: string;
  badge: string;
}

interface FilterPreset {
  id: string;
  label: string;
  description: string;
  ffmpegFilter: string;
}

interface ExportPreset {
  id: string;
  label: string;
  extension: string;
  codec: string;
}

interface CapabilityItem {
  title: string;
  description: string;
  supported: boolean;
}

const clipSources: DemoVideoSource[] = [
  {
    id: "flower-mp4",
    title: "MDN Flower MP4",
    description: "适合验证裁剪预览、滤镜叠加和导出命令拼装。",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    type: "video/mp4",
    badge: "内置片源",
  },
  {
    id: "flower-webm",
    title: "MDN Flower WebM",
    description: "顺便感受不同封装在编辑链路中的兼容性差异。",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
    type: "video/webm",
    badge: "WebM 片源",
  },
];

const filterPresets: FilterPreset[] = [
  {
    id: "clean",
    label: "原片直出",
    description: "不加额外视觉处理，保持素材原味。",
    ffmpegFilter: "",
  },
  {
    id: "cinema",
    label: "电影感",
    description: "轻微提对比、提饱和，适合做演示片头。",
    ffmpegFilter: "eq=contrast=1.12:brightness=0.04:saturation=1.18",
  },
  {
    id: "noir",
    label: "黑白纪实",
    description: "做黑白风格和信息纪录片气质预览。",
    ffmpegFilter: "hue=s=0,eq=contrast=1.18:brightness=-0.02",
  },
  {
    id: "neon",
    label: "霓虹偏色",
    description: "强化色彩偏移，更接近 WebGL shader 的炫技方向。",
    ffmpegFilter: "eq=saturation=1.35:contrast=1.08,colorbalance=rs=.08:bs=.12",
  },
];

const exportPresets: ExportPreset[] = [
  {
    id: "mp4-h264",
    label: "MP4 / H.264",
    extension: "mp4",
    codec: "libx264",
  },
  {
    id: "webm-vp9",
    label: "WebM / VP9",
    extension: "webm",
    codec: "libvpx-vp9",
  },
];

const playbackRateOptions = [0.75, 1, 1.25, 1.5, 2];
const waveformSeeds = [24, 42, 30, 56, 38, 64, 26, 48, 72, 40, 58, 34, 68, 44];
const minimumClipGap = 0.2;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "00:00";
  }

  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const remainSeconds = (wholeSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainSeconds}`;
};

const buildVisualFilter = (presetId: string, intensity: number) => {
  const strength = intensity / 100;

  switch (presetId) {
    case "cinema":
      return `contrast(${1 + strength * 0.25}) saturate(${1 + strength * 0.3}) brightness(${1 + strength * 0.08})`;
    case "noir":
      return `grayscale(1) contrast(${1 + strength * 0.25}) brightness(${1 - strength * 0.06})`;
    case "neon":
      return `saturate(${1 + strength * 0.45}) hue-rotate(${strength * 36}deg) contrast(${1 + strength * 0.12})`;
    default:
      return "none";
  }
};

const buildFfmpegCommand = ({
  clipStart,
  clipDuration,
  filterPreset,
  volumeGain,
  exportPreset,
}: {
  clipStart: number;
  clipDuration: number;
  filterPreset: FilterPreset;
  volumeGain: number;
  exportPreset: ExportPreset;
}) => {
  const videoFilterPart = filterPreset.ffmpegFilter
    ? `-vf "${filterPreset.ffmpegFilter}"`
    : "";
  const audioFilterPart =
    volumeGain !== 100 ? `-af "volume=${(volumeGain / 100).toFixed(2)}"` : "";

  return [
    "ffmpeg",
    `-ss ${clipStart.toFixed(2)}`,
    `-t ${clipDuration.toFixed(2)}`,
    "-i input.mp4",
    videoFilterPart,
    audioFilterPart,
    `-c:v ${exportPreset.codec}`,
    "-preset medium",
    "-movflags +faststart",
    `output.${exportPreset.extension}`,
  ]
    .filter(Boolean)
    .join(" ");
};

export function VideoEditorDemoPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [activeSource, setActiveSource] = useState<DemoVideoSource>(clipSources[0]);
  const [localObjectUrl, setLocalObjectUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(0);
  const [volumeGain, setVolumeGain] = useState(100);
  const [filterPresetId, setFilterPresetId] = useState(filterPresets[0].id);
  const [filterIntensity, setFilterIntensity] = useState(55);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [exportPresetId, setExportPresetId] = useState(exportPresets[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [capabilities, setCapabilities] = useState<CapabilityItem[]>([]);

  useEffect(() => {
    return () => {
      if (localObjectUrl) {
        URL.revokeObjectURL(localObjectUrl);
      }
    };
  }, [localObjectUrl]);

  useEffect(() => {
    setCapabilities([
      {
        title: "WebCodecs",
        description: "检查 `VideoDecoder / VideoEncoder` 是否可用，判断逐帧处理潜力。",
        supported:
          typeof window !== "undefined" &&
          "VideoDecoder" in window &&
          "VideoEncoder" in window,
      },
      {
        title: "Web Audio",
        description: "检查 `AudioContext`，为音量增益、分析器和频谱预览打底。",
        supported:
          typeof window !== "undefined" &&
          ("AudioContext" in window || "webkitAudioContext" in window),
      },
      {
        title: "WebGL",
        description: "检查 GPU 渲染通道，给滤镜预览和 shader 效果留出位置。",
        supported:
          typeof window !== "undefined" &&
          ("WebGLRenderingContext" in window || "WebGL2RenderingContext" in window),
      },
      {
        title: "FFmpeg WASM",
        description: "检查 `WebAssembly / Worker`，判断浏览器侧转码是否有起跑资格。",
        supported:
          typeof window !== "undefined" &&
          "WebAssembly" in window &&
          "Worker" in window,
      },
    ]);
  }, []);

  useEffect(() => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    element.playbackRate = playbackRate;
    element.volume = clamp(volumeGain / 100, 0, 1);
  }, [activeSource.src, playbackRate, volumeGain]);

  const activeFilterPreset = useMemo(
    () => filterPresets.find((item) => item.id === filterPresetId) ?? filterPresets[0],
    [filterPresetId],
  );

  const activeExportPreset = useMemo(
    () => exportPresets.find((item) => item.id === exportPresetId) ?? exportPresets[0],
    [exportPresetId],
  );

  const clipDuration = useMemo(
    () => Math.max(clipEnd - clipStart, 0),
    [clipEnd, clipStart],
  );

  const visualFilter = useMemo(
    () => buildVisualFilter(filterPresetId, filterIntensity),
    [filterIntensity, filterPresetId],
  );

  const ffmpegCommand = useMemo(
    () =>
      buildFfmpegCommand({
        clipStart,
        clipDuration,
        filterPreset: activeFilterPreset,
        volumeGain,
        exportPreset: activeExportPreset,
      }),
    [activeExportPreset, activeFilterPreset, clipDuration, clipStart, volumeGain],
  );

  const timelineMarks = useMemo(() => {
    if (!duration) {
      return [];
    }

    return Array.from({ length: 6 }, (_, index) => {
      const percent = (index / 5) * 100;
      const second = duration * (index / 5);

      return {
        percent,
        label: formatTime(second),
      };
    });
  }, [duration]);

  const waveformBars = useMemo(
    () =>
      waveformSeeds.map((value, index) => {
        const gainBoost = volumeGain / 5;
        const intensityBoost = filterIntensity / 8;

        return {
          id: `${value}-${index}`,
          height: clamp(value + gainBoost + intensityBoost, 24, 92),
        };
      }),
    [filterIntensity, volumeGain],
  );

  const pipelineCards = useMemo(
    () => [
      {
        title: "WebCodecs",
        badge: "逐帧解码",
        description: `把 ${activeSource.title} 拆成原始帧，才能继续做片段裁剪、逐帧分析和封面抽帧。`,
      },
      {
        title: "Web Audio",
        badge: "音频增益",
        description: `当前把音量预览拉到 ${volumeGain}% ，真实工程里通常会接 GainNode、AnalyserNode 做增益和波形分析。`,
      },
      {
        title: "WebGL",
        badge: "滤镜预览",
        description: `${activeFilterPreset.label} 现在先用样式模拟，实际项目常把 shader 放进 GPU 做实时滤镜。`,
      },
      {
        title: "FFmpeg",
        badge: "导出编排",
        description: `把 ${formatTime(clipStart)} 到 ${formatTime(clipEnd)} 这段片段和导出格式一起编排成命令，方便后续接 WASM 或服务端转码。`,
      },
    ],
    [activeFilterPreset.label, activeSource.title, clipEnd, clipStart, volumeGain],
  );

  const handleLoadedMetadata = () => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    const nextDuration = element.duration || 0;

    setDuration(nextDuration);
    setCurrentTime(element.currentTime);
    setClipStart(0);
    setClipEnd(nextDuration);
  };

  const syncPlayback = () => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    const nextTime = element.currentTime;

    // 预览裁剪区间时，到达片尾就自动暂停，避免播放器若无其事地继续往后跑。
    if (clipEnd > clipStart && nextTime >= clipEnd) {
      element.currentTime = clipEnd;
      element.pause();
      setCurrentTime(clipEnd);
      setIsPlaying(false);
      return;
    }

    setCurrentTime(nextTime);
  };

  const togglePlay = async () => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    if (element.currentTime < clipStart || element.currentTime > clipEnd) {
      element.currentTime = clipStart;
    }

    if (element.paused) {
      await element.play();
      return;
    }

    element.pause();
  };

  const previewClip = async () => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    element.currentTime = clipStart;
    setCurrentTime(clipStart);
    await element.play();
  };

  const jumpToTime = (target: number) => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    const nextTime = clamp(target, 0, duration || 0);
    element.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleClipStartChange = (nextValue: number) => {
    const limitedStart = clamp(nextValue, 0, Math.max(duration - minimumClipGap, 0));
    const nextEnd = Math.max(clipEnd, limitedStart + minimumClipGap);

    setClipStart(limitedStart);
    setClipEnd(clamp(nextEnd, limitedStart + minimumClipGap, duration || limitedStart + minimumClipGap));
  };

  const handleClipEndChange = (nextValue: number) => {
    const limitedEnd = clamp(nextValue, clipStart + minimumClipGap, duration || nextValue);

    setClipEnd(limitedEnd);
  };

  const activatePreset = (source: DemoVideoSource) => {
    if (localObjectUrl) {
      URL.revokeObjectURL(localObjectUrl);
      setLocalObjectUrl(null);
    }

    setActiveSource(source);
    setDuration(0);
    setCurrentTime(0);
    setClipStart(0);
    setClipEnd(0);
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const nextObjectUrl = URL.createObjectURL(file);

    if (localObjectUrl) {
      URL.revokeObjectURL(localObjectUrl);
    }

    setLocalObjectUrl(nextObjectUrl);
    setActiveSource({
      id: `local-${file.name}`,
      title: file.name,
      description: "这是你上传的本地素材，最适合继续扩展真实的浏览器端剪辑链路。",
      src: nextObjectUrl,
      type: file.type || "video/mp4",
      badge: "本地素材",
    });
    setDuration(0);
    setCurrentTime(0);
    setClipStart(0);
    setClipEnd(0);
    event.currentTarget.value = "";
  };

  const clipStartPercent = duration ? (clipStart / duration) * 100 : 0;
  const clipWidthPercent = duration ? (clipDuration / duration) * 100 : 0;

  return (
    <>
      <section className="hero">
        <div>
          <p className="module-card__meta">Video Editor Demo</p>
          <h2 className="hero__title">把播放器往前推一步，做成一个有剪辑味道的实验页。</h2>
          <p className="hero__subtitle">
            这个 demo 把视频裁剪、音量预览、滤镜预览和导出命令拼装揉到了一起，同时把 WebCodecs、Web Audio、WebGL 和 FFmpeg
            在实际剪辑链路里的角色摆到台面上。它还不是专业非编，但已经很像一张靠谱的起跑线。
          </p>
        </div>

        <div className="button-row">
          <Link className="button-link" to="/">
            返回首页
          </Link>
          <Link className="button-link secondary-link" to="/demo/video-player">
            去播放器 Demo
          </Link>
          <label className="button-link secondary-link" htmlFor="video-editor-upload-input">
            上传剪辑素材
            <input
              id="video-editor-upload-input"
              type="file"
              accept="video/*"
              onChange={handleUpload}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </section>

      <section className="editor-layout">
        <article className="editor-card">
          <div className="editor-card__header">
            <div>
              <span className="module-card__meta">{activeSource.badge}</span>
              <h3>{activeSource.title}</h3>
              <p className="muted">{activeSource.description}</p>
            </div>
            <div className="editor-card__meta">
              <span>总时长 {formatTime(duration)}</span>
              <span>裁剪长度 {formatTime(clipDuration)}</span>
              <span>当前播放 {formatTime(currentTime)}</span>
            </div>
          </div>

          <video
            key={activeSource.src}
            ref={videoRef}
            className="video-player editor-preview"
            controls
            playsInline
            preload="metadata"
            style={{ filter: visualFilter }}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={syncPlayback}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          >
            <source src={activeSource.src} type={activeSource.type} />
            你的浏览器不支持这个视频标签，这下 demo 只能表演沉默艺术了。
          </video>

          <div className="trim-shell">
            <div className="trim-shell__header">
              <strong>剪辑时间线</strong>
              <span className="muted">
                {formatTime(clipStart)} - {formatTime(clipEnd)}
              </span>
            </div>

            <div className="trim-track">
              <div
                className="trim-track__range"
                style={{
                  left: `${clipStartPercent}%`,
                  width: `${clipWidthPercent}%`,
                }}
              />
              {timelineMarks.map((mark) => (
                <span
                  key={mark.label}
                  className="trim-track__tick"
                  style={{ left: `${mark.percent}%` }}
                >
                  {mark.label}
                </span>
              ))}
            </div>

            <div className="editor-slider-group">
              <label className="video-slider">
                <span>片段起点</span>
                <input
                  type="range"
                  min={0}
                  max={Math.max(duration - minimumClipGap, 0)}
                  step={0.1}
                  value={Math.min(clipStart, Math.max(duration - minimumClipGap, 0))}
                  onChange={(event) => handleClipStartChange(Number(event.target.value))}
                />
              </label>
              <label className="video-slider">
                <span>片段终点</span>
                <input
                  type="range"
                  min={Math.min(clipStart + minimumClipGap, duration || clipStart + minimumClipGap)}
                  max={duration || clipStart + minimumClipGap}
                  step={0.1}
                  value={Math.max(clipEnd, clipStart + minimumClipGap)}
                  onChange={(event) => handleClipEndChange(Number(event.target.value))}
                />
              </label>
            </div>
          </div>

          <div className="button-row">
            <button type="button" onClick={() => void togglePlay()}>
              {isPlaying ? "暂停预览" : "播放预览"}
            </button>
            <button type="button" className="secondary" onClick={() => void previewClip()}>
              从片段开头播放
            </button>
            <button type="button" className="secondary" onClick={() => jumpToTime(clipStart)}>
              跳到起点
            </button>
            <button type="button" className="secondary" onClick={() => jumpToTime(clipEnd)}>
              跳到终点
            </button>
          </div>

          <div className="control-grid">
            <section className="panel">
              <h2 className="panel__title">音频与预览控制</h2>
              <div className="editor-slider-group">
                <label className="video-slider">
                  <span>音量增益 {volumeGain}%</span>
                  <input
                    type="range"
                    min={0}
                    max={150}
                    step={1}
                    value={volumeGain}
                    onChange={(event) => setVolumeGain(Number(event.target.value))}
                  />
                </label>
                <label className="video-slider">
                  <span>滤镜强度 {filterIntensity}%</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={filterIntensity}
                    onChange={(event) => setFilterIntensity(Number(event.target.value))}
                  />
                </label>
              </div>

              <div className="tag-row">
                {playbackRateOptions.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    className={`chip-button ${playbackRate === rate ? "active" : ""}`}
                    onClick={() => setPlaybackRate(rate)}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              <div className="waveform-row" aria-hidden="true">
                {waveformBars.map((bar) => (
                  <span
                    key={bar.id}
                    className="waveform-bar"
                    style={{ height: `${bar.height}px` }}
                  />
                ))}
              </div>
              <p className="muted">
                这排波形条现在是教学可视化，用来暗示 Web Audio 分析阶段会观察音量和频谱变化。
              </p>
            </section>

            <section className="panel">
              <h2 className="panel__title">滤镜与导出策略</h2>
              <div className="preset-grid">
                {filterPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`video-source-button ${
                      preset.id === filterPresetId ? "active" : ""
                    }`}
                    onClick={() => setFilterPresetId(preset.id)}
                  >
                    <strong>{preset.label}</strong>
                    <span>{preset.description}</span>
                  </button>
                ))}
              </div>

              <div className="tag-row">
                {exportPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`chip-button ${preset.id === exportPresetId ? "active" : ""}`}
                    onClick={() => setExportPresetId(preset.id)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <pre className="command-preview">{ffmpegCommand}</pre>
            </section>
          </div>
        </article>

        <aside className="editor-sidebar">
          <section className="panel">
            <h2 className="panel__title">概念映射</h2>
            <div className="stage-grid">
              {pipelineCards.map((item) => (
                <article key={item.title} className="stage-card">
                  <span className="tag">{item.badge}</span>
                  <h3>{item.title}</h3>
                  <p className="muted">{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2 className="panel__title">浏览器能力探测</h2>
            <div className="support-grid">
              {capabilities.map((item) => (
                <article key={item.title} className="support-card">
                  <div className="support-card__header">
                    <strong>{item.title}</strong>
                    <span
                      className={`support-status ${
                        item.supported ? "supported" : "unsupported"
                      }`}
                    >
                      {item.supported ? "可用" : "待兼容"}
                    </span>
                  </div>
                  <p className="muted">{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2 className="panel__title">片源切换</h2>
            <div className="nav-list">
              {clipSources.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  className={`video-source-button ${
                    activeSource.id === source.id ? "active" : ""
                  }`}
                  onClick={() => activatePreset(source)}
                >
                  <strong>{source.title}</strong>
                  <span>{source.description}</span>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </>
  );
}
