import Editor from "@monaco-editor/react";

interface MonacoCodeEditorProps {
  value: string;
  language: "html" | "typescript";
  height?: string;
  onChange: (value: string) => void;
}

export function MonacoCodeEditor({
  value,
  language,
  height = "600px",
  onChange,
}: MonacoCodeEditorProps) {
  return (
    <div className="monaco-shell">
      <Editor
        height={height}
        language={language}
        value={value}
        theme="vs-dark"
        loading={<div className="monaco-loading">Monaco 编辑器加载中...</div>}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 22,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: "on",
          tabSize: 2,
          padding: {
            top: 12,
            bottom: 12,
          },
        }}
        onChange={(nextValue) => {
          // Monaco 的 onChange 可能给出 undefined，这里统一兜成空字符串
          onChange(nextValue ?? "");
        }}
      />
    </div>
  );
}
