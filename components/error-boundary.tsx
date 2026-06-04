"use client";

import * as React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: string | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="bg-card flex flex-col items-center gap-3 rounded-xl border p-8 text-center">
            <p className="text-sm font-medium text-destructive">页面加载出错</p>
            <p className="text-muted-foreground text-xs max-w-md">
              {this.state.error ?? "未知错误"}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="text-primary text-sm underline hover:no-underline"
            >
              刷新页面
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
