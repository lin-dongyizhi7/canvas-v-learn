import { useEffect, useMemo, useState } from "react";
import { MonacoCodeEditor } from "./MonacoCodeEditor";

interface CodePlaygroundProps {
  title: string;
  description: string;
  initialCode: string;
  runnable?: boolean;
  language: "html" | "ts";
  storageKey?: string;
}

export function CodePlayground({
  title,
  description,
  initialCode,
  runnable = false,
  language,
  storageKey,
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [previewCode, setPreviewCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const collapseStorageKey = storageKey
    ? `learn-playground-collapsed:${storageKey}`
    : "";
  // 首次渲染时从 localStorage 恢复收起状态，刷新后也不会丢
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    if (!collapseStorageKey) {
      return false;
    }

    return window.localStorage.getItem(collapseStorageKey) === "1";
  });

  const placeholder = useMemo(() => {
    if (runnable) {
      return "";
    }

    return language === "ts"
      ? "当前示例用于阅读和迁移，不会直接在 iframe 运行。"
      : "当前示例为说明性代码。";
  }, [language, runnable]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  useEffect(() => {
    if (!collapseStorageKey) {
      return;
    }

    window.localStorage.setItem(collapseStorageKey, collapsed ? "1" : "0");
  }, [collapsed, collapseStorageKey]);

  return (
    <section className="playground">
      <h3 className="playground__title">{title}</h3>
      <p className="muted">{description}</p>

      {!collapsed ? (
        <div className="button-row" style={{ margin: "14px 0" }}>
          {runnable ? (
            <button onClick={() => setPreviewCode(code)}>运行预览</button>
          ) : (
            <button className="secondary" type="button">
              说明型代码
            </button>
          )}
          <button
            className="secondary"
            onClick={() => {
              setCode(initialCode);
              setPreviewCode(initialCode);
            }}
          >
            重置代码
          </button>
          <button className="secondary" onClick={handleCopy}>
            {copied ? "已复制" : "复制代码"}
          </button>
          <button
            className="secondary"
            onClick={() => setCollapsed((value) => !value)}
          >
            收起练习区
          </button>
        </div>
      ) : null}

      {!collapsed ? (
        <div className="playground__workspace">
          <section className="playground__pane">
            <div className="playground__pane-header">
              <strong>代码编辑区</strong>
              <span className="muted">
                {language === "ts" ? "TypeScript" : "HTML"}
              </span>
            </div>
            <MonacoCodeEditor
              value={code}
              language={language === "ts" ? "typescript" : "html"}
              height="640px"
              onChange={setCode}
            />
          </section>

          <section className="playground__pane">
            <div className="playground__pane-header">
              <strong>{runnable ? "实时预览区" : "说明与迁移区"}</strong>
              <span className="muted">
                {runnable ? "运行后在右侧查看结果" : "当前示例默认不直接执行"}
              </span>
            </div>
            {runnable ? (
              <iframe
                className="preview-frame"
                title={title}
                sandbox="allow-scripts"
                srcDoc={previewCode}
              />
            ) : (
              <div className="playground__placeholder">
                <strong>运行提示</strong>
                <p className="muted" style={{ marginTop: 8 }}>
                  这段代码更适合复制到真实项目里练习，例如在 React 组件、Worker
                  或服务端脚本中使用。这里先保持可编辑，让你能先改结构、改参数、改思路。
                </p>
                {placeholder ? (
                  <p className="footer-tip" style={{ marginTop: 10 }}>
                    {placeholder}
                  </p>
                ) : null}
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="playground__collapsed-tip">
          <div>
            <strong>练习区已收到底部</strong>
            <p>刷新页面后仍会保持当前状态。准备动手时，展开它继续写代码和看预览。</p>
          </div>
          <button
            className="playground__collapsed-button"
            type="button"
            onClick={() => setCollapsed(false)}
          >
            展开练习区
          </button>
        </div>
      )}
    </section>
  );
}
