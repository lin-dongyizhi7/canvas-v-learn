import {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
  type PropsWithChildren,
} from "react";
import { cutEditorReducer, initialCutEditorState } from "./editorReducer";
import type { CutEditorAction, CutEditorState } from "../types/editor";

interface CutEditorContextValue {
  state: CutEditorState;
  dispatch: Dispatch<CutEditorAction>;
}

const CutEditorContext = createContext<CutEditorContextValue | null>(null);

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  // 避开输入类控件，防止用户在改文案时触发全局快捷键。
  return (
    target.isContentEditable ||
    Boolean(
      target.closest(
        "input, textarea, select, [contenteditable], [contenteditable='plaintext-only']",
      ),
    )
  );
}

export function CutEditorProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(
    cutEditorReducer,
    initialCutEditorState,
  );
  const frameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const latestStateRef = useRef(state);

  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!state.isPlaying) {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      lastFrameTimeRef.current = null;
      return;
    }

    const step = (timestamp: number) => {
      const latestState = latestStateRef.current;
      const previousTimestamp = lastFrameTimeRef.current ?? timestamp;
      const elapsedSeconds = (timestamp - previousTimestamp) / 1000;
      const nextTime = Math.min(
        latestState.currentTime + elapsedSeconds,
        latestState.duration,
      );
      lastFrameTimeRef.current = timestamp;

      dispatch({
        type: "seek",
        payload: { time: nextTime },
      });

      if (nextTime < latestState.duration) {
        frameRef.current = requestAnimationFrame(step);
        return;
      }

      dispatch({ type: "togglePlayback" });
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      lastFrameTimeRef.current = null;
    };
  }, [dispatch, state.isPlaying]);

  useEffect(() => {
    return () => {
      Object.values(latestStateRef.current.assetsById).forEach((asset) => {
        if (asset.isObjectUrl && asset.src) {
          URL.revokeObjectURL(asset.src);
        }
      });
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isEditableTarget(event.target)) {
        return;
      }

      const state = latestStateRef.current;
      const isCommandPressed = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (isCommandPressed && key === "z") {
        event.preventDefault();

        dispatch({
          type: event.shiftKey ? "redo" : "undo",
        });
        return;
      }

      if (
        isCommandPressed &&
        !event.altKey &&
        key === "b" &&
        state.selectedClipId
      ) {
        const selectedClip = state.clipsById[state.selectedClipId];

        if (!selectedClip) {
          return;
        }

        // 只有游标真正在片段内部时才允许分割，避免切出无意义的 0 长度碎片。
        if (
          state.currentTime <= selectedClip.startTime + 0.49 ||
          state.currentTime >=
            selectedClip.startTime + selectedClip.duration - 0.49
        ) {
          return;
        }

        event.preventDefault();
        dispatch({
          type: "splitClip",
          payload: {
            clipId: state.selectedClipId,
            splitTime: state.currentTime,
          },
        });
        return;
      }

      if (
        isCommandPressed &&
        !event.altKey &&
        (key === "x" || key === "c") &&
        state.selectedClipId
      ) {
        event.preventDefault();
        dispatch({
          type: key === "x" ? "cutClip" : "copyClip",
          payload: { clipId: state.selectedClipId },
        });
        return;
      }

      if (
        isCommandPressed &&
        !event.altKey &&
        key === "v" &&
        state.clipClipboard
      ) {
        event.preventDefault();
        dispatch({
          type: "pasteClip",
          payload: {
            mode: event.shiftKey ? "nextGap" : "atCursor",
          },
        });
        return;
      }

      if (
        (event.key === "Backspace" || event.key === "Delete") &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        state.selectedClipId
      ) {
        event.preventDefault();
        dispatch({
          type: "deleteClip",
          payload: { clipId: state.selectedClipId },
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state],
  );

  return (
    <CutEditorContext.Provider value={value}>
      {children}
    </CutEditorContext.Provider>
  );
}

export function useCutEditor() {
  const context = useContext(CutEditorContext);

  if (!context) {
    throw new Error("useCutEditor 必须在 CutEditorProvider 内使用");
  }

  return context;
}
