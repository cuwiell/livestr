'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-neutral-900 text-red-400 p-4 text-center">
          <span className="text-4xl mb-2">⚠️</span>
          <h2 className="font-bold mb-1">Failed to Load Avatar</h2>
          <p className="text-xs text-neutral-500">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
