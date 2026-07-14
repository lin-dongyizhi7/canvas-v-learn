import { useMemo, useState } from "react";
import { MonacoCodeEditor } from "./MonacoCodeEditor";

interface CodePlaygroundProps {
  title: string;
  description: string;
  initialCode: string;
  runnable?: boolean;
  language: "html" | "ts";
}

export function CodePlayground({
  title,
  description,
  initialCode,
  runnable = false,
  language,
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [previewCode, setPreviewCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);

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

  return (
    <section className="playground">
      <h3 className="playground__title">{title}</h3>
      <p className="muted">{description}</p>

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
      </div>

      <MonacoCodeEditor
        value={code}
        language={language === "ts" ? "typescript" : "html"}
        onChange={setCode}
      />

      {!runnable && placeholder ? (
        <p className="footer-tip" style={{ marginTop: 10 }}>
          {placeholder}
        </p>
      ) : null}

      {runnable ? (
        <iframe
          className="preview-frame"
          title={title}
          sandbox="allow-scripts"
          srcDoc={previewCode}
          style={{ marginTop: 16 }}
        />
      ) : (
        <div className="panel" style={{ marginTop: 16 }}>
          <strong>运行提示</strong>
          <p className="muted" style={{ marginTop: 8 }}>
            这段代码更适合复制到真实项目里练习，例如在 React 组件、Worker
            或服务端脚本中使用。这里先让它保持可编辑，免得知识刚进门就被运行环境拦下。
          </p>
        </div>
      )}
    </section>
  );
}
