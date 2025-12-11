import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Trash2, Calendar, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);

  // Fetch from backend
  const { data: historyData, refetch } = base44.hooks.useQuery({
    queryKey: ['history'],
    queryFn: () => base44.entities.History.list('-watched_date', 50)
  });

  useEffect(() => {
    if (historyData) setHistory(historyData);
  }, [historyData]);

  const clearHistory = async () => {
    if (confirm('Are you sure you want to clear your history?')) {
      // Delete one by one for now as we don't have bulk delete exposed in this context
      // Or just clear local state for UI feedback
      const promises = history.map(h => base44.entities.History.delete(h.id));
      await Promise.all(promises);
      refetch();
      setHistory([]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Your Watch History</h1>
        {history.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearHistory}
            className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {history.length > 0 ? (
            history.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold text-lg text-white">{item.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(item.watched_date || item.created_date), 'MMM d')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 capitalize">
                      {item.mood_context}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 capitalize">
                      {item.energy_context} energy
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 text-slate-500 bg-slate-900/20 rounded-3xl border border-slate-800/50 border-dashed">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No movies yet</p>
              <p className="text-sm">Your watched movies will appear here.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}