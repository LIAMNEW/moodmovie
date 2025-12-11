import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Frown, Zap, Coffee, Moon, Heart, Flame, Music, Sun, CloudRain } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const MOODS = [
  { id: 'happy', label: 'Happy', icon: Smile, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
  { id: 'sad', label: 'Sad', icon: CloudRain, color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
  { id: 'anxious', label: 'Anxious', icon: Frown, color: 'bg-purple-500/20 text-purple-400 border-purple-500/50' },
  { id: 'romantic', label: 'Romantic', icon: Heart, color: 'bg-pink-500/20 text-pink-400 border-pink-500/50' },
  { id: 'tired', label: 'Tired', icon: Moon, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' },
  { id: 'motivated', label: 'Motivated', icon: Zap, color: 'bg-orange-500/20 text-orange-400 border-orange-500/50' },
  { id: 'bored', label: 'Bored', icon: Coffee, color: 'bg-slate-500/20 text-slate-400 border-slate-500/50' },
  { id: 'cozy', label: 'Cozy', icon: Sun, color: 'bg-amber-500/20 text-amber-400 border-amber-500/50' },
  { id: 'intense', label: 'Intense', icon: Flame, color: 'bg-red-500/20 text-red-400 border-red-500/50' },
  { id: 'silly', label: 'Silly', icon: Music, color: 'bg-green-500/20 text-green-400 border-green-500/50' },
];

const TIME_OPTIONS = [
  { value: 30, label: '30m', desc: 'Quick' },
  { value: 60, label: '60m', desc: 'Short' },
  { value: 90, label: '90m', desc: 'Avg' },
  { value: 120, label: '120m+', desc: 'Long' },
];

export default function MoodPicker({ onSearch, isLoading }) {
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState([50]); // 0-100
  const [time, setTime] = useState(90);

  const getEnergyLabel = (val) => {
    if (val < 33) return 'Low';
    if (val < 66) return 'Medium';
    return 'High';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Mood Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">How are you feeling?</h2>
          {mood && <span className="text-sm text-slate-400 animate-in fade-in">Nice choice.</span>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MOODS.map((m) => {
            const Icon = m.icon;
            const isSelected = mood === m.id;
            return (
              <motion.button
                key={m.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMood(m.id)}
                className={`
                  relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300
                  ${isSelected 
                    ? `${m.color} ring-2 ring-offset-2 ring-offset-slate-950 ring-${m.color.split(' ')[1].replace('text-', '')}` 
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:border-slate-700'}
                `}
              >
                <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'animate-bounce' : ''}`} />
                <span className="font-medium text-sm">{m.label}</span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Energy Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Energy Level</h2>
          <span className="text-indigo-400 font-medium px-3 py-1 bg-indigo-500/10 rounded-full text-sm">
            {getEnergyLabel(energy[0])}
          </span>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <Slider
            value={energy}
            onValueChange={setEnergy}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-slate-500 font-medium uppercase tracking-wider">
            <span>Chill</span>
            <span>Balanced</span>
            <span>Hype</span>
          </div>
        </div>
      </section>

      {/* Time Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Time Available</h2>
        <div className="grid grid-cols-4 gap-2">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTime(opt.value)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-xl border transition-all
                ${time === opt.value
                  ? 'bg-slate-100 text-slate-900 border-white'
                  : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800'}
              `}
            >
              <span className="text-lg font-bold">{opt.label}</span>
              <span className="text-[10px] opacity-70">{opt.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Action Button */}
      <div className="pt-4 sticky bottom-4 z-20">
        <Button 
          size="lg" 
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          disabled={!mood || isLoading}
          onClick={() => onSearch({ mood, energy: getEnergyLabel(energy[0]).toLowerCase(), time })}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Finding matches...
            </span>
          ) : (
            "Get my Mood Movies 🎬"
          )}
        </Button>
      </div>
    </div>
  );
}