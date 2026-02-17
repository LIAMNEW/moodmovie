import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, History, Home, Sparkles } from 'lucide-react';
import { createPageUrl } from './utils';

export default function Layout({ children }) {
  const location = useLocation();
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
      <nav className="fixed top-6 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-5xl mx-auto px-6 flex items-start justify-between">
          {/* Logo - Pointer events auto to allow clicking */}
          <Link to={createPageUrl('Home')} className="pointer-events-auto flex items-center gap-3 group">
            <div className="bg-gradient-to-tr from-fuchsia-600 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white/90 group-hover:text-white transition-colors">
              MoodMovie
            </span>
          </Link>

          {/* Navigation Pill */}
          <div className="pointer-events-auto bg-[#1A1A24]/80 backdrop-blur-xl border border-white/5 rounded-full p-1.5 flex items-center gap-1 shadow-2xl shadow-black/50">
            <Link 
              to={createPageUrl('Home')} 
              className={`p-2.5 rounded-full transition-all duration-300 ${isHome ? 'bg-white/10 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              <Home className="w-5 h-5" />
            </Link>
            <Link 
              to={createPageUrl('History')} 
              className={`p-2.5 rounded-full transition-all duration-300 ${isHistory ? 'bg-white/10 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              <History className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6 max-w-2xl mx-auto min-h-screen flex flex-col">
        {children}
      </main>

      <footer className="fixed bottom-6 left-0 right-0 text-center pointer-events-none z-0">
        <p className="text-[10px] font-medium tracking-[0.2em] text-slate-700 uppercase">MoodMovie 2026</p>
      </footer>
    </div>
  );
}