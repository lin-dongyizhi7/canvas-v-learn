import type { SectionContent } from "../data/modules";
import {
  getSectionApiReferences,
  getSectionPlayground,
} from "../data/section-support";
import { CodePlayground } from "./CodePlayground";

interface SectionCardProps {
  section: SectionContent;
}

export function SectionCard({ section }: SectionCardProps) {
  const keyApis = getSectionApiReferences(section.id);
  const playground = getSectionPlayground(section);

  return (
    <section id={section.id} className="section-card">
      <div className="section-card__body">
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

          {keyApis.length > 0 ? (
            <>
              <h3>关键 API</h3>
              <div className="api-grid">
                {keyApis.map((api) => (
                  <article key={api.name} className="api-card">
                    <strong>{api.name}</strong>
                    <p>{api.description}</p>
                  </article>
                ))}
              </div>
            </>
          ) : null}

          <h3>练习建议</h3>
          <ul>
            {section.practice.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="section-card__playground">
          <CodePlayground
            key={section.id}
            storageKey={section.id}
            {...playground}
          />
        </div>
      </div>
    </section>
  );
}
