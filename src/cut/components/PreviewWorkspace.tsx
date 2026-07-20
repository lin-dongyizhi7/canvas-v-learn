import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useCutEditor } from "../store/editorContext";
import { cutAspectRatioPresets, defaultCutTextStyle } from "../types/editor";

const previewTrackPriority = {
  video: 4,
  image: 3,
  effect: 3,
  text: 2,
  audio: 1,
} as const;

const previewAccentByType = {
  video: "#2a55e5",
  audio: "#12b76a",
  text: "#f79009",
  image: "#7a5af8",
  effect: "#ef6820",
} as const;

function formatTimelineTime(time: number) {
  return `${time.toFixed(1)}s`;
}

function hexToRgba(color: string, alpha: number) {
  const normalizedColor = color.trim().replace("#", "");
  const fullHexColor =
    normalizedColor.length === 3
      ? normalizedColor
        .split("")
        .map((channel) => `${channel}${channel}`)
        .join("")
      : normalizedColor.padEnd(6, "0").slice(0, 6);
  const redChannel = Number.parseInt(fullHexColor.slice(0, 2), 16);
  const greenChannel = Number.parseInt(fullHexColor.slice(2, 4), 16);
  const blueChannel = Number.parseInt(fullHexColor.slice(4, 6), 16);

  return `rgba(${redChannel}, ${greenChannel}, ${blueChannel}, ${alpha})`;
}

function resolvePreviewCanvasWidth(width: number, height: number) {
  if (width === height) {
    return "min(48%, 360px)";
  }

  if (width > height) {
    return width / height >= 1.7 ? "min(72%, 680px)" : "min(64%, 560px)";
  }

  return "min(34%, 260px)";
}

function resolveFittedMediaFrame(
  mediaAspectRatio: number | null,
  canvasAspectRatio: number,
): { widthPercent: number; heightPercent: number } {
  if (mediaAspectRatio === null) {
    return { widthPercent: 100, heightPercent: 100 };
  }

  if (Math.abs(mediaAspectRatio - canvasAspectRatio) <= 0.02) {
    return { widthPercent: 100, heightPercent: 100 };
  }

  // 这里显式计算素材容器尺寸：以较小那条边贴合画布，保证素材完整显示。
  if (mediaAspectRatio > canvasAspectRatio) {
    return {
      widthPercent: 100,
      heightPercent: (canvasAspectRatio / mediaAspectRatio) * 100,
    };
  }

  return {
    widthPercent: (mediaAspectRatio / canvasAspectRatio) * 100,
    heightPercent: 100,
  };
}

export function PreviewWorkspace() {
  const { state, dispatch } = useCutEditor();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLButtonElement>(null);
  const suppressPreviewClickRef = useRef(false);
  const [mediaAspectRatio, setMediaAspectRatio] = useState<number | null>(null);
  const [previewDraftTransform, setPreviewDraftTransform] = useState<{
    offsetX: number;
    offsetY: number;
    scale: number;
  } | null>(null);
  const [videoLoadState, setVideoLoadState] = useState<"idle" | "loaded" | "error">(
    "idle",
  );
  const progress = (state.currentTime / state.duration) * 100;
  const activeTimelineClips = Object.values(state.clipsById).filter(
    (clip) =>
      state.currentTime >= clip.startTime &&
      state.currentTime <= clip.startTime + clip.duration,
  );
  const activeTimelineClip = activeTimelineClips
    .sort((leftClip, rightClip) => {
      const leftTrackType = state.tracksById[leftClip.trackId]?.type ?? "audio";
      const rightTrackType = state.tracksById[rightClip.trackId]?.type ?? "audio";
      const priorityDiff =
        previewTrackPriority[rightTrackType] - previewTrackPriority[leftTrackType];

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return leftClip.startTime - rightClip.startTime;
    })[0];
  const activeAudioClip = activeTimelineClips
    .filter((clip) => state.tracksById[clip.trackId]?.type === "audio")
    .sort((leftClip, rightClip) => leftClip.startTime - rightClip.startTime)[0];
  const activeTextClip = activeTimelineClips
    .filter((clip) => state.tracksById[clip.trackId]?.type === "text")
    .sort((leftClip, rightClip) => leftClip.startTime - rightClip.startTime)[0];
  // 同一时刻多个轨道都命中时，预览区优先展示视觉片段，但音频轨会独立参与播放。
  const previewClip =
    activeTimelineClip &&
      state.tracksById[activeTimelineClip.trackId]?.type !== "audio"
      ? activeTimelineClip
      : undefined;
  const previewAsset = previewClip
    ? state.assetsById[previewClip.assetId]
    : undefined;
  const audioPreviewAsset = activeAudioClip
    ? state.assetsById[activeAudioClip.assetId]
    : undefined;
  const activeTextAsset = activeTextClip
    ? state.assetsById[activeTextClip.assetId]
    : undefined;
  const selectedClip = state.selectedClipId
    ? state.clipsById[state.selectedClipId]
    : undefined;
  const previewTrack = previewClip
    ? state.tracksById[previewClip.trackId]
    : undefined;
  const previewAccent = previewAsset
    ? previewAccentByType[previewAsset.type]
    : "#98a2b3";
  const isImageBackedVideo = Boolean(
    previewAsset?.type === "video" && previewAsset.mimeType?.startsWith("image/"),
  );
  const previewPosterSrc =
    previewAsset?.type === "video"
      ? previewAsset.poster ?? (isImageBackedVideo ? previewAsset.src : undefined)
      : previewAsset?.poster;
  const previewDisplayName =
    previewAsset?.type === "text"
      ? previewAsset.sampleText ?? previewAsset.name
      : previewAsset?.name;
  const previewSummary =
    previewAsset?.type === "text"
      ? `字体样式：${previewAsset.name}`
      : previewAsset?.summary;
  const previewAspectRatio = cutAspectRatioPresets[state.aspectRatio];
  const previewCanvasAspectRatio =
    previewAspectRatio.width / previewAspectRatio.height;
  const previewFrame = useMemo(
    () => resolveFittedMediaFrame(mediaAspectRatio, previewCanvasAspectRatio),
    [mediaAspectRatio, previewCanvasAspectRatio],
  );
  const canTransformPreview =
    Boolean(previewClip) &&
    Boolean(selectedClip) &&
    previewClip?.id === selectedClip?.id &&
    previewAsset?.type === "video";
  const previewTransform = previewClip?.transform ?? {
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  };
  const visualPlaybackRate = previewClip?.playbackRate ?? 1;
  const visualVolume = previewClip?.volume ?? 1;
  const audioPlaybackRate = activeAudioClip?.playbackRate ?? 1;
  const audioVolume = activeAudioClip?.volume ?? 1;
  const previewTextStyle = {
    ...defaultCutTextStyle,
    ...(activeTextAsset?.textStyle ?? previewAsset?.textStyle),
  };
  const previewScreenStyle = {
    "--cut-preview-accent": previewAccent,
    aspectRatio: `${previewAspectRatio.width} / ${previewAspectRatio.height}`,
    width: resolvePreviewCanvasWidth(
      previewAspectRatio.width,
      previewAspectRatio.height,
    ),
  } as CSSProperties;

  useEffect(() => {
    setVideoLoadState("idle");
    setMediaAspectRatio(null);
    setPreviewDraftTransform(null);
  }, [previewAsset?.id, previewAsset?.src]);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement || !previewClip || isImageBackedVideo || previewAsset?.type !== "video") {
      videoElement?.pause();
      return;
    }

    const clipRelativeTime = Math.min(
      Math.max(state.currentTime - previewClip.startTime, 0),
      previewClip.duration,
    );

    if (Math.abs(videoElement.currentTime - clipRelativeTime) > 0.25) {
      videoElement.currentTime = clipRelativeTime;
    }

    if (Math.abs(videoElement.playbackRate - visualPlaybackRate) > 0.01) {
      videoElement.playbackRate = visualPlaybackRate;
    }

    if (Math.abs(videoElement.volume - visualVolume) > 0.01) {
      videoElement.volume = visualVolume;
    }

    if (state.isPlaying) {
      void videoElement.play().catch(() => undefined);
      return;
    }

    videoElement.pause();
  }, [
    isImageBackedVideo,
    previewAsset?.type,
    previewClip,
    visualPlaybackRate,
    visualVolume,
    state.currentTime,
    state.isPlaying,
  ]);

  useEffect(() => {
    const audioElement = audioRef.current;

    if (!audioElement || !activeAudioClip || !audioPreviewAsset?.src) {
      audioElement?.pause();
      return;
    }

    const clipRelativeTime = Math.min(
      Math.max(state.currentTime - activeAudioClip.startTime, 0),
      activeAudioClip.duration,
    );

    if (Math.abs(audioElement.currentTime - clipRelativeTime) > 0.25) {
      audioElement.currentTime = clipRelativeTime;
    }

    if (Math.abs(audioElement.playbackRate - audioPlaybackRate) > 0.01) {
      audioElement.playbackRate = audioPlaybackRate;
    }

    if (Math.abs(audioElement.volume - audioVolume) > 0.01) {
      audioElement.volume = audioVolume;
    }

    if (state.isPlaying) {
      void audioElement.play().catch(() => undefined);
      return;
    }

    audioElement.pause();
  }, [
    activeAudioClip,
    audioPreviewAsset?.src,
    audioPlaybackRate,
    audioVolume,
    state.currentTime,
    state.isPlaying,
  ]);

  const handleProgressClick = (event: MouseEvent<HTMLButtonElement>) => {
    const progressRect = progressRef.current?.getBoundingClientRect();

    if (!progressRect?.width) {
      return;
    }

    const nextProgress = Math.min(
      Math.max((event.clientX - progressRect.left) / progressRect.width, 0),
      1,
    );

    dispatch({
      type: "seek",
      payload: { time: nextProgress * state.duration },
    });
  };
  const handlePreviewPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!previewClip || !canTransformPreview) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    suppressPreviewClickRef.current = true;
    const startX = event.clientX;
    const startY = event.clientY;
    const initialTransform = previewClip.transform;
    let nextOffsetX = initialTransform.offsetX;
    let nextOffsetY = initialTransform.offsetY;
    setPreviewDraftTransform(initialTransform);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      nextOffsetX = Number((initialTransform.offsetX + deltaX / 4).toFixed(1));
      nextOffsetY = Number((initialTransform.offsetY + deltaY / 4).toFixed(1));
      setPreviewDraftTransform({
        ...initialTransform,
        offsetX: nextOffsetX,
        offsetY: nextOffsetY,
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      setPreviewDraftTransform(null);
      dispatch({
        type: "updateClipTransform",
        payload: {
          clipId: previewClip.id,
          transform: {
            offsetX: nextOffsetX,
            offsetY: nextOffsetY,
          },
        },
      });
      requestAnimationFrame(() => {
        suppressPreviewClickRef.current = false;
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };
  const handleResizePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!previewClip || !canTransformPreview) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const initialScale = previewClip.transform.scale;
    let nextScale = initialScale;
    setPreviewDraftTransform(previewClip.transform);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      nextScale = Number(Math.min(Math.max(initialScale + deltaX / 200, 0.2), 4).toFixed(2));
      setPreviewDraftTransform({
        ...previewClip.transform,
        scale: nextScale,
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      setPreviewDraftTransform(null);
      dispatch({
        type: "updateClipTransform",
        payload: {
          clipId: previewClip.id,
          transform: {
            scale: nextScale,
          },
        },
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };
  const handlePreviewClick = () => {
    if (!previewClip || suppressPreviewClickRef.current) {
      return;
    }

    dispatch({
      type: "selectClip",
      payload: { clipId: previewClip.id },
    });
  };
  const activePreviewTransform = previewDraftTransform ?? previewTransform;
  const previewMediaFrameStyle = previewClip
    ? ({
      width: `${previewFrame.widthPercent}%`,
      height: `${previewFrame.heightPercent}%`,
      transform: `translate(${activePreviewTransform.offsetX}px, ${activePreviewTransform.offsetY}px) scale(${activePreviewTransform.scale})`,
    } as CSSProperties)
    : undefined;

  return (
    <section className="cut-panel cut-preview-panel">
      <div className="cut-panel__header">
        <div>
          <p className="cut-panel__eyebrow">预览区</p>
        </div>
        <div className="cut-preview-panel__badge">
          <span>{state.isPlaying ? "播放中" : "待机中"}</span>
          <strong>{state.aspectRatio}</strong>
        </div>
      </div>

      <div className="cut-preview-stage">
        <div
          className="cut-preview-stage__screen"
          style={previewScreenStyle}
        >
          {previewAsset?.type === "video" && previewAsset.src ? (
            <div
              className={`cut-preview-stage__media-frame ${canTransformPreview ? "cut-preview-stage__media-frame--interactive" : ""}`}
              style={previewMediaFrameStyle}
              onPointerDown={handlePreviewPointerDown}
              onClick={handlePreviewClick}
            >
              <div className="cut-preview-stage__media-shell">
                {previewAsset?.type === "video" &&
                  previewPosterSrc &&
                  !isImageBackedVideo &&
                  videoLoadState !== "loaded" ? (
                  <img
                    className="cut-preview-stage__media cut-preview-stage__media--poster"
                    src={previewPosterSrc}
                    alt={previewAsset.name}
                  />
                ) : null}

                {isImageBackedVideo ? (
                  <img
                    className="cut-preview-stage__media"
                    src={previewAsset.src}
                    alt={previewAsset.name}
                    onLoad={(event) => {
                      const { naturalWidth, naturalHeight } = event.currentTarget;

                      if (!naturalWidth || !naturalHeight) {
                        return;
                      }

                      setMediaAspectRatio(naturalWidth / naturalHeight);
                    }}
                  />
                ) : (
                  <video
                    ref={videoRef}
                    className={`cut-preview-stage__media ${videoLoadState === "loaded" ? "cut-preview-stage__media--ready" : "cut-preview-stage__media--hidden"}`}
                    src={previewAsset.src}
                    poster={previewAsset.poster}
                    playsInline
                    preload="auto"
                    onLoadedMetadata={(event) => {
                      const { videoWidth, videoHeight } = event.currentTarget;

                      if (!videoWidth || !videoHeight) {
                        return;
                      }

                      setMediaAspectRatio(videoWidth / videoHeight);
                    }}
                    onLoadedData={() => setVideoLoadState("loaded")}
                    onError={() => setVideoLoadState("error")}
                  />
                )}
              </div>

              {canTransformPreview ? (
                <button
                  type="button"
                  className="cut-preview-stage__resize-handle"
                  aria-label="缩放当前素材"
                  onPointerDown={handleResizePointerDown}
                />
              ) : null}
            </div>
          ) : null}

          {audioPreviewAsset?.src ? (
            <audio ref={audioRef} src={audioPreviewAsset.src} preload="auto" />
          ) : null}

          {(previewAsset?.type === "audio" || !previewAsset) && audioPreviewAsset?.src ? (
            <div className="cut-preview-stage__audio">
              <div className="cut-preview-stage__guides">
                <span>{activeAudioClip ? state.tracksById[activeAudioClip.trackId]?.name : "音频预览"}</span>
                <strong>{audioPreviewAsset.name}</strong>
                <p className="cut-preview-stage__summary">{audioPreviewAsset.summary}</p>
              </div>
            </div>
          ) : null}

          {activeTextAsset && previewAsset?.type !== "text" ? (
            <div
              className={`cut-preview-stage__guides cut-preview-stage__guides--overlay cut-preview-stage__guides--${previewTextStyle.position} ${previewTextStyle.hasBackground ? "cut-preview-stage__guides--highlight" : ""}`}
              style={
                {
                  color: previewTextStyle.color,
                  "--cut-preview-text-size": `${previewTextStyle.fontSize}px`,
                  "--cut-preview-text-weight": previewTextStyle.fontWeight,
                  "--cut-preview-text-letter-spacing": `${previewTextStyle.letterSpacing}px`,
                  "--cut-preview-text-background-opacity": previewTextStyle.backgroundOpacity,
                  "--cut-preview-text-background-color": hexToRgba(
                    previewTextStyle.backgroundColor,
                    previewTextStyle.backgroundOpacity,
                  ),
                  "--cut-preview-text-stroke-color": previewTextStyle.strokeColor,
                  "--cut-preview-text-stroke-width": `${previewTextStyle.strokeWidth}px`,
                } as CSSProperties
              }
            >
              <span>{state.tracksById[activeTextClip?.trackId ?? ""]?.name ?? "文字轨道"}</span>
              <strong style={{ color: previewTextStyle.color }}>
                {activeTextAsset.sampleText ?? activeTextAsset.name}
              </strong>
            </div>
          ) : null}

          {!previewAsset || previewAsset.type === "text" || !previewAsset.src ? (
            <div
              className={`cut-preview-stage__guides ${previewAsset?.type === "text" ? `cut-preview-stage__guides--${previewTextStyle.position}` : ""} ${previewAsset?.type === "text" && previewTextStyle.hasBackground ? "cut-preview-stage__guides--highlight" : ""}`}
              style={
                previewAsset?.type === "text"
                  ? ({
                    color: previewTextStyle.color,
                    "--cut-preview-text-size": `${previewTextStyle.fontSize}px`,
                    "--cut-preview-text-weight": previewTextStyle.fontWeight,
                    "--cut-preview-text-letter-spacing": `${previewTextStyle.letterSpacing}px`,
                    "--cut-preview-text-background-opacity": previewTextStyle.backgroundOpacity,
                    "--cut-preview-text-background-color": hexToRgba(
                      previewTextStyle.backgroundColor,
                      previewTextStyle.backgroundOpacity,
                    ),
                    "--cut-preview-text-stroke-color": previewTextStyle.strokeColor,
                    "--cut-preview-text-stroke-width": `${previewTextStyle.strokeWidth}px`,
                  } as CSSProperties)
                  : undefined
              }
            >
              <span>{previewTrack ? previewTrack.name : "预览画布"}</span>
              <strong style={previewAsset?.type === "text" ? { color: previewTextStyle.color } : undefined}>
                {previewAsset ? previewDisplayName : `${state.aspectRatio} 画布`}
              </strong>
              <p className="cut-preview-stage__summary">
                {previewAsset
                  ? previewSummary
                  : "当前还没有命中片段，等你把游标挪进片段区，这里就会切换成对应素材预览。"}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="cut-preview-meta">
        <div className="cut-preview-meta__item">
          <span>当前片段</span>
          <strong>{previewAsset ? previewAsset.type : audioPreviewAsset ? "audio" : "empty"}</strong>
        </div>
        <div className="cut-preview-meta__item">
          <span>片段区间</span>
          <strong>
            {previewClip
              ? `${formatTimelineTime(previewClip.startTime)} - ${formatTimelineTime(
                previewClip.startTime + previewClip.duration,
              )}`
              : "--"}
          </strong>
        </div>
      </div>

      <div className="cut-preview-controls">
        <button
          type="button"
          className="cut-button cut-button--ghost"
          onClick={() => dispatch({ type: "seek", payload: { time: 0 } })}
        >
          回到开头
        </button>
        <button
          type="button"
          className="cut-button"
          onClick={() => dispatch({ type: "togglePlayback" })}
        >
          {state.isPlaying ? "暂停" : "播放"}
        </button>
        <div className="cut-time-chip">
          {state.currentTime.toFixed(1)}s / {state.duration.toFixed(1)}s
        </div>
      </div>

      <button
        ref={progressRef}
        type="button"
        className="cut-progress"
        aria-label="跳转到时间轴预览位置"
        onClick={handleProgressClick}
      >
        <div className="cut-progress__bar" style={{ width: `${progress}%` }} />
      </button>
    </section>
  );
}
