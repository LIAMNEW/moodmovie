import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Tag, Tv, Check, RefreshCw, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MovieCard({ movie, onWatch, onReject, onShare }) {
  const [isHovered, setIsHovered] = useState(false);

  // Gradient based on mood for placeholder
  const getGradient = (mood) => {
    const maps = {
      happy: 'from-yellow-400 to-orange-500',
      sad: 'from-blue-400 to-indigo-500',
      anxious: 'from-purple-400 to-pink-500',
      intense: 'from-red-500 to-orange-600',
      romantic: 'from-pink-400 to-rose-500',
      // default
      default: 'from-slate-700 to-slate-600'
    };
    return maps[movie.primary_mood] || maps.default;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster / Header */}
      <div className={`h-48 w-full bg-gradient-to-br ${getGradient(movie.primary_mood)} relative p-6 flex flex-col justify-end`}>
        {movie.poster_url ? (
          <img src={movie.poster_url} alt={movie.title} className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <span className="text-9xl font-black text-white mix-blend-overlay">
              {movie.title.charAt(0)}
            </span>
          </div>
        )}
        
        <div className="relative z-10">
          <Badge variant="secondary" className="bg-black/30 hover:bg-black/40 text-white backdrop-blur-md border-0 mb-2">
            {movie.primary_mood}
          </Badge>
          <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-md">
            {movie.title} <span className="text-white/60 font-normal text-lg">({movie.year})</span>
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Meta Row */}
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{movie.duration_minutes} min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Tv className="w-4 h-4 text-purple-400" />
            <span>{movie.platform || 'Streaming'}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-300 leading-relaxed text-sm">
          {movie.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {movie.genres?.slice(0, 2).map(g => (
            <Badge key={g} variant="outline" className="border-slate-700 text-slate-400">
              {g}
            </Badge>
          ))}
          {movie.tags?.slice(0, 2).map(t => (
            <Badge key={t} variant="outline" className="border-indigo-500/30 text-indigo-300">
              #{t}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button 
            variant="outline" 
            className="border-slate-700 hover:bg-slate-800 text-slate-300"
            onClick={() => onReject(movie)}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Not feeling it
          </Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
            onClick={() => onWatch(movie)}
          >
            <Check className="w-4 h-4 mr-2" />
            I'll watch this
          </Button>
        </div>
      </div>
    </motion.div>
  );
}