import React from 'react';
import { AlertCircle, RefreshCw, KeyRound, MessageCircle, ShieldAlert } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CurateDrop Admin Console Error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetSession = () => {
    localStorage.removeItem('curatedrop_admin_user');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl text-center relative overflow-hidden">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-8 h-8 text-red-400" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-300 text-xs font-semibold mb-3 border border-red-500/20">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Admin Console Recovery</span>
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight mb-3">
              Admin Session Interrupted
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              The Admin console encountered an unexpected runtime state. You can reload the dashboard or safely reset your admin session without affecting catalog products.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Console</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetSession}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-all border border-slate-700 active:scale-95 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Reset Admin Session</span>
              </button>
            </div>

            <div className="pt-6 border-t border-slate-800/80">
              <a
                href="https://wa.me/917511136171"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-amber-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Super Admin Emergency Support (7511136171)</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
