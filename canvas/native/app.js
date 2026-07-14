const nativeLessons = window.CanvasCourseData.lessons;
const nativeSourceMap = window.CanvasCourseData.exampleSources.native;

const menuElement = document.querySelector("#lesson-menu");
const titleElement = document.querySelector("#lesson-title");
const summaryElement = document.querySelector("#lesson-summary");
const apiElement = document.querySelector("#lesson-apis");
const conceptElement = document.querySelector("#lesson-concepts");
const goalElement = document.querySelector("#lesson-goals");
const practiceElement = document.querySelector("#lesson-practice");
const codeElement = document.querySelector("#lesson-code");
const canvasElement = document.querySelector("#lesson-canvas");
const resetButton = document.querySelector("#reset-preview");
const clearPracticeButton = document.querySelector("#clear-practice");

let currentLessonId = nativeLessons[0].id;
let currentLifecycle = {
  cleanup() {},
  clearPractice() {},
};

function fillList(container, items) {
  container.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

function fillApis(items) {
  apiElement.innerHTML = items.map((item) => `<span class="tag">${item}</span>`).join("");
}

function renderMenu() {
  menuElement.innerHTML = nativeLessons
    .map((lesson) => {
      const activeClass = lesson.id === currentLessonId ? "menu-item active" : "menu-item";
      return `
        <article class="${activeClass}" data-lesson-id="${lesson.id}">
          <strong>${lesson.title}</strong>
          <span class="muted">${lesson.summary}</span>
        </article>
      `;
    })
    .join("");

  menuElement.querySelectorAll("[data-lesson-id]").forEach((node) => {
    node.addEventListener("click", () => {
      currentLessonId = node.dataset.lessonId;
      renderPage();
    });
  });
}

function renderPage() {
  const lesson = nativeLessons.find((item) => item.id === currentLessonId);
  if (!lesson) {
    return;
  }

  currentLifecycle.cleanup();
  currentLifecycle = window.CanvasDemoEngine.mountLesson(canvasElement, lesson.id);

  titleElement.textContent = `${lesson.title} · 原生 JS`;
  summaryElement.textContent = `${lesson.summary} 示例文件：${lesson.exampleFiles.native}`;
  fillApis(lesson.apis);
  fillList(conceptElement, lesson.concepts);
  fillList(goalElement, lesson.goals);
  fillList(practiceElement, lesson.practice);
  codeElement.textContent = nativeSourceMap[lesson.id];
  renderMenu();
}

resetButton.addEventListener("click", () => {
  renderPage();
});

clearPracticeButton.addEventListener("click", () => {
  currentLifecycle.clearPractice();
});

renderPage();
