import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, History, Home, Sparkles } from 'lucide-react';
import { createPageUrl } from './utils';

export default function Layout({ children }) {
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '';
  const isHistory = location.pathname.includes('History');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2 group">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-xl group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              MoodMovie
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <Link 
              to={createPageUrl('Home')} 
              className={`p-2 rounded-full transition-colors ${isHome ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:text-white'}`}
            >
              <Home className="w-5 h-5" />
            </Link>
            <Link 
              to={createPageUrl('History')} 
              className={`p-2 rounded-full transition-colors ${isHistory ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:text-white'}`}
            >
              <History className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-20 pb-20 px-4 max-w-md mx-auto min-h-screen flex flex-col">
        {children}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-xs text-slate-600 bg-slate-950/80 backdrop-blur-sm pointer-events-none z-0">
        <p>MoodMovie 2025 • Find your vibe</p>
      </footer>
    </div>
  );
}