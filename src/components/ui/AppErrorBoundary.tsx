import React from 'react';
import { reportClientProblem } from '../../lib/clientLog';

interface State {
  hasError: boolean;
}

// If a screen crashes, show a calm way back instead of a blank page, and
// report what happened so it can be fixed.
export class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  declare props: { children: React.ReactNode };
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    reportClientProblem('render-crash', error.message, (info.componentStack || '').replace(/\s+/g, ' ').slice(0, 400));
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white border border-[#E3E2DE] rounded-2xl p-6 text-center space-y-4">
          <h1 className="text-lg font-semibold text-[#17212B]">Something went wrong</h1>
          <p className="text-sm text-[#59636B]">
            We've been told about it. Please reload the page.
          </p>
          <p className="text-xs text-[#59636B]">If anyone is in immediate danger, call 112.</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 rounded-lg bg-[#123B5D] hover:bg-[#0D2A42] text-white text-sm font-semibold"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
