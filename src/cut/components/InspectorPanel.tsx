import { useEffect, useRef, useState, type ReactNode } from "react";
import { cutAspectRatioPresets, defaultCutTextStyle } from "../types/editor";
import { useCutEditor } from "../store/editorContext";
import type { CutAsset, TimelineClip } from "../types/editor";
import {
  createSolidBackgroundDataUrl,
  isSolidBackgroundAsset,
  resolveBackgroundStyle,
} from "../utils/background";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatDecimal(value: number, fractionDigits = 2) {
  return value.toFixed(fractionDigits);
}

function isVisualAsset(asset?: CutAsset) {
  if (!asset) {
    return false;
  }

  return asset.type === "video" || Boolean(asset.mimeType?.startsWith("image/"));
}

function getAssetTypeLabel(asset?: CutAsset) {
  if (!asset) {
    return "未选择";
  }

  if (asset.mimeType?.startsWith("image/")) {
    return "图片";
  }

  const assetTypeLabelMap = {
    video: "视频",
    audio: "音频",
    image: "图片",
    text: "文字",
    effect: "特效",
  } as const;

  return assetTypeLabelMap[asset.type];
}

function isSubtitleAsset(asset: CutAsset, textStyle: CutAsset["textStyle"]) {
  return (
    asset.type === "text" &&
    (asset.name.includes("字幕") ||
      textStyle?.position === "bottom" ||
      textStyle?.hasBackground === true)
  );
}

function EditableMetricValue({
  value,
  min,
  max,
  step,
  displayValue,
  onCommit,
  toInputValue = (nextValue) => String(nextValue),
  fromInputValue = (rawValue) => Number(rawValue),
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  onCommit: (value: number) => void;
  toInputValue?: (value: number) => string;
  fromInputValue?: (value: string) => number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(() => toInputValue(value));

  useEffect(() => {
    if (isEditing) {
      return;
    }

    setDraftValue(toInputValue(value));
  }, [isEditing, toInputValue, value]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isEditing]);

  const commitValue = () => {
    const parsedValue = fromInputValue(draftValue);

    if (Number.isNaN(parsedValue)) {
      setDraftValue(toInputValue(value));
      setIsEditing(false);
      return;
    }

    onCommit(clamp(parsedValue, min, max));
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        className="cut-input cut-input--metric"
        type="number"
        min={min}
        max={max}
        step={step}
        value={draftValue}
        onChange={(event) => setDraftValue(event.target.value)}
        onBlur={commitValue}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            commitValue();
          }

          if (event.key === "Escape") {
            setDraftValue(toInputValue(value));
            setIsEditing(false);
          }
        }}
      />
    );
  }

  return (
    <button
      type="button"
      className="cut-metric-trigger"
      onMouseDown={(event) => {
        // 这里显式阻止默认行为，避免外层行容器或紧邻控件把焦点抢走。
        event.preventDefault();
        event.stopPropagation();
        setIsEditing(true);
      }}
    >
      {displayValue}
    </button>
  );
}

function PropertyRow({
  label,
  children,
  alignStart = false,
  stacked = false,
}: {
  label: string;
  children: ReactNode;
  alignStart?: boolean;
  stacked?: boolean;
}) {
  return (
    <div
      className={`cut-field ${stacked ? "cut-field--stacked" : "cut-field--row"} ${alignStart ? "cut-field--align-start" : ""}`}
    >
      <span className="cut-field__label">{label}</span>
      <div
        className={`cut-field__control ${
          alignStart ? "cut-field__control--align-start" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function RangeMetricControl({
  value,
  min,
  max,
  step,
  displayValue,
  onChange,
  onCommit,
  toInputValue,
  fromInputValue,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  onChange: (value: number) => void;
  onCommit: (value: number) => void;
  toInputValue?: (value: number) => string;
  fromInputValue?: (value: string) => number;
}) {
  return (
    <div className="cut-field__control-group cut-field__control-group--range">
      <input
        className="cut-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(clamp(Number(event.target.value), min, max))}
      />
      <EditableMetricValue
        value={value}
        min={min}
        max={max}
        step={step}
        displayValue={displayValue}
        onCommit={onCommit}
        toInputValue={toInputValue}
        fromInputValue={fromInputValue}
      />
    </div>
  );
}

function ColorControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="cut-field__control-group cut-field__control-group--color">
      <input
        className="cut-color"
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function InspectorPanel() {
  const { state, dispatch } = useCutEditor();
  const selectedClip = state.selectedClipId
    ? state.clipsById[state.selectedClipId]
    : undefined;
  const selectedAsset = selectedClip
    ? state.assetsById[selectedClip.assetId]
    : state.selectedAssetId
      ? state.assetsById[state.selectedAssetId]
      : undefined;
  const selectedAssetType = selectedAsset?.type;
  const selectedTextStyle = {
    ...defaultCutTextStyle,
    ...selectedAsset?.textStyle,
  };
  const selectedBackgroundStyle = resolveBackgroundStyle(
    selectedAsset?.backgroundStyle,
  );
  const selectedIsSubtitleAsset = selectedAsset
    ? isSubtitleAsset(selectedAsset, selectedTextStyle)
    : false;

  const updateAsset = (changes: Partial<CutAsset>) => {
    if (!selectedAsset) {
      return;
    }

    dispatch({
      type: "updateAsset",
      payload: {
        assetId: selectedAsset.id,
        changes,
      },
    });
  };

  const updateClipSettings = (
    changes: Partial<Pick<TimelineClip, "playbackRate" | "volume">>,
  ) => {
    if (!selectedClip) {
      return;
    }

    dispatch({
      type: "updateClipSettings",
      payload: {
        clipId: selectedClip.id,
        changes,
      },
    });
  };

  const updateClipTransform = (transform: {
    offsetX?: number;
    offsetY?: number;
    scale?: number;
  }) => {
    if (!selectedClip) {
      return;
    }

    dispatch({
      type: "updateClipTransform",
      payload: {
        clipId: selectedClip.id,
        transform,
      },
    });
  };

  const updateBackgroundStyle = (
    changes: Partial<NonNullable<CutAsset["backgroundStyle"]>>,
  ) => {
    if (!selectedAsset || !isSolidBackgroundAsset(selectedAsset)) {
      return;
    }

    const nextBackgroundStyle = resolveBackgroundStyle({
      ...selectedBackgroundStyle,
      ...changes,
    });
    const nextBackgroundSrc = createSolidBackgroundDataUrl(
      selectedAsset.name,
      nextBackgroundStyle,
    );

    updateAsset({
      src: nextBackgroundSrc,
      poster: nextBackgroundSrc,
      backgroundStyle: nextBackgroundStyle,
    });
  };

  const updateTextStyle = (
    changes: Partial<NonNullable<CutAsset["textStyle"]>>,
  ) => {
    if (!selectedAsset || selectedAsset.type !== "text") {
      return;
    }

    updateAsset({
      textStyle: {
        ...selectedTextStyle,
        ...changes,
      },
    });
  };

  return (
    <aside className="cut-panel cut-inspector-panel">
      <div className="cut-panel__header">
        <div>
          <p className="cut-panel__eyebrow">属性区</p>
        </div>
      </div>

      <div className="cut-inspector-panel__body">
        <div className="cut-setting-card">
          <strong>画布设置</strong>
          <PropertyRow label="画布比例" alignStart stacked>
            <div className="cut-field__control-group cut-field__control-group--chips">
              {Object.values(cutAspectRatioPresets).map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className={`cut-ratio-chip ${state.aspectRatio === preset.label ? "active" : ""}`}
                  onClick={() =>
                    dispatch({
                      type: "setAspectRatio",
                      payload: { aspectRatio: preset.label },
                    })
                  }
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </PropertyRow>
          <p>切换后预览画布会同步改变，图片类素材会按目标比例自动缩放适配。</p>
        </div>

        {selectedAsset ? (
          <>
            <div className="cut-setting-card">
              <strong>{selectedAsset.name}</strong>
              <div className="cut-setting-card__rows">
                <PropertyRow label="素材类型">
                  <strong className="cut-inline-value">
                    {getAssetTypeLabel(selectedAsset)}
                  </strong>
                </PropertyRow>
                <PropertyRow label="时长">
                  <input
                    className="cut-input cut-input--inline"
                    type="number"
                    min={1}
                    max={600}
                    step={0.5}
                    value={selectedAsset.duration}
                    onChange={(event) =>
                      updateAsset({
                        duration: clamp(Number(event.target.value) || 1, 1, 600),
                      })
                    }
                  />
                </PropertyRow>
              </div>
              <p className="cut-setting-card__summary">{selectedAsset.summary}</p>
            </div>

            {isSolidBackgroundAsset(selectedAsset) ? (
              <div className="cut-setting-card">
                <strong>背景渐变</strong>
                <div className="cut-setting-card__rows">
                  <PropertyRow label="背景主色">
                    <ColorControl
                      value={selectedBackgroundStyle.color}
                      onChange={(nextColor) =>
                        updateBackgroundStyle({ color: nextColor })
                      }
                    />
                  </PropertyRow>
                  <PropertyRow label="辅助色">
                    <ColorControl
                      value={selectedBackgroundStyle.accentColor}
                      onChange={(nextColor) =>
                        updateBackgroundStyle({ accentColor: nextColor })
                      }
                    />
                  </PropertyRow>
                  <PropertyRow label="渐变强度">
                    <RangeMetricControl
                      value={selectedBackgroundStyle.gradientStrength}
                      min={0}
                      max={1}
                      step={0.05}
                      displayValue={`${Math.round(
                        selectedBackgroundStyle.gradientStrength * 100,
                      )}%`}
                      toInputValue={(nextValue) =>
                        String(Math.round(nextValue * 100))
                      }
                      fromInputValue={(rawValue) => Number(rawValue) / 100}
                      onChange={(nextValue) =>
                        updateBackgroundStyle({ gradientStrength: nextValue })
                      }
                      onCommit={(nextValue) =>
                        updateBackgroundStyle({ gradientStrength: nextValue })
                      }
                    />
                  </PropertyRow>
                </div>
              </div>
            ) : null}

            {selectedClip ? (
              <div className="cut-setting-card">
                <strong>片段参数</strong>
                <div className="cut-setting-card__rows">
                  <PropertyRow label="播放速度">
                    <RangeMetricControl
                      value={selectedClip.playbackRate}
                      min={0.25}
                      max={2}
                      step={0.05}
                      displayValue={`${formatDecimal(selectedClip.playbackRate)}x`}
                      onChange={(nextValue) =>
                        updateClipSettings({ playbackRate: nextValue })
                      }
                      onCommit={(nextValue) =>
                        updateClipSettings({ playbackRate: nextValue })
                      }
                    />
                  </PropertyRow>

                  {selectedAssetType === "audio" || selectedAssetType === "video" ? (
                    <PropertyRow label="音量">
                      <RangeMetricControl
                        value={selectedClip.volume}
                        min={0}
                        max={1}
                        step={0.05}
                        displayValue={formatPercent(selectedClip.volume)}
                        toInputValue={(nextValue) =>
                          String(Math.round(nextValue * 100))
                        }
                        fromInputValue={(rawValue) => Number(rawValue) / 100}
                        onChange={(nextValue) =>
                          updateClipSettings({ volume: nextValue })
                        }
                        onCommit={(nextValue) =>
                          updateClipSettings({ volume: nextValue })
                        }
                      />
                    </PropertyRow>
                  ) : null}

                  {isVisualAsset(selectedAsset) ? (
                    <>
                      <PropertyRow label="缩放大小">
                        <RangeMetricControl
                          value={selectedClip.transform.scale}
                          min={0.2}
                          max={4}
                          step={0.05}
                          displayValue={`${formatDecimal(selectedClip.transform.scale)}x`}
                          onChange={(nextValue) =>
                            updateClipTransform({ scale: nextValue })
                          }
                          onCommit={(nextValue) =>
                            updateClipTransform({ scale: nextValue })
                          }
                        />
                      </PropertyRow>
                      <PropertyRow label="X 位置">
                        <RangeMetricControl
                          value={selectedClip.transform.offsetX}
                          min={-240}
                          max={240}
                          step={1}
                          displayValue={`${selectedClip.transform.offsetX}px`}
                          onChange={(nextValue) =>
                            updateClipTransform({ offsetX: nextValue })
                          }
                          onCommit={(nextValue) =>
                            updateClipTransform({ offsetX: nextValue })
                          }
                        />
                      </PropertyRow>
                      <PropertyRow label="Y 位置">
                        <RangeMetricControl
                          value={selectedClip.transform.offsetY}
                          min={-180}
                          max={180}
                          step={1}
                          displayValue={`${selectedClip.transform.offsetY}px`}
                          onChange={(nextValue) =>
                            updateClipTransform({ offsetY: nextValue })
                          }
                          onCommit={(nextValue) =>
                            updateClipTransform({ offsetY: nextValue })
                          }
                        />
                      </PropertyRow>
                      <PropertyRow label="重置位置">
                        <button
                          type="button"
                          className="cut-button cut-button--ghost cut-button--inline"
                          onClick={() =>
                            dispatch({
                              type: "resetClipTransform",
                              payload: { clipId: selectedClip.id },
                            })
                          }
                        >
                          恢复默认
                        </button>
                      </PropertyRow>
                    </>
                  ) : null}
                </div>
              </div>
            ) : null}

            {selectedAssetType === "text" ? (
              <div className="cut-setting-card">
                <strong>{selectedIsSubtitleAsset ? "字幕属性" : "文字样式"}</strong>
                <div className="cut-setting-card__section">
                  <span className="cut-setting-card__section-title">
                    {selectedIsSubtitleAsset ? "字幕内容" : "文字内容"}
                  </span>
                  <PropertyRow
                    label={selectedIsSubtitleAsset ? "字幕内容" : "文字内容"}
                    alignStart
                  >
                    <textarea
                      className="cut-textarea cut-textarea--inline"
                      rows={3}
                      value={selectedAsset.sampleText ?? ""}
                      onChange={(event) => updateAsset({ sampleText: event.target.value })}
                    />
                  </PropertyRow>
                </div>

                <div className="cut-setting-card__section">
                  <span className="cut-setting-card__section-title">字体设置</span>
                  <div className="cut-setting-card__rows">
                    <PropertyRow label="文字大小">
                      <RangeMetricControl
                        value={selectedTextStyle.fontSize}
                        min={18}
                        max={96}
                        step={1}
                        displayValue={`${selectedTextStyle.fontSize}px`}
                        onChange={(nextValue) =>
                          updateTextStyle({ fontSize: nextValue })
                        }
                        onCommit={(nextValue) =>
                          updateTextStyle({ fontSize: nextValue })
                        }
                      />
                    </PropertyRow>
                    <PropertyRow label="字重">
                      <select
                        className="cut-select cut-select--inline"
                        value={selectedTextStyle.fontWeight}
                        onChange={(event) =>
                          updateTextStyle({
                            fontWeight: Number(event.target.value) as 400 | 500 | 600 | 700 | 800,
                          })
                        }
                      >
                        <option value={400}>Regular</option>
                        <option value={500}>Medium</option>
                        <option value={600}>Semibold</option>
                        <option value={700}>Bold</option>
                        <option value={800}>Heavy</option>
                      </select>
                    </PropertyRow>
                    <PropertyRow label="字间距">
                      <RangeMetricControl
                        value={selectedTextStyle.letterSpacing}
                        min={-2}
                        max={12}
                        step={0.5}
                        displayValue={`${formatDecimal(
                          selectedTextStyle.letterSpacing,
                          1,
                        )}px`}
                        onChange={(nextValue) =>
                          updateTextStyle({ letterSpacing: nextValue })
                        }
                        onCommit={(nextValue) =>
                          updateTextStyle({ letterSpacing: nextValue })
                        }
                      />
                    </PropertyRow>
                  </div>
                </div>

                <div className="cut-setting-card__section">
                  <span className="cut-setting-card__section-title">
                    {selectedIsSubtitleAsset ? "字幕表现" : "显示设置"}
                  </span>
                  <div className="cut-setting-card__rows">
                    <PropertyRow label="文字颜色">
                      <ColorControl
                        value={selectedTextStyle.color}
                        onChange={(nextColor) =>
                          updateTextStyle({ color: nextColor })
                        }
                      />
                    </PropertyRow>
                    <PropertyRow label="描边颜色">
                      <ColorControl
                        value={selectedTextStyle.strokeColor}
                        onChange={(nextColor) =>
                          updateTextStyle({ strokeColor: nextColor })
                        }
                      />
                    </PropertyRow>
                    <PropertyRow label="描边粗细">
                      <RangeMetricControl
                        value={selectedTextStyle.strokeWidth}
                        min={0}
                        max={12}
                        step={0.5}
                        displayValue={`${formatDecimal(
                          selectedTextStyle.strokeWidth,
                          1,
                        )}px`}
                        onChange={(nextValue) =>
                          updateTextStyle({ strokeWidth: nextValue })
                        }
                        onCommit={(nextValue) =>
                          updateTextStyle({ strokeWidth: nextValue })
                        }
                      />
                    </PropertyRow>
                    <PropertyRow
                      label={selectedIsSubtitleAsset ? "字幕位置" : "文字位置"}
                    >
                      <select
                        className="cut-select cut-select--inline"
                        value={selectedTextStyle.position}
                        onChange={(event) =>
                          updateTextStyle({
                            position: event.target.value as "center" | "bottom",
                          })
                        }
                      >
                        <option value="center">居中标题</option>
                        <option value="bottom">底部字幕</option>
                      </select>
                    </PropertyRow>
                    <PropertyRow label="字幕底板">
                      <input
                        type="checkbox"
                        checked={selectedTextStyle.hasBackground}
                        onChange={(event) =>
                          updateTextStyle({
                            hasBackground: event.target.checked,
                          })
                        }
                      />
                    </PropertyRow>
                    <PropertyRow label="底板颜色">
                      <ColorControl
                        value={selectedTextStyle.backgroundColor}
                        onChange={(nextColor) =>
                          updateTextStyle({ backgroundColor: nextColor })
                        }
                      />
                    </PropertyRow>
                    <PropertyRow label="底板透明度">
                      <RangeMetricControl
                        value={selectedTextStyle.backgroundOpacity}
                        min={0.1}
                        max={0.95}
                        step={0.05}
                        displayValue={`${Math.round(
                          selectedTextStyle.backgroundOpacity * 100,
                        )}%`}
                        toInputValue={(nextValue) =>
                          String(Math.round(nextValue * 100))
                        }
                        fromInputValue={(rawValue) => Number(rawValue) / 100}
                        onChange={(nextValue) =>
                          updateTextStyle({ backgroundOpacity: nextValue })
                        }
                        onCommit={(nextValue) =>
                          updateTextStyle({ backgroundOpacity: nextValue })
                        }
                      />
                    </PropertyRow>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="cut-empty-card">
            <strong>等待选择对象</strong>
            <p>选中素材或时间轴片段后，这里会显示对应的大小、速度、音量和文字样式参数。</p>
          </div>
        )}
      </div>
    </aside>
  );
}
