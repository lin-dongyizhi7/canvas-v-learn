import type { SectionContent } from "../data/modules";
import { CodePlayground } from "./CodePlayground";

interface SectionCardProps {
  section: SectionContent;
}

export function SectionCard({ section }: SectionCardProps) {
  return (
    <section id={section.id} className="section-card">
      <div className="section-card__grid">
        <div>
          <h2 className="section-card__title">{section.title}</h2>
          <p className="muted">{section.summary}</p>

          <div className="tag-row" style={{ marginTop: 12 }}>
            {section.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>

          <h3>关键概念</h3>
          <ul>
            {section.concepts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h3>练习建议</h3>
          <ul>
            {section.practice.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          {section.playground ? (
            <CodePlayground {...section.playground} />
          ) : (
            <div className="panel">
              <h3 style={{ marginTop: 0 }}>这一节怎么练</h3>
              <p className="muted">
                这一节我先保留成知识卡片，让你把概念打牢后再自己补代码。很多高级 API
                不是不能立刻跑，而是太早跑会让人先被环境细节打懵。
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
