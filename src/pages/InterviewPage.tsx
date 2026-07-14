import { interviewGroups } from "../data/knowledge";

export function InterviewPage() {
  return (
    <>
      <section className="hero">
        <div>
          <p className="module-card__meta">面试常见问题</p>
          <h2 className="hero__title">把“会用”再往前推一步，整理成“能讲清楚”。</h2>
          <p className="hero__subtitle">
            这里汇总了 Canvas、WebCodecs、Web Audio、WebGL、FFmpeg
            相关的常见面试问题与回答思路，重点不是背诵，而是帮你形成成体系的表达。
          </p>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 24 }}>
        <h2 className="panel__title">答题建议</h2>
        <ul>
          <li>先讲原理，再讲适用场景，最后落到真实项目取舍，回答会更有工程味。</li>
          <li>遇到“为什么不用别的方案”时，不要慌，这通常是在考你边界感。</li>
          <li>能说出性能瓶颈、兼容性差异和资源管理细节，通常就已经比背 API 强很多。</li>
        </ul>
      </section>

      <section className="stack">
        {interviewGroups.map((group) => (
          <article key={group.id} className="section-card">
            <h2 className="section-card__title">{group.title}</h2>
            <p className="muted">{group.intro}</p>

            <div className="faq-list">
              {group.questions.map((item) => (
                <section key={item.question} className="faq-item">
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                  <div className="tag-row">
                    {item.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
