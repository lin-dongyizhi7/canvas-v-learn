import { Link, Navigate, useParams } from "react-router-dom";
import { learningModules } from "../data/modules";
import { ExperimentLab } from "../components/ExperimentLab";
import { SectionCard } from "../components/SectionCard";

export function ModulePage() {
  const params = useParams<{ moduleId: string }>();
  const module = learningModules.find((item) => item.id === params.moduleId);

  if (!module) {
    return <Navigate to="/" replace />;
  }

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
            <a key={section.id} href={`#${section.id}`} className="section-link">
              {section.title}
            </a>
          ))}
        </div>
      </section>

      <section className="stack">
        {module.sections.map((section) => (
          <SectionCard key={section.id} section={section} />
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
