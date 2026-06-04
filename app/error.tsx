"use client";

import * as React from "react";

// Root-level error boundary. Catches errors thrown anywhere below the root
// layout — including the (dashboard) layout chain (StoreProvider, Sidebar,
// UserMenu). Shows the REAL error message instead of Next.js's generic
// "Application error" so failures are diagnosable in production.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[app/error] caught:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: 20, fontWeight: 600 }}>页面加载出错</h1>
      <pre
        style={{
          maxWidth: 600,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          background: "#f4f4f5",
          color: "#dc2626",
          padding: 16,
          borderRadius: 8,
          fontSize: 13,
          textAlign: "left",
        }}
      >
        {error?.message || "未知错误"}
        {error?.digest ? `\n\ndigest: ${error.digest}` : ""}
        {error?.stack ? `\n\n${error.stack.slice(0, 800)}` : ""}
      </pre>
      <button
        onClick={reset}
        style={{
          padding: "8px 20px",
          borderRadius: 8,
          border: "1px solid #ccc",
          cursor: "pointer",
          background: "#fff",
        }}
      >
        重试
      </button>
    </div>
  );
}
