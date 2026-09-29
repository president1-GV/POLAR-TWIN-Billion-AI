import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
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
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto my-12 bg-polar-card border border-rose-500/40 rounded-xl shadow-xl font-mono text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-500">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-polar-text-primary tracking-wide">
              {this.props.fallbackTitle || 'SUBSYSTEM TELEMETRY RENDERING ANOMALY'}
            </h3>
            <p className="text-xs text-polar-text-secondary mt-1">
              A component runtime exception occurred. The error has been captured safely without terminating the mission console.
            </p>
          </div>
          {this.state.error && (
            <div className="p-3 bg-polar-elevated rounded text-[11px] text-rose-600 dark:text-rose-300 font-mono text-left overflow-x-auto border border-rose-500/30">
              {this.state.error.message || String(this.state.error)}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-polar-cyan hover:opacity-90 text-polar-base dark:text-black text-xs font-bold transition shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>REINITIALIZE COMPONENT</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
