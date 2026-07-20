import type {
  CutAsset,
  CutAspectRatioPresetKey,
  CutEditorAction,
  CutEditorHistorySnapshot,
  CutEditorState,
  TimelineClip,
  TimelineClipClipboard,
} from "../types/editor";
import { defaultCutTextStyle } from "../types/editor";

const trackTypeMap = {
  video: "video-track-1",
  image: "video-track-1",
  audio: "audio-track-1",
  text: "text-track-1",
  effect: "video-track-1",
} as const;
const HISTORY_LIMIT = 30;
const IMAGE_VIDEO_DURATION = 3;
const INSERT_SNAP_THRESHOLD = 0.5;
const DEFAULT_CLIP_TRANSFORM = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
} as const;
const DEFAULT_CLIP_PLAYBACK_RATE = 1;
const DEFAULT_CLIP_VOLUME = 1;
const MIN_SPLIT_CLIP_DURATION = 0.5;

function createTimelineClipId(assetId: string) {
  return `clip-${assetId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function roundTimelineTime(time: number) {
  return Number(time.toFixed(1));
}

function resolveClipStartTime(
  targetTime: number,
  targetTrackClipIds: string[],
  clipsById: Record<string, TimelineClip>,
  excludedClipId?: string,
) {
  const clippedTrackIds = excludedClipId
    ? targetTrackClipIds.filter((clipId) => clipId !== excludedClipId)
    : targetTrackClipIds;
  const snappedStartTime = getSnappedInsertTime(
    targetTime,
    clippedTrackIds,
    clipsById,
  );

  return roundTimelineTime(Math.max(snappedStartTime, 0));
}

function createAssetPoster(title: string, accentColor: string) {
  // 用内联 SVG 生成稳定封面，避免外链图片失效导致素材列表空白。
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720">
      <defs>
        <linearGradient id="card" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="${accentColor}" />
        </linearGradient>
      </defs>
      <rect width="1280" height="720" rx="48" fill="url(#card)" />
      <circle cx="172" cy="144" r="52" fill="rgba(255,255,255,0.12)" />
      <circle cx="1112" cy="548" r="116" fill="rgba(255,255,255,0.08)" />
      <text x="84" y="520" fill="#ffffff" font-size="92" font-weight="700" font-family="Arial, PingFang SC, sans-serif">
        ${title}
      </text>
      <text x="88" y="600" fill="rgba(255,255,255,0.76)" font-size="34" font-family="Arial, PingFang SC, sans-serif">
        Cartoon Animation Clip
      </text>
    </svg>
  `)}`;
}

function toHistorySnapshot(state: CutEditorState): CutEditorHistorySnapshot {
  const { history, clipClipboard, ...snapshot } = state;
  return snapshot;
}

function commitHistory(
  previousState: CutEditorState,
  nextSnapshot: CutEditorHistorySnapshot,
  options?: {
    clipClipboard?: CutEditorState["clipClipboard"];
  },
): CutEditorState {
  return {
    ...nextSnapshot,
    clipClipboard:
      options?.clipClipboard ?? previousState.clipClipboard,
    history: {
      undoStack: [
        ...previousState.history.undoStack.slice(1 - HISTORY_LIMIT),
        toHistorySnapshot(previousState),
      ],
      redoStack: [],
    },
  };
}

function restoreFromHistory(
  snapshot: CutEditorHistorySnapshot,
  history: CutEditorState["history"],
  clipClipboard: CutEditorState["clipClipboard"],
): CutEditorState {
  return {
    ...snapshot,
    clipClipboard,
    history,
  };
}

function createClipClipboard(clip: TimelineClip): TimelineClipClipboard {
  return {
    assetId: clip.assetId,
    trackId: clip.trackId,
    duration: clip.duration,
    transform: { ...clip.transform },
    playbackRate: clip.playbackRate,
    volume: clip.volume,
  };
}

function cloneClipSettings(clip: TimelineClip) {
  return {
    transform: { ...clip.transform },
    playbackRate: clip.playbackRate,
    volume: clip.volume,
  };
}

function isImageAsset(asset: CutAsset) {
  return asset.type === "image" || asset.mimeType?.startsWith("image/");
}

function normalizeImportedAsset(asset: CutAsset): CutAsset {
  if (!isImageAsset(asset)) {
    return asset;
  }

  return {
    ...asset,
    type: "video",
    duration: IMAGE_VIDEO_DURATION,
    summary: asset.summary.includes("3 秒")
      ? asset.summary
      : `${asset.summary} 已按 3 秒静帧视频处理。`,
  };
}

function getExpandedProjectDuration(clipsById: Record<string, TimelineClip>) {
  const maxClipEndTime = Object.values(clipsById).reduce((maxTime, clip) => {
    return Math.max(maxTime, clip.startTime + clip.duration);
  }, 0);

  return Math.max(maxClipEndTime + 5, 10);
}

function getSnappedInsertTime(
  targetTime: number,
  targetTrackClipIds: string[],
  clipsById: Record<string, TimelineClip>,
) {
  const snapCandidates = targetTrackClipIds.flatMap((clipId) => {
    const clip = clipsById[clipId];

    if (!clip) {
      return [];
    }

    return [clip.startTime, clip.startTime + clip.duration];
  });

  const nearestCandidate = snapCandidates.reduce<{
    time?: number;
    distance: number;
  }>(
    (nearest, candidateTime) => {
      const candidateDistance = Math.abs(targetTime - candidateTime);

      if (
        candidateDistance > INSERT_SNAP_THRESHOLD ||
        candidateDistance >= nearest.distance
      ) {
        return nearest;
      }

      return {
        time: candidateTime,
        distance: candidateDistance,
      };
    },
    {
      time: undefined,
      distance: Number.POSITIVE_INFINITY,
    },
  );

  return nearestCandidate.time ?? targetTime;
}

function resolveNextGapStartTime(
  targetTime: number,
  clipDuration: number,
  targetTrackClipIds: string[],
  clipsById: Record<string, TimelineClip>,
) {
  const sortedTrackClips = targetTrackClipIds
    .map((clipId) => clipsById[clipId])
    .filter((clip): clip is TimelineClip => Boolean(clip))
    .sort((leftClip, rightClip) => leftClip.startTime - rightClip.startTime);
  let nextStartTime = roundTimelineTime(Math.max(targetTime, 0));

  for (const clip of sortedTrackClips) {
    if (nextStartTime + clipDuration <= clip.startTime) {
      break;
    }

    if (nextStartTime < clip.startTime + clip.duration) {
      // 找“下一个空位”时只向后推进，避免粘贴结果又吸回到当前重叠区域里。
      nextStartTime = roundTimelineTime(clip.startTime + clip.duration);
    }
  }

  return nextStartTime;
}

export const initialCutEditorState: CutEditorState = {
  projectName: "夏日海风 Vlog",
  aspectRatio: "16:9",
  currentTime: 0,
  duration: 60,
  isPlaying: false,
  selectedAssetId: "asset-video-bunny",
  selectedClipId: undefined,
  assetIds: [
    "asset-video-bunny",
    "asset-video-elephant",
    "asset-video-blazes",
    "asset-image-sunrise",
    "asset-image-city-night",
    "asset-image-workspace",
    "asset-image-mountain-road",
    "asset-audio-theme",
    "asset-audio-city-pop",
    "asset-audio-sunset-drive",
    "asset-audio-rhythm-loop",
    "asset-text-title",
  ],
  assetsById: {
    "asset-video-bunny": {
      id: "asset-video-bunny",
      name: "大兔子森林片段",
      type: "video",
      duration: 10,
      summary: "Big Buck Bunny 的明亮森林片段，适合做轻松开场或童话感转场。",
      src: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4",
      poster: createAssetPoster("BIG BUCK BUNNY", "#2a55e5"),
    },
    "asset-video-elephant": {
      id: "asset-video-elephant",
      name: "Sintel 预告片段",
      type: "video",
      duration: 52,
      summary: "Sintel 的动画预告片段，画面更偏奇幻冒险，适合中段叙事推进。",
      src: "https://docs.evostream.com/sample_content/assets/sintel1m720p.mp4",
      poster: createAssetPoster("SINTEL", "#7a5af8"),
    },
    "asset-video-blazes": {
      id: "asset-video-blazes",
      name: "大兔子预告片",
      type: "video",
      duration: 33,
      summary: "Big Buck Bunny 的短预告片，节奏更紧凑，适合做动画感更强的过渡段落。",
      src: "https://docs.evostream.com/sample_content/assets/bun33s.mp4",
      poster: createAssetPoster("BUNNY TRAILER", "#12b76a"),
    },
    "asset-image-sunrise": {
      id: "asset-image-sunrise",
      name: "海崖日出静帧",
      type: "image",
      duration: 3,
      summary: "适合做片头封面或留白过渡，插入时间轴后按 3 秒静帧视频处理。",
      src: "https://picsum.photos/id/1016/1280/720",
      mimeType: "image/png",
    },
    "asset-image-city-night": {
      id: "asset-image-city-night",
      name: "雨夜城市街景",
      type: "image",
      duration: 3,
      summary: "氛围感很足，适合做夜景转场或字幕背景。",
      src: "https://picsum.photos/id/1025/1280/720",
      mimeType: "image/png",
    },
    "asset-image-workspace": {
      id: "asset-image-workspace",
      name: "桌面工作区产品图",
      type: "image",
      duration: 3,
      summary: "适合科技感口播、产品介绍或 B-roll 垫图。",
      src: "https://picsum.photos/id/1035/1280/720",
      mimeType: "image/png",
    },
    "asset-image-mountain-road": {
      id: "asset-image-mountain-road",
      name: "山路俯拍静帧",
      type: "image",
      duration: 3,
      summary: "适合旅行类素材补镜头，也适合接在快节奏视频后缓一口气。",
      src: "https://picsum.photos/id/1043/1280/720",
      mimeType: "image/png",
    },
    "asset-audio-theme": {
      id: "asset-audio-theme",
      name: "晚风告白",
      type: "audio",
      duration: 30,
      summary: "偏温柔舒展的中文流行氛围，适合日常记录、轻松开场和慢节奏 vlog。",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    },
    "asset-audio-city-pop": {
      id: "asset-audio-city-pop",
      name: "霓虹未眠",
      type: "audio",
      duration: 36,
      summary: "更偏都市感的中文电子流行，适合夜景、卡点和偏快节奏的转场段落。",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    },
    "asset-audio-sunset-drive": {
      id: "asset-audio-sunset-drive",
      name: "沿海公路",
      type: "audio",
      duration: 34,
      summary: "更适合旅行、公路和追拍镜头，情绪起伏会比普通背景音乐更明显一点。",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    },
    "asset-audio-rhythm-loop": {
      id: "asset-audio-rhythm-loop",
      name: "心跳卡点",
      type: "audio",
      duration: 26,
      summary: "偏节奏型的中文短视频配乐思路，适合卡点、混剪和情绪推进。",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    },
    "asset-text-title": {
      id: "asset-text-title",
      name: "思源黑体 Bold",
      type: "text",
      duration: 4,
      sampleText: "夏日海风",
      summary: "白色粗体标题，默认居中，适合做开场文案。",
      textStyle: {
        ...defaultCutTextStyle,
      },
    },
  },
  trackIds: ["video-track-1", "audio-track-1", "text-track-1"],
  tracksById: {
    "video-track-1": {
      id: "video-track-1",
      name: "视频轨道",
      type: "video",
      clipIds: [],
    },
    "audio-track-1": {
      id: "audio-track-1",
      name: "音频轨道",
      type: "audio",
      clipIds: ["clip-audio-theme"],
    },
    "text-track-1": {
      id: "text-track-1",
      name: "字幕轨道",
      type: "text",
      clipIds: ["clip-text-title"],
    },
  },
  clipsById: {
    "clip-audio-theme": {
      id: "clip-audio-theme",
      assetId: "asset-audio-theme",
      trackId: "audio-track-1",
      startTime: 0,
      duration: 24,
      transform: DEFAULT_CLIP_TRANSFORM,
      playbackRate: DEFAULT_CLIP_PLAYBACK_RATE,
      volume: DEFAULT_CLIP_VOLUME,
    },
    "clip-text-title": {
      id: "clip-text-title",
      assetId: "asset-text-title",
      trackId: "text-track-1",
      startTime: 3,
      duration: 4,
      transform: DEFAULT_CLIP_TRANSFORM,
      playbackRate: DEFAULT_CLIP_PLAYBACK_RATE,
      volume: DEFAULT_CLIP_VOLUME,
    },
  },
  clipClipboard: undefined,
  history: {
    undoStack: [],
    redoStack: [],
  },
};

export function cutEditorReducer(
  state: CutEditorState,
  action: CutEditorAction,
): CutEditorState {
  if (action.type === "setAspectRatio") {
    const nextAspectRatio = action.payload.aspectRatio as CutAspectRatioPresetKey;

    if (nextAspectRatio === state.aspectRatio) {
      return state;
    }

    return commitHistory(state, {
      ...state,
      aspectRatio: nextAspectRatio,
    });
  }

  if (action.type === "togglePlayback") {
    return {
      ...state,
      isPlaying: !state.isPlaying,
    };
  }

  if (action.type === "seek") {
    return {
      ...state,
      currentTime: Math.min(Math.max(action.payload.time, 0), state.duration),
    };
  }

  if (action.type === "selectAsset") {
    return {
      ...state,
      selectedAssetId: action.payload.assetId,
    };
  }

  if (action.type === "updateAssetPoster") {
    const asset = state.assetsById[action.payload.assetId];

    if (!asset || asset.poster === action.payload.poster) {
      return state;
    }

    return {
      ...state,
      assetsById: {
        ...state.assetsById,
        [asset.id]: {
          ...asset,
          poster: action.payload.poster,
        },
      },
    };
  }

  if (action.type === "updateAsset") {
    const asset = state.assetsById[action.payload.assetId];

    if (!asset) {
      return state;
    }

    const nextAsset = {
      ...asset,
      ...action.payload.changes,
    };
    const durationChanged =
      typeof action.payload.changes.duration === "number" &&
      action.payload.changes.duration !== asset.duration;
    const nextClipsById = durationChanged
      ? Object.fromEntries(
          Object.entries(state.clipsById).map(([clipId, clip]) => [
            clipId,
            clip.assetId === asset.id
              ? {
                  ...clip,
                  // 素材时长变更时，同步更新时间轴里引用该素材的片段长度，保持属性区和时间轴一致。
                  duration: action.payload.changes.duration!,
                }
              : clip,
          ]),
        )
      : state.clipsById;

    return commitHistory(state, {
      ...state,
      duration: durationChanged
        ? Math.max(state.duration, getExpandedProjectDuration(nextClipsById))
        : state.duration,
      clipsById: nextClipsById,
      assetsById: {
        ...state.assetsById,
        [asset.id]: nextAsset,
      },
    });
  }

  if (action.type === "addAsset") {
    const nextAsset = normalizeImportedAsset(action.payload.asset);

    return commitHistory(state, {
      ...state,
      assetIds: [...state.assetIds, nextAsset.id],
      assetsById: {
        ...state.assetsById,
        [nextAsset.id]: nextAsset,
      },
      selectedAssetId: nextAsset.id,
    });
  }

  if (action.type === "insertAssetToTimeline") {
    const asset = state.assetsById[action.payload.assetId];

    if (!asset) {
      return state;
    }

    const normalizedAsset = normalizeImportedAsset(asset);
    const targetTrackId = trackTypeMap[normalizedAsset.type];
    const targetTrack = state.tracksById[targetTrackId];

    if (!targetTrack) {
      return state;
    }

    const clipId = createTimelineClipId(asset.id);
    // 插入点贴近同轨道已有片段边界 0.5s 内时，自动吸附到最近边界。
    const requestedInsertTime =
      action.payload.trace?.requestedTime ?? state.currentTime;
    const nextStartTime = resolveClipStartTime(
      requestedInsertTime,
      targetTrack.clipIds,
      state.clipsById,
    );
    const nextClip = {
      id: clipId,
      assetId: normalizedAsset.id,
      trackId: targetTrackId,
      startTime: nextStartTime,
      duration: normalizedAsset.duration,
      transform: DEFAULT_CLIP_TRANSFORM,
      playbackRate: DEFAULT_CLIP_PLAYBACK_RATE,
      volume: DEFAULT_CLIP_VOLUME,
    };

    return commitHistory(state, {
      ...state,
      selectedClipId: clipId,
      selectedAssetId: normalizedAsset.id,
      currentTime: nextStartTime,
      assetsById: {
        ...state.assetsById,
        [normalizedAsset.id]: normalizedAsset,
      },
      tracksById: {
        ...state.tracksById,
        [targetTrackId]: {
          ...targetTrack,
          clipIds: [...targetTrack.clipIds, clipId],
        },
      },
      clipsById: {
        ...state.clipsById,
        [clipId]: nextClip,
      },
      duration: Math.max(
        state.duration,
        nextStartTime + normalizedAsset.duration + 5,
      ),
    });
  }

  if (action.type === "moveClip") {
    const clip = state.clipsById[action.payload.clipId];

    if (!clip) {
      return state;
    }

    const track = state.tracksById[clip.trackId];

    if (!track) {
      return state;
    }

    const nextStartTime = resolveClipStartTime(
      action.payload.startTime,
      track.clipIds,
      state.clipsById,
      clip.id,
    );

    if (nextStartTime === clip.startTime) {
      return state;
    }

    return commitHistory(state, {
      ...state,
      currentTime: nextStartTime,
      selectedClipId: clip.id,
      selectedAssetId: clip.assetId,
      clipsById: {
        ...state.clipsById,
        [clip.id]: {
          ...clip,
          startTime: nextStartTime,
        },
      },
      duration: Math.max(state.duration, nextStartTime + clip.duration + 5),
    });
  }

  if (action.type === "updateClipTransform") {
    const clip = state.clipsById[action.payload.clipId];

    if (!clip) {
      return state;
    }

    const nextTransform = {
      ...clip.transform,
      ...action.payload.transform,
    };

    if (
      nextTransform.offsetX === clip.transform.offsetX &&
      nextTransform.offsetY === clip.transform.offsetY &&
      nextTransform.scale === clip.transform.scale
    ) {
      return state;
    }

    return commitHistory(state, {
      ...state,
      clipsById: {
        ...state.clipsById,
        [clip.id]: {
          ...clip,
          transform: nextTransform,
        },
      },
    });
  }

  if (action.type === "updateClipSettings") {
    const clip = state.clipsById[action.payload.clipId];

    if (!clip) {
      return state;
    }

    const nextPlaybackRate = action.payload.changes.playbackRate ?? clip.playbackRate;
    const nextVolume = action.payload.changes.volume ?? clip.volume;

    if (
      nextPlaybackRate === clip.playbackRate &&
      nextVolume === clip.volume
    ) {
      return state;
    }

    return commitHistory(state, {
      ...state,
      clipsById: {
        ...state.clipsById,
        [clip.id]: {
          ...clip,
          playbackRate: nextPlaybackRate,
          volume: nextVolume,
        },
      },
    });
  }

  if (action.type === "resetClipTransform") {
    const clip = state.clipsById[action.payload.clipId];

    if (!clip) {
      return state;
    }

    if (
      clip.transform.offsetX === 0 &&
      clip.transform.offsetY === 0 &&
      clip.transform.scale === 1
    ) {
      return state;
    }

    return commitHistory(state, {
      ...state,
      clipsById: {
        ...state.clipsById,
        [clip.id]: {
          ...clip,
          transform: DEFAULT_CLIP_TRANSFORM,
        },
      },
    });
  }

  if (action.type === "splitClip") {
    const clip = state.clipsById[action.payload.clipId];

    if (!clip) {
      return state;
    }

    const splitTime = roundTimelineTime(action.payload.splitTime);
    const clipEndTime = roundTimelineTime(clip.startTime + clip.duration);
    const leftDuration = roundTimelineTime(splitTime - clip.startTime);
    const rightDuration = roundTimelineTime(clipEndTime - splitTime);

    if (
      leftDuration < MIN_SPLIT_CLIP_DURATION ||
      rightDuration < MIN_SPLIT_CLIP_DURATION
    ) {
      return state;
    }

    const track = state.tracksById[clip.trackId];

    if (!track) {
      return state;
    }

    const leftClipId = createTimelineClipId(clip.assetId);
    const rightClipId = createTimelineClipId(clip.assetId);
    const sharedSettings = cloneClipSettings(clip);
    const nextTrackClipIds = track.clipIds.flatMap((clipId) =>
      clipId === clip.id ? [leftClipId, rightClipId] : [clipId],
    );
    const nextClipsById = { ...state.clipsById };
    delete nextClipsById[clip.id];

    return commitHistory(state, {
      ...state,
      currentTime: splitTime,
      selectedClipId: rightClipId,
      selectedAssetId: clip.assetId,
      tracksById: {
        ...state.tracksById,
        [track.id]: {
          ...track,
          clipIds: nextTrackClipIds,
        },
      },
      clipsById: {
        ...nextClipsById,
        [leftClipId]: {
          id: leftClipId,
          assetId: clip.assetId,
          trackId: clip.trackId,
          startTime: clip.startTime,
          duration: leftDuration,
          ...sharedSettings,
        },
        [rightClipId]: {
          id: rightClipId,
          assetId: clip.assetId,
          trackId: clip.trackId,
          startTime: splitTime,
          duration: rightDuration,
          ...sharedSettings,
        },
      },
    });
  }

  if (action.type === "copyClip") {
    const clip = state.clipsById[action.payload.clipId];

    if (!clip) {
      return state;
    }

    return {
      ...state,
      clipClipboard: createClipClipboard(clip),
    };
  }

  if (action.type === "cutClip") {
    const clip = state.clipsById[action.payload.clipId];

    if (!clip) {
      return state;
    }

    const track = state.tracksById[clip.trackId];
    const nextClipsById = { ...state.clipsById };
    delete nextClipsById[clip.id];

    return commitHistory(
      state,
      {
        ...state,
        selectedClipId:
          state.selectedClipId === clip.id ? undefined : state.selectedClipId,
        tracksById: {
          ...state.tracksById,
          [clip.trackId]: {
            ...track,
            clipIds: track.clipIds.filter((clipId) => clipId !== clip.id),
          },
        },
        clipsById: nextClipsById,
      },
      {
        // 剪切要同时“复制到剪贴板 + 从时间轴拿走”。
        clipClipboard: createClipClipboard(clip),
      },
    );
  }

  if (action.type === "pasteClip") {
    const clipClipboard = state.clipClipboard;

    if (!clipClipboard) {
      return state;
    }

    const targetTrack = state.tracksById[clipClipboard.trackId];

    if (!targetTrack) {
      return state;
    }

    const nextStartTime =
      action.payload?.mode === "nextGap"
        ? resolveNextGapStartTime(
            state.currentTime,
            clipClipboard.duration,
            targetTrack.clipIds,
            state.clipsById,
          )
        : resolveClipStartTime(
            state.currentTime,
            targetTrack.clipIds,
            state.clipsById,
          );
    const clipId = createTimelineClipId(clipClipboard.assetId);
    const nextClip: TimelineClip = {
      id: clipId,
      assetId: clipClipboard.assetId,
      trackId: clipClipboard.trackId,
      startTime: nextStartTime,
      duration: clipClipboard.duration,
      transform: { ...clipClipboard.transform },
      playbackRate: clipClipboard.playbackRate,
      volume: clipClipboard.volume,
    };

    return commitHistory(state, {
      ...state,
      currentTime: nextStartTime,
      selectedClipId: clipId,
      selectedAssetId: clipClipboard.assetId,
      tracksById: {
        ...state.tracksById,
        [targetTrack.id]: {
          ...targetTrack,
          clipIds: [...targetTrack.clipIds, clipId],
        },
      },
      clipsById: {
        ...state.clipsById,
        [clipId]: nextClip,
      },
      duration: Math.max(state.duration, nextStartTime + nextClip.duration + 5),
    });
  }

  if (action.type === "selectClip") {
    const nextClipId = action.payload.clipId;

    if (!nextClipId) {
      return {
        ...state,
        selectedClipId: undefined,
      };
    }

    const selectedClip = state.clipsById[nextClipId];

    if (!selectedClip) {
      return state;
    }

    // 选中片段时同步游标和素材，后续预览区与属性区都能直接复用这份状态。
    return {
      ...state,
      currentTime: selectedClip.startTime,
      selectedClipId: nextClipId,
      selectedAssetId: selectedClip.assetId,
    };
  }

  if (action.type === "deleteClip") {
    const clip = state.clipsById[action.payload.clipId];

    if (!clip) {
      return state;
    }

    const track = state.tracksById[clip.trackId];
    const nextClipsById = { ...state.clipsById };
    delete nextClipsById[clip.id];

    return commitHistory(state, {
      ...state,
      selectedClipId:
        state.selectedClipId === clip.id ? undefined : state.selectedClipId,
      tracksById: {
        ...state.tracksById,
        [clip.trackId]: {
          ...track,
          clipIds: track.clipIds.filter((clipId) => clipId !== clip.id),
        },
      },
      clipsById: nextClipsById,
    });
  }

  if (action.type === "undo") {
    const previousSnapshot =
      state.history.undoStack[state.history.undoStack.length - 1];

    if (!previousSnapshot) {
      return state;
    }

    return restoreFromHistory(
      previousSnapshot,
      {
        undoStack: state.history.undoStack.slice(0, -1),
        redoStack: [
          toHistorySnapshot(state),
          ...state.history.redoStack.slice(0, HISTORY_LIMIT - 1),
        ],
      },
      state.clipClipboard,
    );
  }

  if (action.type === "redo") {
    const nextSnapshot = state.history.redoStack[0];

    if (!nextSnapshot) {
      return state;
    }

    return restoreFromHistory(
      nextSnapshot,
      {
        undoStack: [
          ...state.history.undoStack.slice(1 - HISTORY_LIMIT),
          toHistorySnapshot(state),
        ],
        redoStack: state.history.redoStack.slice(1),
      },
      state.clipClipboard,
    );
  }

  return state;
}
