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

const presetVideoSources: DemoVideoSource[] = [
  {
    id: "flower-mp4",
    title: "MDN Flower MP4",
    description: "适合先验证基础播放、拖拽进度和音量控制是否正常。",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    type: "video/mp4",
    badge: "MP4 示例",
  },
  {
    id: "flower-webm",
    title: "MDN Flower WebM",
    description: "用来感受浏览器对不同封装格式的兼容行为。",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
    type: "video/webm",
    badge: "WebM 示例",
  },
];

const clampTime = (value: number, duration: number) =>
  Math.min(Math.max(value, 0), duration || 0);

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const remainSeconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainSeconds}`;
};

export function VideoPlayerDemoPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [activeSource, setActiveSource] = useState<DemoVideoSource>(
    presetVideoSources[0],
  );
  const [localObjectUrl, setLocalObjectUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // 本地上传走的是 object URL，组件切换或卸载时要回收，避免浏览器内存被白嫖。
    return () => {
      if (localObjectUrl) {
        URL.revokeObjectURL(localObjectUrl);
      }
    };
  }, [localObjectUrl]);

  useEffect(() => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    // 切源后 video DOM 会重建，这里把播放器状态重新压回去，避免 UI 和真实播放状态各说各话。
    element.volume = volume;
    element.muted = isMuted;
    element.loop = isLooping;
  }, [activeSource.src, isLooping, isMuted, volume]);

  const progressPercent = useMemo(() => {
    if (!duration) {
      return 0;
    }

    return Math.round((currentTime / duration) * 100);
  }, [currentTime, duration]);

  const syncTimeState = () => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    setCurrentTime(element.currentTime);
    setDuration(element.duration || 0);
  };

  const togglePlay = async () => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    if (element.paused) {
      await element.play();
      return;
    }

    element.pause();
  };

  const changePlaybackTime = (delta: number) => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    // 进度跳转统一收口，避免拖过头后时间出现奇怪抖动。
    element.currentTime = clampTime(element.currentTime + delta, element.duration);
    syncTimeState();
  };

  const handleProgressChange = (value: number) => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    element.currentTime = clampTime(value, element.duration);
    syncTimeState();
  };

  const handleVolumeChange = (value: number) => {
    const element = videoRef.current;

    setVolume(value);

    if (!element) {
      return;
    }

    element.volume = value;
    const nextMuted = value === 0;
    element.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const toggleMuted = () => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    const nextMuted = !element.muted;
    element.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const toggleLooping = () => {
    const element = videoRef.current;
    const nextLooping = !isLooping;

    setIsLooping(nextLooping);

    if (!element) {
      return;
    }

    element.loop = nextLooping;
  };

  const requestFullscreen = async () => {
    const element = videoRef.current;

    if (!element?.requestFullscreen) {
      return;
    }

    await element.requestFullscreen();
  };

  const activatePreset = (source: DemoVideoSource) => {
    if (localObjectUrl) {
      URL.revokeObjectURL(localObjectUrl);
      setLocalObjectUrl(null);
    }

    setActiveSource(source);
    setCurrentTime(0);
    setDuration(0);
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
      description: "这是你刚刚上传的本地视频，浏览器原生播放器已经接管它了。",
      src: nextObjectUrl,
      type: file.type || "video/mp4",
      badge: "本地文件",
    });
    setCurrentTime(0);
    setDuration(0);
    event.currentTarget.value = "";
  };

  return (
    <>
      <section className="hero">
        <div>
          <p className="module-card__meta">Video Player Demo</p>
          <h2 className="hero__title">一个能直接跳转过来的视频播放器实验页。</h2>
          <p className="hero__subtitle">
            这里先给你搭了一个足够顺手的播放器 demo：支持示例片源切换、本地上传、播放控制、进度拖动、静音、循环和全屏。
            它不花里胡哨，但已经足够拿来继续加弹幕、倍速、截图和自定义控制条了。
          </p>
        </div>

        <div className="button-row">
          <Link className="button-link" to="/">
            返回首页
          </Link>
          <Link className="button-link secondary-link" to="/demo/video-editor">
            去剪辑 Demo
          </Link>
          <a
            className="button-link secondary-link"
            href={activeSource.src}
            target="_blank"
            rel="noreferrer"
          >
            单独打开视频源
          </a>
          <label className="button-link secondary-link" htmlFor="video-upload-input">
            上传本地视频
            <input
              id="video-upload-input"
              type="file"
              accept="video/*"
              onChange={handleUpload}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </section>

      <section className="video-demo-layout">
        <article className="video-player-card">
          <div className="video-player-card__header">
            <div>
              <span className="module-card__meta">{activeSource.badge}</span>
              <h3>{activeSource.title}</h3>
              <p className="muted">{activeSource.description}</p>
            </div>
            <div className="video-player-card__meta">
              <span>进度 {progressPercent}%</span>
              <span>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>

          <video
            key={activeSource.src}
            ref={videoRef}
            className="video-player"
            controls
            playsInline
            preload="metadata"
            onLoadedMetadata={syncTimeState}
            onTimeUpdate={syncTimeState}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          >
            <source src={activeSource.src} type={activeSource.type} />
            你的浏览器暂时不支持这个视频标签，多少有点不给面子了。
          </video>

          <div className="video-control-panel">
            <div className="button-row">
              <button type="button" onClick={() => void togglePlay()}>
                {isPlaying ? "暂停" : "播放"}
              </button>
              <button type="button" className="secondary" onClick={() => changePlaybackTime(-10)}>
                后退 10 秒
              </button>
              <button type="button" className="secondary" onClick={() => changePlaybackTime(10)}>
                前进 10 秒
              </button>
              <button type="button" className="secondary" onClick={toggleMuted}>
                {isMuted ? "取消静音" : "静音"}
              </button>
              <button type="button" className="secondary" onClick={toggleLooping}>
                {isLooping ? "取消循环" : "开启循环"}
              </button>
              <button type="button" className="secondary" onClick={() => void requestFullscreen()}>
                全屏播放
              </button>
            </div>

            <div className="video-slider-group">
              <label className="video-slider">
                <span>播放进度</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={Math.min(currentTime, duration || 0)}
                  onChange={(event) => handleProgressChange(Number(event.target.value))}
                />
              </label>

              <label className="video-slider video-slider--compact">
                <span>音量 {Math.round(volume * 100)}%</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(event) => handleVolumeChange(Number(event.target.value))}
                />
              </label>
            </div>
          </div>
        </article>

        <aside className="video-side-panel">
          <section className="panel">
            <h2 className="panel__title">预置片源</h2>
            <div className="nav-list">
              {presetVideoSources.map((source) => (
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

          <section className="panel">
            <h2 className="panel__title">这个 demo 现在能干嘛</h2>
            <ul>
              <li>演示浏览器原生 `video` 标签与 React 状态同步。</li>
              <li>展示本地上传视频的 object URL 接入方式。</li>
              <li>提供一个继续扩展 HLS、弹幕、截图和倍速的落脚点。</li>
            </ul>
          </section>
        </aside>
      </section>
    </>
  );
}
