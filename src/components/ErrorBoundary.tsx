import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full border border-ink/10">
            <h2 className="text-2xl font-serif text-stamp-red mb-4">Something went wrong</h2>
            <p className="text-ink-light mb-4">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <pre className="bg-paper-dark p-4 rounded text-xs overflow-auto mb-6 text-ink">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-ink text-paper py-2 rounded hover:bg-ink-light transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
