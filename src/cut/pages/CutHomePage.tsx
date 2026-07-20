import { AssetPanel } from "../components/AssetPanel";
import { CutTopbar } from "../components/CutTopbar";
import { InspectorPanel } from "../components/InspectorPanel";
import { PreviewWorkspace } from "../components/PreviewWorkspace";
import { TimelinePanel } from "../components/TimelinePanel";
import { CutEditorProvider } from "../store/editorContext";

export function CutHomePage() {
  return (
    <CutEditorProvider>
      <div className="cut-editor-page" aria-label="剪映独立工作区">
        <CutTopbar />

        <div className="cut-editor-shell">
          <AssetPanel />

          <main className="cut-editor-main">
            <div className="cut-editor-workspace">
              <PreviewWorkspace />
              <InspectorPanel />
            </div>

            <TimelinePanel />
          </main>
        </div>
      </div>
    </CutEditorProvider>
  );
}
