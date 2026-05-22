import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export function DiffViewer({ code }: { code: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
      <SyntaxHighlighter
        language="diff"
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "14px",
          fontSize: "12px",
          background: "transparent",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
