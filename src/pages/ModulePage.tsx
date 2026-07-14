import { Link, Navigate, useParams } from "react-router-dom";
import {
  buildSectionPath,
  getModuleById,
} from "../data/modules";
import { ExperimentLab } from "../components/ExperimentLab";
import { moduleKnowledgeMap } from "../data/knowledge";

export function ModulePage() {
  const params = useParams<{ moduleId: string }>();
  const module = getModuleById(params.moduleId);

  if (!module) {
    return <Navigate to="/" replace />;
  }

  const knowledge = moduleKnowledgeMap[module.id];

  return (
    <>
      <section className="hero">
        <div>
          <p className="module-card__meta">{module.badge}</p>
          <h2 className="hero__title">{module.title}</h2>
          <p className="hero__subtitle">{module.description}</p>
        </div>

        <div>
          <h3>学习总述</h3>
          <p className="muted">{module.overview}</p>
          <ul>
            {module.outcomes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="section-links">
          {module.sections.map((section) => (
            <Link
              key={section.id}
              to={buildSectionPath(module.id, section.id)}
              className="section-link"
            >
              {section.title}
            </Link>
          ))}
        </div>
      </section>

      {knowledge ? (
        <>
          <section className="panel" style={{ marginTop: 24 }}>
            <h2 className="panel__title">知识地图</h2>
            <div className="knowledge-grid">
              {knowledge.mustKnow.map((block) => (
                <article key={block.title} className="knowledge-card">
                  <h3>{block.title}</h3>
                  <ul>
                    {block.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="panel" style={{ marginTop: 24 }}>
            <h2 className="panel__title">工程实践提醒</h2>
            <div className="knowledge-grid">
              {knowledge.engineeringNotes.map((block) => (
                <article key={block.title} className="knowledge-card">
                  <h3>{block.title}</h3>
                  <ul>
                    {block.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="panel" style={{ marginTop: 24 }}>
            <h2 className="panel__title">模块面试提要</h2>
            <div className="faq-list">
              {knowledge.interviewHighlights.map((item) => (
                <article key={item.question} className="faq-item">
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                  <div className="tag-row">
                    {item.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}

      <section className="stack">
        {module.sections.map((section) => (
          <article key={section.id} className="section-card">
            <h2 className="section-card__title">{section.title}</h2>
            <p className="muted">{section.summary}</p>

            <div className="tag-row" style={{ marginTop: 12 }}>
              {section.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>

            <div className="section-card__grid section-card__grid--overview">
              <div>
                <h3>这节会学什么</h3>
                <ul>
                  {section.concepts.slice(0, 3).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>进入章节</h3>
                <p className="muted">
                  独立路由后，这一节会有自己的链接、编辑器和预览区域，复习时不再挤成一团。
                </p>
                <div className="button-row" style={{ marginTop: 16 }}>
                  <Link
                    className="button-link"
                    to={buildSectionPath(module.id, section.id)}
                  >
                    进入本章
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {module.experimentLab ? (
        <ExperimentLab config={module.experimentLab} />
      ) : null}

      <section className="panel" style={{ marginTop: 24 }}>
        <h2 className="panel__title">延伸资源</h2>
        <div className="resource-list">
          {module.resources.map((resource) => (
            <article key={resource.href} className="resource-card">
              <h3>{resource.label}</h3>
              <p className="muted">{resource.description}</p>
              <div className="button-row" style={{ marginTop: 12 }}>
                <a
                  className="button-link"
                  href={resource.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  打开资源
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <p className="footer-tip">
        学完这个模块后，建议顺手去 <Link to="/leetcode">LeetCode
        跳转页</Link> 做几题相关练习，防止知识点刚认识你，转头就装作不熟。
      </p>
    </>
  );
}
