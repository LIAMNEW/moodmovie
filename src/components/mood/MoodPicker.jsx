import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Frown, Zap, Coffee, Moon, Heart, Flame, Music, Sun, CloudRain, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

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

export default function MoodPicker({ onSearch, isLoading }) {
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState([50]); // 0-100
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");

  // OWASP: Input Validation Constants
  const MAX_PROMPT_LENGTH = 500;
  const INVALID_CHARS_REGEX = /[<>]/; // Basic XSS check (though React handles this, good to be explicit)

  const getEnergyLabel = (val) => {
    if (val < 33) return 'Low';
    if (val < 66) return 'Medium';
    return 'High';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* AI Prompt Section */}
      <section className="space-y-4 bg-indigo-950/30 p-4 rounded-2xl border border-indigo-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-indigo-200 uppercase tracking-wide">AI Mood Matcher</h2>
        </div>
        <Textarea 
          placeholder="e.g. I had a long day at work and just want to laugh at something stupid..."
          value={prompt}
          onChange={(e) => {
            const val = e.target.value;
            if (val.length <= MAX_PROMPT_LENGTH) {
              setPrompt(val);
              setError("");
            } else {
              setError(`Max ${MAX_PROMPT_LENGTH} characters allowed`);
            }
          }}
          className="bg-slate-900/50 border-slate-700 focus:border-indigo-500 text-slate-200 resize-none h-24"
        />
        <div className="flex justify-between text-xs">
          <span className="text-red-400">{error}</span>
          <span className={`${prompt.length > MAX_PROMPT_LENGTH * 0.9 ? 'text-orange-400' : 'text-slate-500'}`}>
            {prompt.length}/{MAX_PROMPT_LENGTH}
          </span>
        </div>
      </section>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-950 px-2 text-slate-500">Or pick manually</span>
        </div>
      </div>
      
      {/* Mood Section */}
      <section className={`space-y-4 transition-opacity duration-300 ${prompt ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
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

      {/* Action Button */}
      <div className="pt-4 sticky bottom-4 z-20">
        <Button 
          size="lg" 
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          disabled={(!mood && !prompt) || isLoading}
          onClick={() => {
            if (prompt && INVALID_CHARS_REGEX.test(prompt)) {
              setError("Please remove special characters like < or >");
              return;
            }
            if (error) return;
            onSearch(prompt ? { prompt: prompt.trim() } : { mood, energy: getEnergyLabel(energy[0]).toLowerCase() });
          }}
          >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              {prompt ? "Analyzing Vibe..." : "Finding matches..."}
            </span>
          ) : (
            "Get my Mood Movies 🎬"
          )}
        </Button>
      </div>
    </div>
  );
}