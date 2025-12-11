import React from 'react';
import { motion } from 'framer-motion';
import { X, Share, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ShareCard({ movie, mood, energy, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl border border-slate-800"
      >
        <div className="p-1 flex justify-end">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="px-8 pb-8 space-y-6 text-center">
          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30 uppercase tracking-wide">
              Tonight's Vibe
            </div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Mood Matched!
            </h2>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -translate-y-10 translate-x-10" />
            
            <p className="text-slate-400 text-sm mb-4">I was feeling <span className="text-white font-medium">{mood}</span> with <span className="text-white font-medium">{energy}</span> energy...</p>
            
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">{movie.title}</h3>
              <p className="text-slate-500 text-sm">{movie.year} • {movie.genres?.[0]}</p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700/50 flex justify-center">
              <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">MoodMovie App</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1 bg-white text-black hover:bg-slate-200" onClick={() => alert('Saved to clipboard!')}>
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" className="flex-1 border-slate-700 text-white hover:bg-slate-800" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}