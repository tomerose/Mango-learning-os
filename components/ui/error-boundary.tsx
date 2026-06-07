"use client";

import * as React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="mango-glass-card p-4 flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="size-8 text-amber-300" />
          <div>
            <p className="text-sm font-semibold text-white">加载出错</p>
            <p className="mt-1 text-xs text-white/40">{this.state.error?.message ?? "未知错误"}</p>
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              this.props.onRetry?.();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-xs font-medium text-white/60 hover:bg-white/15 transition-colors"
          >
            <RotateCcw className="size-3.5" />重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
