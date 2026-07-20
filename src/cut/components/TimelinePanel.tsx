import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import { useCutEditor } from "../store/editorContext";

const clipAccentByType = {
  video: "#2a55e5",
  audio: "#12b76a",
  text: "#f79009",
  image: "#7a5af8",
  effect: "#ef6820",
} as const;

type CutTimelineDebugData = Record<string, number | string | undefined>;

function reportCutTimelineDebug(
  hypothesisId: string,
  msg: string,
  data: CutTimelineDebugData,
) {
  // #region debug-point B:timeline-seek
  fetch("http://127.0.0.1:7777/event", { method: "POST", body: JSON.stringify({ sessionId: "cut-timeline-debug", runId: "pre-fix", hypothesisId, location: "src/cut/components/TimelinePanel.tsx", msg: `[DEBUG] ${msg}`, data, ts: Date.now() }) }).catch(() => undefined);
  // #endregion
}

function resolveTimelineTickStep(duration: number) {
  if (duration <= 12) return 1;
  if (duration <= 30) return 5;
  if (duration <= 90) return 10;
  if (duration <= 180) return 15;
  if (duration <= 300) return 30;
  if (duration <= 900) return 60;
  return 120;
}

function formatTimelineTime(time: number) {
  return `${time.toFixed(1)}s`;
}

function roundTimelineTime(time: number) {
  return Number(time.toFixed(1));
}

function TimelineIconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="cut-icon-button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function TimelineIcon({
  name,
}: {
  name:
  | "undo"
  | "redo"
  | "split"
  | "cut"
  | "copy"
  | "paste"
  | "shrink"
  | "grow"
  | "delete";
}) {
  const pathByName = {
    undo: "M9 7H5m0 0 3-3M5 7l3 3m7 7a6 6 0 0 0-6-10H5",
    redo: "M15 7h4m0 0-3-3m3 3-3 3M5 17a6 6 0 0 1 6-10h8",
    split: "M12 4v16M8 7 5 10l3 3M16 7l3 3-3 3M8 17l-3-3 3-3M16 17l3-3-3-3",
    cut: "M5 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm14 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM6.4 9.2l11.2 5.6M6.4 14.8l11.2-5.6",
    copy: "M9 9V5.8c0-.4.4-.8.8-.8h8.4c.4 0 .8.4.8.8v8.4c0 .4-.4.8-.8.8H15M8.8 19H5.8c-.4 0-.8-.4-.8-.8V9.8c0-.4.4-.8.8-.8h8.4c.4 0 .8.4.8.8v8.4c0 .4-.4.8-.8.8H8.8Z",
    paste: "M9 5.8h6M10 4h4a1 1 0 0 1 1 1v1H9V5a1 1 0 0 1 1-1Zm-3 3h10c.6 0 1 .4 1 1v10c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V8c0-.6.4-1 1-1Zm3 4h4m-4 3h4",
    shrink: "M8 7H4m0 0 2-2M4 7l2 2m10 8h4m0 0-2-2m2 2-2 2M10 12h4",
    grow: "M4 7h4m0 0-2-2m2 2-2 2m14 8h-4m0 0 2-2m-2 2 2 2M10 12h4",
    delete:
      "M9 4h6m-8 4h10m-9 0 .6 11h6.8L16 8M10 8v8m4-8v8",
  } as const;

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={pathByName[name]} />
    </svg>
  );
}

export function TimelinePanel() {
  const { state, dispatch } = useCutEditor();
  const timeRulerRef = useRef<HTMLDivElement>(null);
  const suppressClipClickRef = useRef<string | null>(null);
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [draggingClip, setDraggingClip] = useState<{
    clipId: string;
    startTime: number;
  } | null>(null);
  const timelineTickStep = useMemo(
    () => resolveTimelineTickStep(state.duration),
    [state.duration],
  );
  const timelineTicks = useMemo(() => {
    const ticks = Array.from(
      { length: Math.floor(state.duration / timelineTickStep) + 1 },
      (_, index) => index * timelineTickStep,
    );

    if (ticks[ticks.length - 1] !== state.duration) {
      ticks.push(state.duration);
    }

    return ticks;
  }, [state.duration, timelineTickStep]);
  useEffect(() => {
    reportCutTimelineDebug("C", "adaptive timeline ticks generated", {
      duration: state.duration,
      tickStep: timelineTickStep,
      tickCount: timelineTicks.length,
      lastTick: timelineTicks[timelineTicks.length - 1],
    });
  }, [state.duration, timelineTickStep, timelineTicks]);
  const playheadLeft = `${(state.currentTime / state.duration) * 100}%`;
  const selectedClipId = state.selectedClipId;
  const selectedClip = selectedClipId ? state.clipsById[selectedClipId] : undefined;
  const hasSelectedClip = Boolean(selectedClipId);
  const hasClipboardClip = Boolean(state.clipClipboard);
  const canUndo = state.history.undoStack.length > 0;
  const canRedo = state.history.redoStack.length > 0;
  const canSplitSelectedClip = Boolean(
    selectedClip &&
    state.currentTime > selectedClip.startTime + 0.49 &&
    state.currentTime < selectedClip.startTime + selectedClip.duration - 0.49,
  );
  const deleteSelectedClip = () => {
    if (!selectedClipId) {
      return;
    }

    dispatch({
      type: "deleteClip",
      payload: { clipId: selectedClipId },
    });
  };
  const zoomTimeline = (delta: number) => {
    setTimelineZoom((currentZoom) =>
      Math.min(Math.max(currentZoom + delta, 1), 3),
    );
  };
  const seekByClientX = useCallback(
    (clientX: number) => {
      const rulerRect = timeRulerRef.current?.getBoundingClientRect();

      if (!rulerRect?.width) {
        reportCutTimelineDebug("B", "seek aborted because ruler width is unavailable", {
          clientX,
          duration: state.duration,
          timelineZoom,
        });
        return;
      }

      const progress = Math.min(
        Math.max((clientX - rulerRect.left) / rulerRect.width, 0),
        1,
      );
      const nextTime = progress * state.duration;

      reportCutTimelineDebug("B", "seek position calculated from ruler", {
        clientX,
        rulerLeft: rulerRect.left,
        rulerWidth: rulerRect.width,
        progress: Number(progress.toFixed(4)),
        nextTime: Number(nextTime.toFixed(4)),
        duration: state.duration,
        timelineZoom,
      });

      dispatch({
        type: "seek",
        payload: { time: nextTime },
      });
    },
    [dispatch, state.duration, timelineZoom],
  );

  const handlePlayheadPointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    reportCutTimelineDebug("D", "playhead pointer down", {
      clientX: event.clientX,
      currentTime: state.currentTime,
      duration: state.duration,
      timelineZoom,
    });
    seekByClientX(event.clientX);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      reportCutTimelineDebug("D", "playhead pointer move", {
        clientX: moveEvent.clientX,
        duration: state.duration,
        timelineZoom,
      });
      seekByClientX(moveEvent.clientX);
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };
  const handleTimeRulerClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    // 顶部时间标尺直接复用游标换算逻辑，点击哪里就跳到哪里。
    reportCutTimelineDebug("B", "timeline ruler clicked", {
      clientX: event.clientX,
      currentTime: state.currentTime,
      duration: state.duration,
      timelineZoom,
    });
    seekByClientX(event.clientX);
  };
  const resolveDraggedClipStartTime = useCallback(
    (baseStartTime: number, deltaX: number) => {
      const rulerRect = timeRulerRef.current?.getBoundingClientRect();

      if (!rulerRect?.width) {
        return baseStartTime;
      }

      // 拖拽过程按像素位移换算成时间位移，落点提交时再交给 reducer 做吸附。
      return roundTimelineTime(
        Math.max(baseStartTime + (deltaX / rulerRect.width) * state.duration, 0),
      );
    },
    [state.duration],
  );
  const handleClipPointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    clip: (typeof state.clipsById)[string],
  ) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    dispatch({
      type: "selectClip",
      payload: { clipId: clip.id },
    });

    const initialClientX = event.clientX;
    let latestStartTime = clip.startTime;
    let hasMoved = false;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - initialClientX;

      if (!hasMoved && Math.abs(deltaX) < 2) {
        return;
      }

      hasMoved = true;
      latestStartTime = resolveDraggedClipStartTime(clip.startTime, deltaX);
      setDraggingClip({
        clipId: clip.id,
        startTime: latestStartTime,
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      setDraggingClip(null);

      if (!hasMoved) {
        return;
      }

      suppressClipClickRef.current = clip.id;
      dispatch({
        type: "moveClip",
        payload: {
          clipId: clip.id,
          startTime: latestStartTime,
        },
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };
  const handleClipClick = (clipId: string) => {
    if (suppressClipClickRef.current === clipId) {
      suppressClipClickRef.current = null;
      return;
    }

    dispatch({
      type: "selectClip",
      payload: { clipId },
    });
  };

  return (
    <section className="cut-panel cut-timeline-panel">
      <div className="cut-panel__header">
        <div className="cut-timeline-panel__title">
          <p className="cut-panel__eyebrow">时间轴</p>
          <span className="cut-timeline-panel__current-time">
            {formatTimelineTime(state.currentTime)}
          </span>
        </div>
        <div className="cut-timeline-panel__tools">
          <TimelineIconButton
            label="撤销"
            disabled={!canUndo}
            onClick={() => dispatch({ type: "undo" })}
          >
            <TimelineIcon name="undo" />
          </TimelineIconButton>
          <TimelineIconButton
            label="重做"
            disabled={!canRedo}
            onClick={() => dispatch({ type: "redo" })}
          >
            <TimelineIcon name="redo" />
          </TimelineIconButton>
          <span className="cut-timeline-panel__tool-divider" />
          <TimelineIconButton
            label="按游标分割选中素材"
            disabled={!canSplitSelectedClip}
            onClick={() =>
              selectedClipId
                ? dispatch({
                  type: "splitClip",
                  payload: {
                    clipId: selectedClipId,
                    splitTime: state.currentTime,
                  },
                })
                : undefined
            }
          >
            <TimelineIcon name="split" />
          </TimelineIconButton>
          <TimelineIconButton
            label="剪切选中素材"
            disabled={!hasSelectedClip}
            onClick={() =>
              selectedClipId
                ? dispatch({
                  type: "cutClip",
                  payload: { clipId: selectedClipId },
                })
                : undefined
            }
          >
            <TimelineIcon name="cut" />
          </TimelineIconButton>
          <TimelineIconButton
            label="复制选中素材"
            disabled={!hasSelectedClip}
            onClick={() =>
              selectedClipId
                ? dispatch({
                  type: "copyClip",
                  payload: { clipId: selectedClipId },
                })
                : undefined
            }
          >
            <TimelineIcon name="copy" />
          </TimelineIconButton>
          <TimelineIconButton
            label="粘贴素材到当前游标"
            disabled={!hasClipboardClip}
            onClick={() => dispatch({ type: "pasteClip" })}
          >
            <TimelineIcon name="paste" />
          </TimelineIconButton>
          <span className="cut-timeline-panel__tool-divider" />
          <TimelineIconButton
            label="缩小时间轴"
            disabled={timelineZoom <= 1}
            onClick={() => zoomTimeline(-0.25)}
          >
            <TimelineIcon name="shrink" />
          </TimelineIconButton>
          <TimelineIconButton
            label="放大时间轴"
            disabled={timelineZoom >= 3}
            onClick={() => zoomTimeline(0.25)}
          >
            <TimelineIcon name="grow" />
          </TimelineIconButton>
          <TimelineIconButton
            label="删除选中素材"
            disabled={!hasSelectedClip}
            onClick={deleteSelectedClip}
          >
            <TimelineIcon name="delete" />
          </TimelineIconButton>
        </div>
      </div>

      <div className="cut-timeline__container">
        <div className="cut-timeline__left">
          <div className="cut-timeline__sidebar-header">轨道</div>
          {state.trackIds.map((trackId) => {
            const track = state.tracksById[trackId];
            return (
              <div key={track.id} className="cut-timeline__track-label">
                <strong>{track.name}</strong>
                <span>{track.clipIds.length} 个片段</span>
              </div>
            );
          })}
        </div>
        <div className="cut-timeline__viewport">
          <div
            className="cut-timeline"
            style={{ width: `${timelineZoom * 100}%` }}
          >
            <div className="cut-timeline__row cut-timeline__row--header">
              <div
                ref={timeRulerRef}
                className="cut-timeline__ticks"
                onClick={handleTimeRulerClick}
              >
                <div
                  className="cut-playhead cut-playhead--lane"
                  style={{ left: playheadLeft }}
                  onPointerDown={handlePlayheadPointerDown}
                />
                {timelineTicks.map((tick) => (
                  <span
                    key={tick}
                    className="cut-timeline__tick"
                    style={{
                      left: `${(tick / state.duration) * 100}%`,
                      transform:
                        tick === state.duration
                          ? "translate(-100%, -50%)"
                          : "translateY(-50%)",
                    }}
                  >
                    {tick}s
                  </span>
                ))}
              </div>
            </div>

            {state.trackIds.map((trackId) => {
              const track = state.tracksById[trackId];

              return (
                <div key={track.id} className="cut-timeline__row">
                  <div className="cut-timeline__drop-zone">
                    <div
                      className="cut-playhead cut-playhead--lane"
                      style={{ left: playheadLeft }}
                      onPointerDown={handlePlayheadPointerDown}
                    />
                    {track.clipIds.length === 0 ? (
                      <span>把素材拖到这里，时间轴就开始有故事了</span>
                    ) : null}

                    {/* 每一行的时间内容区自己维护游标和片段，左侧轨道列天然不会参与定位。 */}
                    {track.clipIds.map((clipId) => {
                      const clip = state.clipsById[clipId];
                      const asset = state.assetsById[clip.assetId];
                      const isActive = state.selectedClipId === clip.id;
                      const visualStartTime =
                        draggingClip?.clipId === clip.id
                          ? draggingClip.startTime
                          : clip.startTime;
                      const clipWidthPercent =
                        (clip.duration / state.duration) * 100;
                      const isCompactClip =
                        clipWidthPercent < 10 || clip.duration <= 4;
                      const clipStyle = {
                        left: `${(visualStartTime / state.duration) * 100}%`,
                        width: `${clipWidthPercent}%`,
                        "--cut-clip-accent": clipAccentByType[asset.type],
                      } as CSSProperties;
                      const clipEndTime = visualStartTime + clip.duration;

                      return (
                        <button
                          key={clip.id}
                          type="button"
                          className={`cut-timeline__clip ${isActive ? "active" : ""} ${isCompactClip ? "cut-timeline__clip--compact" : ""} ${draggingClip?.clipId === clip.id ? "cut-timeline__clip--dragging" : ""}`}
                          style={clipStyle}
                          title={`${asset.name} ${formatTimelineTime(visualStartTime)} - ${formatTimelineTime(clipEndTime)}`}
                          onPointerDown={(event) => handleClipPointerDown(event, clip)}
                          onClick={() => handleClipClick(clip.id)}
                        >
                          <strong>{asset.name}</strong>
                          {isCompactClip ? null : (
                            <span>
                              {formatTimelineTime(visualStartTime)} -{" "}
                              {formatTimelineTime(clipEndTime)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
