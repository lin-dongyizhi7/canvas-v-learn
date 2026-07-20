import { useRef, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { useCutEditor } from "../store/editorContext";
import { loadVideoPosterFromObjectUrl } from "../utils/media";

type CutImportDebugData = Record<string, boolean | number | string | undefined>;

function reportCutImportDebug(
  hypothesisId: string,
  msg: string,
  data: CutImportDebugData,
) {
  // #region debug-point A:image-import
  fetch("http://127.0.0.1:7777/event", { method: "POST", body: JSON.stringify({ sessionId: "cut-timeline-debug", runId: "pre-fix", hypothesisId, location: "src/cut/components/CutTopbar.tsx", msg: `[DEBUG] ${msg}`, data, ts: Date.now() }) }).catch(() => undefined);
  // #endregion
}

function inferAssetType(file: File) {
  if (file.type.startsWith("video/")) {
    return "video" as const;
  }

  if (file.type.startsWith("audio/")) {
    return "audio" as const;
  }

  if (file.type.startsWith("image/")) {
    return "video" as const;
  }

  if (file.type === "text/plain" || file.name.endsWith(".srt")) {
    return "text" as const;
  }

  return "effect" as const;
}

export function CutTopbar() {
  const { state, dispatch } = useCutEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    reportCutImportDebug("A", "import file batch received", {
      fileCount: files.length,
    });

    await Promise.all(
      files.map(async (file, index) => {
        const assetType = inferAssetType(file);
        const objectUrl = URL.createObjectURL(file);
        const assetId = `asset-import-${Date.now()}-${index}`;
        // 图片素材统一映射成 3 秒视频片段，后续插入时间轴时就能走同一套视频轨逻辑。
        const isImportedImage = file.type.startsWith("image/");
        const isImportedVideo = file.type.startsWith("video/");
        const assetDuration =
          assetType === "text" ? 4 : isImportedImage ? 3 : 12;
        const assetSummary = isImportedImage
          ? `本地图片已转换为 3 秒静帧视频，文件大小 ${(file.size / 1024 / 1024).toFixed(2)} MB`
          : `本地导入素材，文件大小 ${(file.size / 1024 / 1024).toFixed(2)} MB`;
        const assetPoster = isImportedVideo
          ? await loadVideoPosterFromObjectUrl(objectUrl)
          : undefined;

        reportCutImportDebug("A", "asset import mapping resolved", {
          index,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          isImportedImage,
          isImportedVideo,
          inferredAssetType: assetType,
          assetDuration,
          assetId,
          hasObjectUrl: Boolean(objectUrl),
          hasPoster: Boolean(assetPoster),
        });

        dispatch({
          type: "addAsset",
          payload: {
            asset: {
              id: assetId,
              name: file.name,
              type: assetType,
              duration: assetDuration,
              summary: assetSummary,
              src: objectUrl,
              poster: assetPoster,
              mimeType: file.type,
              isObjectUrl: true,
            },
          },
        });

        reportCutImportDebug("A", "addAsset dispatched for imported asset", {
          assetId,
          assetType,
          assetDuration,
          mimeType: file.type,
          isObjectUrl: true,
          hasPoster: Boolean(assetPoster),
        });
      }),
    );

    event.target.value = "";
  };

  return (
    <header className="cut-topbar">
      <input
        ref={fileInputRef}
        hidden
        multiple
        type="file"
        accept="video/*,audio/*,image/*,.srt,.txt"
        onChange={handleFileChange}
      />
      <div className="cut-topbar__brand">
        <Link className="cut-topbar__back" to="/" aria-label="返回学习站首页">
          ←
        </Link>
        <div>
          <strong>{state.projectName}</strong>
          <span>Cut Studio</span>
        </div>
      </div>

      <nav className="cut-topbar__actions" aria-label="剪辑器顶部工具栏">
        <button
          type="button"
          className="cut-button cut-button--ghost"
          onClick={handleImportClick}
        >
          导入素材
        </button>
        <button
          type="button"
          className="cut-button"
          onClick={() => dispatch({ type: "togglePlayback" })}
        >
          {state.isPlaying ? "暂停预览" : "播放预览"}
        </button>
        <button type="button" className="cut-button cut-button--primary">
          导出
        </button>
      </nav>
    </header>
  );
}
