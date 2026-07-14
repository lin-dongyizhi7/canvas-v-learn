import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="hero">
      <div>
        <p className="module-card__meta">404</p>
        <h2 className="hero__title">这个页面暂时迷路了。</h2>
        <p className="hero__subtitle">
          先回首页继续学习吧，别让路由问题抢了今天的知识进度。
        </p>
      </div>
      <div className="button-row">
        <Link className="button-link" to="/">
          返回首页
        </Link>
      </div>
    </section>
  );
}
