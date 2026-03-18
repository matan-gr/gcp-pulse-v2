import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRepairing: boolean;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    isRepairing: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, isRepairing: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Check if it's a chunk load error (common in Vite/React after redeploys)
    const isChunkError = error.name === 'ChunkLoadError' || error.message.includes('Failed to fetch dynamically imported module');
    
    if (isChunkError) {
      console.warn('Chunk load error detected. Automatically flushing caches and refreshing...');
      this.flushCachesAndReload();
    }
    
    this.setState({ errorInfo });
  }

  private flushCachesAndReload = async () => {
    this.setState({ isRepairing: true });
    try {
      // 1. Clear Local Storage
      localStorage.clear();
      
      // 2. Clear Session Storage
      sessionStorage.clear();
      
      // 3. Clear Cache Storage (Service Workers / Assets)
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // 4. Unregister Service Workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(r => r.unregister()));
      }

      console.log('Caches flushed successfully. Reloading...');
      
      // Give the user a moment to see the error message before refreshing
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error('Failed to flush caches:', err);
      // Still reload even if cache flush fails
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  };

  private handleReload = () => {
    this.flushCachesAndReload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReport = () => {
    const { error, errorInfo } = this.state;
    const subject = encodeURIComponent(`Error Report: GCP Pulse`);
    const body = encodeURIComponent(
      `I encountered an error in the GCP Pulse application.\n\nError: ${error?.toString()}\n\nStack Trace:\n${errorInfo?.componentStack || ''}`
    );
    window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`;
  };

  public render() {
    if (this.state.hasError) {
      const isChunkError = 
        this.state.error?.name === 'ChunkLoadError' || 
        this.state.error?.message.includes('Failed to fetch dynamically imported module');

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-red-600 dark:text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {this.state.isRepairing ? 'Repairing...' : (isChunkError ? 'Update Available' : 'Something went wrong')}
            </h1>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">
              {this.state.isRepairing 
                ? 'We are automatically clearing caches and reloading to fix the issue. Please wait...'
                : (isChunkError 
                  ? 'A new version of the application is available. We will automatically reload to update.'
                  : 'We encountered an unexpected error. Our team has been notified. Please try reloading the page.')}
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl text-left overflow-hidden max-h-60 overflow-y-auto custom-scrollbar border border-red-100 dark:border-red-900/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Error Details</span>
                  <span className="text-[10px] text-slate-400 font-mono">{new Date().toISOString()}</span>
                </div>
                <p className="text-xs font-mono text-red-600 dark:text-red-400 break-words font-bold mb-2">
                  {this.state.error.toString()}
                </p>
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    <span className="font-bold">URL:</span> {window.location.href}
                  </p>
                  {this.state.errorInfo && (
                    <p className="text-[10px] font-mono text-red-500/80 mt-2 whitespace-pre-wrap leading-tight">
                      {this.state.errorInfo.componentStack}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-[#1a73e8] text-white rounded-xl hover:bg-[#1557b0] transition-all font-medium shadow-md hover:shadow-lg active:scale-95"
              >
                <RefreshCw size={16} />
                <span>Reload Page</span>
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={this.handleReport}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-[#5f6368] dark:text-slate-300 rounded-xl border border-[#dadce0] dark:border-slate-700 hover:bg-[#f1f3f4] dark:hover:bg-slate-700 transition-all font-medium text-sm active:scale-95"
                >
                  <Mail size={16} />
                  <span>Report</span>
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-[#5f6368] dark:text-slate-300 rounded-xl border border-[#dadce0] dark:border-slate-700 hover:bg-[#f1f3f4] dark:hover:bg-slate-700 transition-all font-medium text-sm active:scale-95"
                >
                  <Home size={16} />
                  <span>Home</span>
                </button>
              </div>
            </div>
          </div>
          
          <p className="mt-8 text-xs text-slate-400">
            GCP Pulse &bull; Enterprise Dashboard
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
