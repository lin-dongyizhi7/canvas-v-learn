import { useEffect, useMemo, useRef, useState } from "react";
import { useCutEditor } from "../store/editorContext";
import { defaultCutTextStyle, type CutAsset } from "../types/editor";
import { loadVideoPosterFromObjectUrl } from "../utils/media";
import {
  createSolidBackgroundDataUrl,
  resolveBackgroundStyle,
} from "../utils/background";

const assetSourceTabs = ["全部", "本地"] as const;
const assetTypeTabs = ["全部", "视频", "音频", "文字", "贴纸", "转场"] as const;
const assetTypeMap = {
  全部: null,
  视频: "video",
  音频: "audio",
  文字: "text",
  贴纸: "image",
  转场: "effect",
} as const;

function matchesAssetTypeTab(
  asset: ReturnType<typeof useCutEditor>["state"]["assetsById"][string],
  activeTypeTab: (typeof assetTypeTabs)[number],
) {
  if (activeTypeTab === "全部") {
    return true;
  }

  if (activeTypeTab === "贴纸") {
    return asset.type === "image" || asset.mimeType?.startsWith("image/");
  }

  return asset.type === assetTypeMap[activeTypeTab];
}

function isVisualAsset(
  asset: ReturnType<typeof useCutEditor>["state"]["assetsById"][string],
) {
  return asset.type === "video" || asset.mimeType?.startsWith("image/");
}

function getAssetThumbnail(
  asset: ReturnType<typeof useCutEditor>["state"]["assetsById"][string],
) {
  if (asset.mimeType?.startsWith("image/")) {
    return asset.src;
  }

  return asset.poster;
}

const quickCreateOptions = [
  "文字",
  "纯色背景",
  "字幕条",
] as const;

function createAssetId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AssetPanel() {
  const { state, dispatch } = useCutEditor();
  const pendingPosterAssetIdsRef = useRef(new Set<string>());
  const createMenuRef = useRef<HTMLDivElement>(null);
  const [activeSourceTab, setActiveSourceTab] =
    useState<(typeof assetSourceTabs)[number]>("全部");
  const [activeTypeTab, setActiveTypeTab] =
    useState<(typeof assetTypeTabs)[number]>("全部");
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const filteredAssetIds = useMemo(() => {
    return state.assetIds.filter((assetId) => {
      const asset = state.assetsById[assetId];
      const matchesSource =
        activeSourceTab === "全部" ? true : Boolean(asset.isObjectUrl);
      const matchesType = matchesAssetTypeTab(asset, activeTypeTab);

      return matchesSource && matchesType;
    });
  }, [activeSourceTab, activeTypeTab, state.assetIds, state.assetsById]);

  useEffect(() => {
    state.assetIds.forEach((assetId) => {
      const asset = state.assetsById[assetId];

      if (
        !asset ||
        asset.poster ||
        !asset.src ||
        !asset.isObjectUrl ||
        !asset.mimeType?.startsWith("video/") ||
        pendingPosterAssetIdsRef.current.has(asset.id)
      ) {
        return;
      }

      pendingPosterAssetIdsRef.current.add(asset.id);
      void loadVideoPosterFromObjectUrl(asset.src)
        .then((poster) => {
          if (!poster) {
            return;
          }

          dispatch({
            type: "updateAssetPoster",
            payload: {
              assetId: asset.id,
              poster,
            },
          });
        })
        .finally(() => {
          pendingPosterAssetIdsRef.current.delete(asset.id);
        });
    });
  }, [dispatch, state.assetIds, state.assetsById]);

  useEffect(() => {
    if (!isCreateMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (createMenuRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsCreateMenuOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCreateMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isCreateMenuOpen]);

  const createQuickAsset = (kind: (typeof quickCreateOptions)[number]) => {
    const textAssetCount = state.assetIds.filter((assetId) =>
      assetId.startsWith("asset-text-"),
    ).length;
    const backgroundAssetCount = state.assetIds.filter((assetId) =>
      assetId.startsWith("asset-bg-"),
    ).length;
    const subtitleAssetCount = state.assetIds.filter((assetId) =>
      assetId.startsWith("asset-subtitle-"),
    ).length;
    const backgroundPalette = [
      { base: "#2A55E5", accent: "#0F172A" },
      { base: "#7A5AF8", accent: "#1D2939" },
      { base: "#EF6820", accent: "#7A271A" },
    ];
    let nextAsset: CutAsset;

    if (kind === "文字") {
      nextAsset = {
        id: createAssetId("asset-text"),
        name: `标题文字 ${textAssetCount + 1}`,
        type: "text",
        duration: 4,
        sampleText: `主标题 ${textAssetCount + 1}`,
        summary: "新建的标题文字模板，适合放在片头、章节切换或重点信息位置。",
        textStyle: {
          ...defaultCutTextStyle,
        },
      };
    } else if (kind === "纯色背景") {
      const palette =
        backgroundPalette[backgroundAssetCount % backgroundPalette.length];
      const backgroundName = `纯色背景 ${backgroundAssetCount + 1}`;
      const backgroundStyle = resolveBackgroundStyle({
        color: palette.base,
        accentColor: palette.accent,
        gradientStrength: 0.85,
      });
      const backgroundSrc = createSolidBackgroundDataUrl(
        backgroundName,
        backgroundStyle,
      );
      nextAsset = {
        id: createAssetId("asset-bg"),
        name: backgroundName,
        type: "video",
        duration: 4,
        summary: "新建的纯色背景片段，适合做留白、转场衔接或字幕底板。",
        src: backgroundSrc,
        poster: backgroundSrc,
        mimeType: "image/svg+xml",
        backgroundStyle,
      };
    } else {
      nextAsset = {
        id: createAssetId("asset-subtitle"),
        name: `字幕条 ${subtitleAssetCount + 1}`,
        type: "text",
        duration: 4,
        sampleText: "这里输入字幕内容",
        summary: "新建的字幕条模板，适合对话、旁白和强调信息的底部字幕场景。",
        textStyle: {
          ...defaultCutTextStyle,
          fontSize: 26,
          position: "bottom",
          hasBackground: true,
          backgroundColor: "#0F172A",
          fontWeight: 600,
          backgroundOpacity: 0.7,
          strokeColor: "#111827",
          strokeWidth: 3,
        },
      };
    }

    dispatch({
      type: "addAsset",
      payload: {
        asset: nextAsset,
      },
    });
    setActiveSourceTab("全部");
    setIsCreateMenuOpen(false);
  };

  return (
    <aside className="cut-panel cut-asset-panel">
      <div className="cut-panel__header">
        <div>
          <p className="cut-panel__eyebrow">素材区</p>
        </div>
        <div className="cut-create-menu" ref={createMenuRef}>
          <button
            type="button"
            className="cut-button cut-button--ghost"
            aria-haspopup="menu"
            aria-expanded={isCreateMenuOpen}
            onClick={() => setIsCreateMenuOpen((currentState) => !currentState)}
          >
            新建
          </button>
          {isCreateMenuOpen ? (
            <div className="cut-create-menu__panel" role="menu" aria-label="新建素材">
              {quickCreateOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="cut-create-menu__item"
                  role="menuitem"
                  onClick={() => createQuickAsset(option)}
                >
                  <strong>{option}</strong>
                  <span>
                    {option === "文字"
                      ? "创建一个新的标题文字素材"
                      : option === "纯色背景"
                        ? "创建可直接插入时间轴的纯色底板"
                        : "创建底部字幕条模板"}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="cut-tab-row cut-tab-row--dense" aria-label="素材来源">
        {assetSourceTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`cut-tab ${activeSourceTab === tab ? "active" : ""}`}
            onClick={() => setActiveSourceTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="cut-tab-row" aria-label="素材分类">
        {assetTypeTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`cut-tab ${activeTypeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTypeTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="cut-asset-panel__body">
        {state.assetIds.length === 0 ? (
          <div className="cut-empty-card">
            <strong>素材库还是空的</strong>
            <p>
              这里后面会承接上传视频、音频、图片和文字模板。现在先把面板占住，给真正的导入能力留好位置。
            </p>
          </div>
        ) : filteredAssetIds.length === 0 ? (
          <div className="cut-empty-card">
            <strong>当前筛选下没有素材</strong>
            <p>切一下“本地 / 全部”或者素材类型，素材卡片就会重新出现。</p>
          </div>
        ) : (
          <div className="cut-asset-list">
            {filteredAssetIds.map((assetId) => {
              const asset = state.assetsById[assetId];
              const isActive = state.selectedAssetId === assetId;
              const isTextAsset = asset.type === "text";
              const isAudioAsset = asset.type === "audio";
              const showThumbnail = Boolean(getAssetThumbnail(asset));
              const thumbnailSrc = getAssetThumbnail(asset);
              const handleInsertAsset = () => {
                dispatch({
                  type: "selectAsset",
                  payload: { assetId: asset.id },
                });
                dispatch({
                  type: "insertAssetToTimeline",
                  payload: {
                    assetId: asset.id,
                    trace: {
                      requestedTime: state.currentTime,
                      assetDuration: asset.duration,
                      isImageAsset:
                        asset.type === "image" ||
                        Boolean(asset.mimeType?.startsWith("image/")),
                    },
                  },
                });
              };

              return (
                <div
                  key={asset.id}
                  className={`cut-asset-card ${isActive ? "active" : ""}`}
                >
                  <button
                    type="button"
                    className="cut-asset-card__main"
                    onClick={handleInsertAsset}
                  >
                    {isTextAsset ? (
                      <div className="cut-asset-card__thumb cut-asset-card__thumb--text">
                        <span>{asset.sampleText ?? asset.name}</span>
                      </div>
                    ) : isAudioAsset ? (
                      <div className="cut-asset-card__audio-head">
                        <span className="cut-asset-card__audio-dot" />
                        <span className="cut-asset-card__audio-label">SONG</span>
                      </div>
                    ) : showThumbnail ? (
                      <div className="cut-asset-card__thumb">
                        {thumbnailSrc ? (
                          <img
                            className="cut-asset-card__thumb-media"
                            src={thumbnailSrc}
                            alt={asset.name}
                          />
                        ) : (
                          <div className="cut-asset-card__thumb-placeholder" />
                        )}
                      </div>
                    ) : (
                      <div className="cut-asset-card__thumb cut-asset-card__thumb--placeholder">
                        <span>{isVisualAsset(asset) ? "MEDIA" : asset.type.toUpperCase()}</span>
                      </div>
                    )}
                    <div className="cut-asset-card__info-row">
                      <span className="cut-asset-card__type">{asset.type}</span>
                      <span className="cut-asset-card__meta">{asset.duration}s</span>
                    </div>
                    <strong>{asset.name}</strong>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="cut-asset-panel__stats">
        <div className="cut-stat-card">
          <span>素材总数</span>
          <strong>{state.assetIds.length}</strong>
        </div>
        <div className="cut-stat-card">
          <span>当前筛选</span>
          <strong>{filteredAssetIds.length}</strong>
        </div>
      </div>
    </aside>
  );
}
