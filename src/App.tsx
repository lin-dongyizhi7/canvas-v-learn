import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { HomePage } from "./pages/HomePage";
import { InterviewPage } from "./pages/InterviewPage";
import { LeetCodePage } from "./pages/LeetCodePage";
import { ModulePage } from "./pages/ModulePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { SectionPage } from "./pages/SectionPage";
import { VideoEditorDemoPage } from "./pages/VideoEditorDemoPage";
import { VideoPlayerDemoPage } from "./pages/VideoPlayerDemoPage";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/leetcode" element={<LeetCodePage />} />
        <Route path="/demo/video-editor" element={<VideoEditorDemoPage />} />
        <Route path="/demo/video-player" element={<VideoPlayerDemoPage />} />
        <Route path="/module/:moduleId" element={<ModulePage />} />
        <Route
          path="/module/:moduleId/section/:sectionId"
          element={<SectionPage />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
}
