export type CutAssetType = "video" | "audio" | "image" | "text" | "effect";

export const cutAspectRatioPresets = {
  "16:9": { label: "16:9", width: 16, height: 9 },
  "9:16": { label: "9:16", width: 9, height: 16 },
  "4:3": { label: "4:3", width: 4, height: 3 },
  "3:4": { label: "3:4", width: 3, height: 4 },
  "3:2": { label: "3:2", width: 3, height: 2 },
  "2:3": { label: "2:3", width: 2, height: 3 },
  "1:1": { label: "1:1", width: 1, height: 1 },
} as const;

export type CutAspectRatioPresetKey = keyof typeof cutAspectRatioPresets;

export interface CutTextStyle {
  fontSize: number;
  color: string;
  position: "center" | "bottom";
  hasBackground: boolean;
  backgroundColor: string;
  fontWeight: 400 | 500 | 600 | 700 | 800;
  letterSpacing: number;
  backgroundOpacity: number;
  strokeColor: string;
  strokeWidth: number;
}

export const defaultCutTextStyle: CutTextStyle = {
  fontSize: 42,
  color: "#FFFFFF",
  position: "center",
  hasBackground: false,
  backgroundColor: "#0F172A",
  fontWeight: 700,
  letterSpacing: 0,
  backgroundOpacity: 0.56,
  strokeColor: "#111827",
  strokeWidth: 0,
};

export interface CutBackgroundStyle {
  color: string;
  accentColor: string;
  gradientStrength: number;
}

export interface CutAsset {
  id: string;
  name: string;
  type: CutAssetType;
  duration: number;
  summary: string;
  sampleText?: string;
  src?: string;
  poster?: string;
  mimeType?: string;
  isObjectUrl?: boolean;
  textStyle?: CutTextStyle;
  backgroundStyle?: CutBackgroundStyle;
}

export interface TimelineClip {
  id: string;
  assetId: string;
  trackId: string;
  startTime: number;
  duration: number;
  transform: {
    offsetX: number;
    offsetY: number;
    scale: number;
  };
  playbackRate: number;
  volume: number;
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: CutAssetType;
  clipIds: string[];
}

export interface TimelineClipClipboard {
  assetId: string;
  trackId: string;
  duration: number;
  transform: TimelineClip["transform"];
  playbackRate: number;
  volume: number;
}

export interface CutEditorState {
  projectName: string;
  aspectRatio: CutAspectRatioPresetKey;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  selectedAssetId?: string;
  selectedClipId?: string;
  assetIds: string[];
  assetsById: Record<string, CutAsset>;
  trackIds: string[];
  tracksById: Record<string, TimelineTrack>;
  clipsById: Record<string, TimelineClip>;
  clipClipboard?: TimelineClipClipboard;
  history: {
    undoStack: CutEditorHistorySnapshot[];
    redoStack: CutEditorHistorySnapshot[];
  };
}

export type CutEditorHistorySnapshot = Omit<
  CutEditorState,
  "history" | "clipClipboard"
>;

export type CutEditorAction =
  | { type: "togglePlayback" }
  | { type: "seek"; payload: { time: number } }
  | { type: "setAspectRatio"; payload: { aspectRatio: CutAspectRatioPresetKey } }
  | { type: "selectAsset"; payload: { assetId?: string } }
  | { type: "selectClip"; payload: { clipId?: string } }
  | { type: "updateAssetPoster"; payload: { assetId: string; poster?: string } }
  | {
      type: "updateAsset";
      payload: {
        assetId: string;
        changes: Partial<CutAsset>;
      };
    }
  | { type: "addAsset"; payload: { asset: CutAsset } }
  | {
      type: "insertAssetToTimeline";
      payload: {
        assetId: string;
        trace?: {
          requestedTime: number;
          assetDuration: number;
          isImageAsset: boolean;
        };
      };
    }
  | { type: "moveClip"; payload: { clipId: string; startTime: number } }
  | {
      type: "updateClipTransform";
      payload: {
        clipId: string;
        transform: Partial<TimelineClip["transform"]>;
      };
    }
  | {
      type: "updateClipSettings";
      payload: {
        clipId: string;
        changes: Partial<Pick<TimelineClip, "playbackRate" | "volume">>;
      };
    }
  | { type: "resetClipTransform"; payload: { clipId: string } }
  | {
      type: "splitClip";
      payload: {
        clipId: string;
        splitTime: number;
      };
    }
  | { type: "copyClip"; payload: { clipId: string } }
  | { type: "cutClip"; payload: { clipId: string } }
  | {
      type: "pasteClip";
      payload?: {
        mode?: "atCursor" | "nextGap";
      };
    }
  | { type: "deleteClip"; payload: { clipId: string } }
  | { type: "undo" }
  | { type: "redo" };
