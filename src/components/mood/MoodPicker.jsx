import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Frown, Zap, Coffee, Moon, Heart, Flame, Music, Sun, CloudRain, Sparkles, Wand2, LayoutGrid } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState("ai");
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState([50]); // 0-100
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");

  // OWASP: Input Validation Constants
  const MAX_PROMPT_LENGTH = 500;
  const INVALID_CHARS_REGEX = /[<>]/; 

  const getEnergyLabel = (val) => {
    if (val < 33) return 'Low';
    if (val < 66) return 'Medium';
    return 'High';
  };

  const handleSearch = () => {
    if (activeTab === "ai") {
      if (!prompt.trim()) return;
      if (INVALID_CHARS_REGEX.test(prompt)) {
        setError("Please remove special characters like < or >");
        return;
      }
      // Pass energy even with prompt, in case we want to use it
      onSearch({ prompt: prompt.trim(), energy: getEnergyLabel(energy[0]).toLowerCase() });
    } else {
      if (!mood) return;
      onSearch({ mood, energy: getEnergyLabel(energy[0]).toLowerCase() });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-xl mx-auto">
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-900/50 border border-slate-800 p-1 rounded-xl h-14">
          <TabsTrigger 
            value="ai"
            className="rounded-lg text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-fuchsia-600 data-[state=active]:text-white h-full transition-all"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            AI Vibe Match
          </TabsTrigger>
          <TabsTrigger 
            value="manual"
            className="rounded-lg text-sm font-medium data-[state=active]:bg-slate-800 data-[state=active]:text-white h-full transition-all"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Pick Manually
          </TabsTrigger>
        </TabsList>

        <div className="min-h-[200px]">
          <TabsContent value="ai" className="space-y-4 mt-0">
            <div className="bg-[#12121A] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-violet-500/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-white font-semibold">Describe your vibe</h2>
                  <p className="text-xs text-slate-500">AI will find the perfect mood match</p>
                </div>
              </div>
              
              <div className="relative">
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
                  className="bg-slate-900/50 border-slate-700 focus:border-violet-500 text-slate-200 resize-none h-32 rounded-xl text-base p-4 leading-relaxed"
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-slate-600 font-mono">
                  {prompt.length}/{MAX_PROMPT_LENGTH}
                </div>
              </div>
              {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6 mt-0">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-semibold text-white">How are you feeling?</h2>
              {mood && <span className="text-xs font-medium text-violet-300 px-2 py-1 bg-violet-500/10 rounded-full border border-violet-500/20">Selected</span>}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                {MOODS.map((m) => {
                  const Icon = m.icon;
                  const isSelected = mood === m.id;
                  return (
                    <motion.button
                      key={m.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMood(m.id)}
                      className={`
                        relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 text-left h-16 group
                        ${isSelected 
                          ? 'bg-[#1A1A24] border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.15)] ring-1 ring-violet-500 z-10' 
                          : 'bg-[#12121A] border-slate-800/60 hover:bg-[#1A1A24] hover:border-slate-700'}
                      `}
                    >
                      <Icon className={`w-5 h-5 transition-colors ${isSelected ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                      <span className={`font-medium text-sm transition-colors ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{m.label}</span>
                    </motion.button>
                  );
                })}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Energy Section - Shared */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold text-white">Energy Level</h2>
          <span className="text-xs font-bold tracking-wider text-violet-300 px-3 py-1 bg-violet-500/10 rounded-full border border-violet-500/20 uppercase">
            {getEnergyLabel(energy[0])}
          </span>
        </div>
        <div className="bg-[#12121A] p-8 rounded-2xl border border-slate-800 shadow-lg">
          <Slider
            value={energy}
            onValueChange={setEnergy}
            max={100}
            step={1}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
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
          className="w-full h-16 text-lg font-bold bg-[#1A1A24] hover:bg-[#252532] border border-slate-700 hover:border-violet-500/50 text-white shadow-xl shadow-black/50 rounded-2xl transition-all group overflow-hidden relative"
          disabled={(activeTab === 'ai' && !prompt) || (activeTab === 'manual' && !mood) || isLoading}
          onClick={handleSearch}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {isLoading ? (
            <span className="flex items-center gap-3 relative z-10">
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span className="animate-pulse">Analyzing Vibe...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2 relative z-10">
              <Sparkles className="w-5 h-5 text-violet-400" />
              Find my movies
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}