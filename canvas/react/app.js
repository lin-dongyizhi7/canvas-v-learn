const { useEffect, useMemo, useRef, useState } = React;

function App() {
  const lessons = window.CanvasCourseData.lessons;
  const codeMap = window.CanvasCourseData.exampleSources.react;
  const [currentLessonId, setCurrentLessonId] = useState(lessons[0].id);
  const [renderTick, setRenderTick] = useState(0);
  const canvasRef = useRef(null);
  const lifecycleRef = useRef({
    cleanup() {},
    clearPractice() {},
  });

  const currentLesson = useMemo(
    () => lessons.find((item) => item.id === currentLessonId) || lessons[0],
    [currentLessonId, lessons],
  );

  useEffect(() => {
    lifecycleRef.current.cleanup();
    lifecycleRef.current = window.CanvasDemoEngine.mountLesson(canvasRef.current, currentLesson.id);

    return () => {
      lifecycleRef.current.cleanup();
    };
  }, [currentLesson.id, renderTick]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <h2>React 学习站</h2>
          <p>React 负责状态切换，Canvas 负责每一帧像素，组合起来相当顺手。</p>
        </div>
        <div className="doc-links">
          <a href="../index.html">返回总入口</a>
          <a href="../docs/index.html">文档菜单</a>
        </div>
        <div className="menu-list">
          {lessons.map((lesson) => (
            <article
              key={lesson.id}
              className={`menu-item ${lesson.id === currentLessonId ? "active" : ""}`}
              onClick={() => setCurrentLessonId(lesson.id)}
            >
              <strong>{lesson.title}</strong>
              <span className="muted">{lesson.summary}</span>
            </article>
          ))}
        </div>
      </aside>

      <main className="main">
        <section className="panel">
          <h2>{currentLesson.title} · React</h2>
          <p className="muted">
            {currentLesson.summary} 示例文件：{currentLesson.exampleFiles.react}
          </p>
          <div className="tag-list">
            {currentLesson.apis.map((api) => (
              <span key={api} className="tag">
                {api}
              </span>
            ))}
          </div>
        </section>

        <div className="panel-layout">
          <section className="panel canvas-wrap">
            <h2>预览画布</h2>
            <canvas ref={canvasRef} className="canvas-stage" width="420" height="240"></canvas>
            <p className="muted">练习章节支持直接涂鸦，正适合把手感练出来。</p>
            <div className="practice-toolbar">
              <button onClick={() => setRenderTick((value) => value + 1)}>重绘当前示例</button>
              <button className="secondary" onClick={() => lifecycleRef.current.clearPractice()}>
                清空练习画布
              </button>
            </div>
          </section>

          <section className="panel">
            <h2>概念讲解</h2>
            <ul className="info-list">
              {currentLesson.concepts.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2>学习目标</h2>
            <ul className="info-list">
              {currentLesson.goals.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2>练习建议</h2>
            <ul className="exercise-list">
              {currentLesson.practice.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="code-panel">
          <pre>
            <code>{codeMap[currentLesson.id]}</code>
          </pre>
        </section>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.querySelector("#app")).render(<App />);
