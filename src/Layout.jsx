import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Film, History, Home, Sparkles, ChevronLeft } from 'lucide-react';
import { createPageUrl } from './utils';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/' || location.pathname === '';
  const isHistory = location.pathname.includes('History');

  return (
    <div className="min-h-screen bg-[#05050A] text-slate-100 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      {/* Deep Cosmic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-fuchsia-900/5 rounded-full blur-[80px]" />
      </div>

      {/* Floating Header */}
      <nav className="fixed top-0 pt-[env(safe-area-inset-top,1.5rem)] pb-4 left-0 right-0 z-50 pointer-events-none bg-gradient-to-b from-[#05050A] to-transparent">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            {!isHome && (
              <button 
                onClick={() => navigate(-1)}
                className="pointer-events-auto p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md border border-white/5"
              >
                <ChevronLeft className="w-5 h-5 text-white/90" />
              </button>
            )}
            <Link to={createPageUrl('Home')} className="pointer-events-auto flex items-center gap-3 group">
              <div className="bg-gradient-to-tr from-fuchsia-600 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white/90 group-hover:text-white transition-colors">
                MoodMovie
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-[calc(env(safe-area-inset-top,0px)+8rem)] pb-[calc(env(safe-area-inset-bottom,0px)+6rem)] px-6 max-w-2xl mx-auto min-h-screen flex flex-col">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom,0px)] bg-[#05050A]/90 backdrop-blur-xl border-t border-white/5 pointer-events-auto">
        <div className="max-w-md mx-auto px-6 py-3 flex items-center justify-around">
          <Link 
            to={createPageUrl('Home')} 
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 min-w-[64px] ${isHome ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link 
            to={createPageUrl('History')} 
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 min-w-[64px] ${isHistory ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <History className="w-6 h-6" />
            <span className="text-[10px] font-medium">History</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}