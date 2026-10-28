import React from 'react';
import { AlertTriangle, RefreshCw, Home, MessageCircle, ShieldCheck } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CurateDrop UI Error Caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl text-center relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Safe Error Recovery</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
              Something unexpected occurred
            </h1>

            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              We encountered a temporary glitch while rendering this section. Don't worry, your cart, account details, and saved orders are completely safe.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh & Retry</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-sm transition-all border border-white/10 active:scale-95 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Storefront Home</span>
              </button>
            </div>

            <div className="pt-6 border-t border-white/10">
              <a
                href="https://wa.me/917511136171?text=Hi%20CurateDrop%2C%20I%20faced%20an%20unexpected%20issue%20on%20the%20site."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Need immediate help? WhatsApp CurateDrop Concierge</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
