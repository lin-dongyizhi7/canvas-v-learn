import { Link } from "react-router-dom";
import { learningModules } from "../data/modules";

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div>
          <p className="module-card__meta">React + TypeScript 学习网站</p>
          <h2 className="hero__title">
            从 Canvas 到 FFmpeg，把前端图形与多媒体这条线系统补起来。
          </h2>
          <p className="hero__subtitle">
            这不是单篇笔记，而是一整个学习实验室：有知识地图、有可编辑代码块、有练习建议，还有 LeetCode
            跳转页，帮你把“看懂”推进到“能写、能改、能继续扩展”。
          </p>
        </div>

        <div className="button-row">
          <Link className="button-link" to="/module/canvas">
            先学 Canvas
          </Link>
          <Link className="button-link" to="/interview">
            看面试题库
          </Link>
          <Link className="button-link" to="/leetcode">
            去刷题闭环
          </Link>
        </div>
      </section>

      <section className="metrics-grid">
        <article className="metric-card">
          <h3>5 大技术模块</h3>
          <p className="muted">Canvas、WebCodecs、Web Audio、WebGL、FFmpeg。</p>
        </article>
        <article className="metric-card">
          <h3>可编辑代码块</h3>
          <p className="muted">关键模块配了可改可运行的示例，别只盯着看，动手才长肌肉。</p>
        </article>
        <article className="metric-card">
          <h3>练习闭环</h3>
          <p className="muted">章节练习 + LeetCode 跳转页，减少学完就散架的尴尬。</p>
        </article>
        <article className="metric-card">
          <h3>面试题沉淀</h3>
          <p className="muted">新增一整页高频问题，帮你把知识整理成可表达的答案。</p>
        </article>
      </section>

      <section className="panel stack">
        <div>
          <h2 className="panel__title">学习路线图</h2>
          <ul>
            <li>先学 Canvas 和 Web Audio，建立浏览器图形与媒体的感性认知。</li>
            <li>再进 WebGL 和 WebCodecs，进入更底层的 GPU 与编解码世界。</li>
            <li>最后把 FFmpeg 拉进来，形成完整媒体处理链路。</li>
          </ul>
        </div>
      </section>

      <section className="module-grid">
        {learningModules.map((module) => (
          <article key={module.id} className="module-card">
            <span className="module-card__meta">{module.badge}</span>
            <h3>{module.title}</h3>
            <p className="muted">{module.description}</p>
            <ul>
              {module.outcomes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="button-row" style={{ marginTop: 16 }}>
              <Link className="button-link" to={`/module/${module.id}`}>
                进入学习
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="challenge-grid">
        <article className="challenge-card">
          <h3>建议先做的练习</h3>
          <p className="muted">适合用来热身，不会一上来就把人打懵。</p>
          <ul>
            <li>Canvas：做一个带鼠标吸附的粒子背景。</li>
            <li>Web Audio：做一个频谱可视化播放器。</li>
            <li>WebGL：用 shader 画一个会变色的三角形。</li>
          </ul>
        </article>
        <article className="challenge-card">
          <h3>进阶练习</h3>
          <p className="muted">开始有工程味道，也更接近真实业务。</p>
          <ul>
            <li>WebCodecs：做编解码支持探测和降级方案。</li>
            <li>FFmpeg：设计上传后转码、抽帧、进度展示链路。</li>
            <li>LeetCode：按图、树、DP 三条线补算法底子。</li>
          </ul>
        </article>
      </section>
    </>
  );
}
