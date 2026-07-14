const { createApp, ref, computed, onMounted, watch, nextTick } = Vue;

createApp({
  setup() {
    const lessons = window.CanvasCourseData.lessons;
    const codeMap = window.CanvasCourseData.exampleSources.vue;
    const currentLessonId = ref(lessons[0].id);
    const canvasRef = ref(null);
    let lifecycle = {
      cleanup() {},
      clearPractice() {},
    };

    const currentLesson = computed(
      () => lessons.find((item) => item.id === currentLessonId.value) || lessons[0],
    );

    const renderCanvas = async () => {
      lifecycle.cleanup();
      await nextTick();
      lifecycle = window.CanvasDemoEngine.mountLesson(canvasRef.value, currentLesson.value.id);
    };

    onMounted(renderCanvas);
    watch(currentLessonId, renderCanvas);

    return {
      lessons,
      canvasRef,
      currentLessonId,
      currentLesson,
      getCode() {
        return codeMap[currentLesson.value.id];
      },
      resetPreview() {
        renderCanvas();
      },
      clearPractice() {
        lifecycle.clearPractice();
      },
    };
  },
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <h2>Vue 学习站</h2>
          <p>用 Vue 管理章节状态，用 Canvas 负责真正绘图，职责分工相当体面。</p>
        </div>
        <div class="doc-links">
          <a href="../index.html">返回总入口</a>
          <a href="../docs/index.html">文档菜单</a>
        </div>
        <div class="menu-list">
          <article
            v-for="lesson in lessons"
            :key="lesson.id"
            :class="['menu-item', { active: lesson.id === currentLessonId }]"
            @click="currentLessonId = lesson.id"
          >
            <strong>{{ lesson.title }}</strong>
            <span class="muted">{{ lesson.summary }}</span>
          </article>
        </div>
      </aside>

      <main class="main">
        <section class="panel">
          <h2>{{ currentLesson.title }} · Vue</h2>
          <p class="muted">
            {{ currentLesson.summary }} 示例文件：{{ currentLesson.exampleFiles.vue }}
          </p>
          <div class="tag-list">
            <span v-for="api in currentLesson.apis" :key="api" class="tag">{{ api }}</span>
          </div>
        </section>

        <div class="panel-layout">
          <section class="panel canvas-wrap">
            <h2>预览画布</h2>
            <canvas ref="canvasRef" class="canvas-stage" width="420" height="240"></canvas>
            <p class="muted">切到练习模块时，你可以直接在这个画布上画线。</p>
            <div class="practice-toolbar">
              <button @click="resetPreview">重绘当前示例</button>
              <button class="secondary" @click="clearPractice">清空练习画布</button>
            </div>
          </section>

          <section class="panel">
            <h2>概念讲解</h2>
            <ul class="info-list">
              <li v-for="item in currentLesson.concepts" :key="item">{{ item }}</li>
            </ul>

            <h2>学习目标</h2>
            <ul class="info-list">
              <li v-for="item in currentLesson.goals" :key="item">{{ item }}</li>
            </ul>

            <h2>练习建议</h2>
            <ul class="exercise-list">
              <li v-for="item in currentLesson.practice" :key="item">{{ item }}</li>
            </ul>
          </section>
        </div>

        <section class="code-panel">
          <pre><code>{{ getCode() }}</code></pre>
        </section>
      </main>
    </div>
  `,
}).mount("#app");
