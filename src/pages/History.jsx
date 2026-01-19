import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Trash2, Calendar, Clock, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('all');

  // Fetch from backend
  const { data: historyData, refetch } = base44.hooks.useQuery({
    queryKey: ['history'],
    queryFn: () => base44.entities.History.list('-timestamp', 100)
  });

  useEffect(() => {
    // Only show watched movies in the UI
    if (historyData) setHistory(historyData.filter(h => h.action === 'watched'));
  }, [historyData]);

  const toggleFavorite = async (item) => {
    const newStatus = !item.is_favorite;
    // Optimistic UI update
    setHistory(prev => prev.map(h => h.id === item.id ? { ...h, is_favorite: newStatus } : h));

    try {
      await base44.entities.History.update(item.id, { is_favorite: newStatus });
    } catch (error) {
      console.error("Failed to update favorite status", error);
      refetch(); // Revert on error
    }
  };

  const clearHistory = async () => {
    if (confirm('Are you sure you want to clear your history?')) {
      const promises = history.map(h => base44.entities.History.delete(h.id));
      await Promise.all(promises);
      refetch();
      setHistory([]);
    }
  };

  const filteredHistory = view === 'favorites' 
    ? history.filter(h => h.is_favorite) 
    : history;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">Your Watch History</h1>

        <div className="flex items-center gap-4">
          <Tabs value={view} onValueChange={setView} className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2 bg-slate-900">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>
          </Tabs>

          {history.length > 0 && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={clearHistory}
              className="text-slate-500 hover:text-red-400 hover:bg-red-950/30"
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between group hover:border-slate-700 transition-colors"
              >
                <div>
                  <h3 className="font-bold text-lg text-white">{item.movie_title || item.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(item.timestamp || item.created_date), 'MMM d')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 capitalize">
                      {item.mood_context}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 capitalize">
                      {item.energy_context} energy
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(item)}
                  className={`transition-all ${item.is_favorite ? 'text-pink-500 hover:text-pink-600' : 'text-slate-600 hover:text-pink-500 hover:bg-pink-500/10'}`}
                  title={item.is_favorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart className={`w-5 h-5 ${item.is_favorite ? 'fill-current' : ''}`} />
                </Button>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 text-slate-500 bg-slate-900/20 rounded-3xl border border-slate-800/50 border-dashed">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">
                {view === 'favorites' ? 'No favorites yet' : 'No movies yet'}
              </p>
              <p className="text-sm">
                {view === 'favorites' 
                  ? 'Heart movies in your history to save them here.' 
                  : 'Your watched movies will appear here.'}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}