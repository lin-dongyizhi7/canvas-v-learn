import { NavLink } from "react-router-dom";
import { moduleRouteMeta } from "../data/modules";
import type { PropsWithChildren } from "react";

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <h1>Learn Lab</h1>
          <p>
            一个给前端多媒体与图形方向准备的学习站，主打能看、能改、能练。
          </p>
        </div>

        <section className="sidebar__section">
          <h2 className="sidebar__title">总览</h2>
          <div className="nav-list">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              首页与路线图
            </NavLink>
            <NavLink
              to="/leetcode"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              LeetCode 跳转页
            </NavLink>
          </div>
        </section>

        <section className="sidebar__section">
          <h2 className="sidebar__title">学习模块</h2>
          <div className="nav-list">
            {moduleRouteMeta.map((item) => (
              <NavLink
                key={item.id}
                to={item.href}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <strong>{item.label}</strong>
                <div className="muted">{item.description}</div>
              </NavLink>
            ))}
          </div>
        </section>

        <section className="sidebar__section">
          <h2 className="sidebar__title">使用方式</h2>
          <div className="nav-list">
            <div className="nav-link">
              <strong>先看概念</strong>
              <div className="muted">每个模块先读总述和核心章节。</div>
            </div>
            <div className="nav-link">
              <strong>再改代码</strong>
              <div className="muted">代码块可编辑，可直接运行或复制。</div>
            </div>
            <div className="nav-link">
              <strong>最后刷题</strong>
              <div className="muted">到 LeetCode 页跳转做练习闭环。</div>
            </div>
          </div>
        </section>
      </aside>

      <main className="page">{children}</main>
    </div>
  );
}
