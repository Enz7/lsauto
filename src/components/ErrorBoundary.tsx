
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props { children: React.ReactNode; fallback?: React.ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8" role="alert">
        <div className="text-center max-w-md space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          <h2 className="text-xl font-bold">Что-то пошло не так</h2>
          <p className="text-gray-400 text-sm">
            {this.state.error?.message || 'Произошла неожиданная ошибка'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="inline-flex items-center gap-2 bg-primary text-black font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
            aria-label="Попробовать снова"
          >
            <RefreshCw size={16} /> Попробовать снова
          </button>
        </div>
      </div>
    );
  }
}
