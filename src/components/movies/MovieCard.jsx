import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Tag, Tv, Check, RefreshCw, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MovieCard({ movie, onWatch, onReject }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-[#334155] rounded-3xl overflow-hidden shadow-2xl max-w-2xl mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster Area - Matches Screenshot */}
      <div className="relative h-64 bg-slate-700/50 flex items-center justify-center overflow-hidden group">
        {movie.poster_url ? (
          <img 
            src={movie.poster_url} 
            alt={movie.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <div className="text-9xl font-black text-white/10 select-none">
            {movie.title.charAt(0)}
          </div>
        )}
        
        {/* Mood Badge - Top Left */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-slate-900/80 hover:bg-slate-900 text-white border-0 backdrop-blur-md px-3 py-1 text-xs uppercase tracking-wide font-bold">
            {movie.primary_mood}
          </Badge>
        </div>

        {/* Title Overlay - Bottom Left */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#334155] via-[#334155]/80 to-transparent pt-12">
           <h3 className="text-3xl font-bold text-white leading-tight drop-shadow-lg">
            {movie.title} <span className="text-slate-400 font-normal text-xl ml-1">({movie.year})</span>
          </h3>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-6 pb-6 pt-2 space-y-5 bg-[#334155]">
        
        {/* Meta Info */}
        <div className="flex items-center gap-4 text-slate-300 text-sm font-medium">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{movie.duration_minutes}m</span>
          </div>
          {movie.imdb_rating && (
            <div className="flex items-center gap-1.5">
              <span className="text-yellow-500">★</span>
              <span>{movie.imdb_rating}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-slate-200 leading-relaxed text-sm">
          {movie.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {movie.genres?.slice(0, 2).map(g => (
            <Badge key={g} variant="secondary" className="bg-slate-700/50 text-slate-300 hover:bg-slate-700">
              {g}
            </Badge>
          ))}
          {movie.tags?.slice(0, 2).map(t => (
            <Badge key={t} variant="secondary" className="bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20">
              #{t}
            </Badge>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <Button 
            variant="outline" 
            className="h-12 border-slate-600 bg-transparent hover:bg-slate-700/50 text-slate-200 hover:text-white rounded-xl transition-all"
            onClick={() => onReject(movie)}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Not feeling it
          </Button>
          <Button 
            className="h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]"
            onClick={() => onWatch(movie)}
          >
            <Check className="w-5 h-5 mr-2" />
            I'll watch this
          </Button>
        </div>
      </div>
    </motion.div>
  );
}