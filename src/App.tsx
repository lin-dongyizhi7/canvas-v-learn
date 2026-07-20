import { Route, Routes, useLocation } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { CutHomePage } from "./cut/pages/CutHomePage";
import { HomePage } from "./pages/HomePage";
import { InterviewPage } from "./pages/InterviewPage";
import { LeetCodePage } from "./pages/LeetCodePage";
import { ModulePage } from "./pages/ModulePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { SectionPage } from "./pages/SectionPage";
import { VideoEditorDemoPage } from "./pages/VideoEditorDemoPage";
import { VideoPlayerDemoPage } from "./pages/VideoPlayerDemoPage";

export default function App() {
  const location = useLocation();
  const isCutRoute = location.pathname.startsWith("/cut");

  const routes = (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cut" element={<CutHomePage />} />
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
  );

  // `/cut` 作为独立工具入口，先脱离学习站主框架，避免侧边栏和内容布局干扰空白工作区。
  if (isCutRoute) {
    return routes;
  }

  return (
    <AppLayout>
      {routes}
    </AppLayout>
  );
}
