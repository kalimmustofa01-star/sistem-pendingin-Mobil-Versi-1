import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-[40px] p-10 text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto border border-rose-500/30">
              <span className="text-4xl">⚠️</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Terjadi Kesalahan</h2>
              <p className="text-zinc-400 text-sm">
                Maaf, aplikasi mengalami kendala teknis. Silakan muat ulang halaman atau hubungi administrator.
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
