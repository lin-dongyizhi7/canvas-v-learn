import { leetCodeGroups } from "../data/modules";

export function LeetCodePage() {
  return (
    <>
      <section className="hero">
        <div>
          <p className="module-card__meta">LeetCode 练习跳转</p>
          <h2 className="hero__title">把知识点转成手感，别让它们只停留在“我好像懂”。</h2>
          <p className="hero__subtitle">
            这里按主题给你整理了一组适合前端工程师补底子的题目。点开就能跳转到对应题目页。
          </p>
        </div>
      </section>

      <section className="challenge-grid">
        {leetCodeGroups.map((group) => (
          <article key={group.title} className="challenge-card">
            <h3>{group.title}</h3>
            <p className="muted">{group.description}</p>
            <div className="nav-list">
              {group.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="nav-link"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="panel" style={{ marginTop: 24 }}>
        <h2 className="panel__title">刷题建议</h2>
        <ul>
          <li>不要只看题解，先自己写一个最笨但正确的版本。</li>
          <li>写完后回头想：这个状态能不能压缩？这个结构能不能抽象？</li>
          <li>刷题不是为了背答案，而是为了让你在建模时不容易脑子打结。</li>
        </ul>
      </section>
    </>
  );
}
