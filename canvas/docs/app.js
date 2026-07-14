const docLessons = window.CanvasCourseData.lessons;
const docMenuElement = document.querySelector("#doc-menu");
const docContentElement = document.querySelector("#doc-content");

docMenuElement.innerHTML = docLessons
  .map(
    (lesson) => `
      <a class="doc-link" href="#${lesson.docAnchor}">
        <strong>${lesson.title}</strong><br />
        <span class="muted">${lesson.summary}</span>
      </a>
    `,
  )
  .join("");

docContentElement.innerHTML = docLessons
  .map(
    (lesson) => `
      <section id="${lesson.docAnchor}" class="doc-panel doc-section">
        <h2>${lesson.title}</h2>
        <p class="muted">${lesson.summary}</p>

        <h3>核心概念</h3>
        <ul class="info-list">
          ${lesson.concepts.map((item) => `<li>${item}</li>`).join("")}
        </ul>

        <h3>重点 API</h3>
        <div class="tag-list">
          ${lesson.apis.map((item) => `<span class="tag">${item}</span>`).join("")}
        </div>

        <h3>学习目标</h3>
        <ul class="info-list">
          ${lesson.goals.map((item) => `<li>${item}</li>`).join("")}
        </ul>

        <h3>练习建议</h3>
        <ul class="exercise-list">
          ${lesson.practice.map((item) => `<li>${item}</li>`).join("")}
        </ul>

        <h3>示例代码文件</h3>
        <ul class="info-list">
          <li>原生 JS：${lesson.exampleFiles.native}</li>
          <li>Vue：${lesson.exampleFiles.vue}</li>
          <li>React：${lesson.exampleFiles.react}</li>
        </ul>
      </section>
    `,
  )
  .join("");
