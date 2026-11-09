import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

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
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4 shadow-xl">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-['Outfit'] mb-2">
            Something went wrong
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
            A temporary issue occurred while rendering. Click the button below to reload the store.
          </p>
          <button
            onClick={this.handleReset}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-sky-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload Store</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
