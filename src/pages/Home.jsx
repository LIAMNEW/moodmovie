import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import MoodPicker from '../components/mood/MoodPicker';
import MovieCard from '../components/movies/MovieCard';
import ShareCard from '../components/movies/ShareCard';
import PullToRefresh from '@/components/ui/PullToRefresh';

export default function Home() {
  const [step, setStep] = useState('landing'); // landing, input, results
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [userCriteria, setUserCriteria] = useState(null);
  const [shareMovie, setShareMovie] = useState(null);
  const [userHistory, setUserHistory] = useState([]);

  useEffect(() => {
    const handleReset = (e) => {
      if (e.detail === '/') {
        resetApp();
      }
    };
    window.addEventListener('reset-tab', handleReset);
    return () => window.removeEventListener('reset-tab', handleReset);
  }, []);
  
  // Security: Rate Limiting State
  const lastSearchTime = React.useRef(0);
  const SEARCH_COOLDOWN_MS = 5000; // 5 seconds cooldown

  // Load user history on mount
  useEffect(() => {
    base44.entities.History.list('-timestamp', 100).then(data => {
      setUserHistory(data);
    });
  }, []);

  // Search Logic
  // Helper to fetch reliable TMDB posters for movies that miss them
  const updateMoviePoster = async (movie) => {
    const response = await base44.functions.invoke('fetchMoviePoster', {
      title: movie.title,
      year: movie.year
    });

    const { poster_url, tmdb_id } = response.data || {};
    if (!poster_url) return;

    const updateData = { poster_url };
    if (tmdb_id) updateData.tmdb_id = tmdb_id;

    base44.entities.Movie.update(movie.id, updateData);
    setRecommendations(prev =>
      prev.map(p => p.id === movie.id ? { ...p, ...updateData } : p)
    );
  };

  const enrichMoviesWithImages = async (movies) => {
    const missingImages = movies.filter(m => !m.poster_url);
    if (missingImages.length === 0) return;

    await Promise.all(missingImages.map(updateMoviePoster));
  };

  // Search Logic
  const handleSearch = async (initialCriteria) => {
    // Security: Rate Limiting Check
    const now = Date.now();
    if (now - lastSearchTime.current < SEARCH_COOLDOWN_MS) {
      alert(`Please wait ${Math.ceil((SEARCH_COOLDOWN_MS - (now - lastSearchTime.current)) / 1000)}s before searching again.`);
      return;
    }
    lastSearchTime.current = now;

    setLoading(true);
    let criteria = initialCriteria;

    try {
      // Start fetching DB + user in parallel with any LLM work
      const dataPromise = Promise.all([
        base44.entities.Movie.list(null, 200),
        base44.auth.me().catch(() => null)
      ]);

      // 0. Quick mood analysis if prompt exists (lightweight, fast model)
      if (criteria.prompt) {
        const sanitizedPrompt = criteria.prompt.slice(0, 300).replace(/[<>]/g, "");
        const aiRes = await base44.integrations.Core.InvokeLLM({
          prompt: `Extract mood + energy from: "${sanitizedPrompt}". mood ∈ [happy,sad,anxious,romantic,tired,motivated,bored,cozy,intense,thrilling,silly]. energy ∈ [low,medium,high]. Also a short "nuance" string (sub-genre/style) if any.`,
          response_json_schema: {
            type: "object",
            properties: {
              mood: { type: "string", enum: ["happy", "sad", "anxious", "romantic", "tired", "motivated", "bored", "cozy", "intense", "thrilling", "silly"] },
              energy: { type: "string", enum: ["low", "medium", "high"] },
              nuance: { type: "string" }
            },
            required: ["mood", "energy"]
          }
        });
        if (aiRes) criteria = aiRes;
      }

      setUserCriteria(criteria);

      const [allMovies, user] = await dataPromise;
      const seenTitles = new Set(userHistory.map(h => h.movie_title.toLowerCase()));
      const existingTitles = new Set(allMovies.map(m => m.title.toLowerCase()));

      // 2. Ask AI for fresh picks (fast model, no internet context)
      const promptNuance = criteria.nuance ? `Style/topic: ${criteria.nuance}.` : "";
      const userPromptText = initialCriteria.prompt ? `User said: "${initialCriteria.prompt.slice(0, 200).replace(/[<>]/g, "")}".` : "";

      let prefsPrompt = "";
      if (user) {
        if (user.favorite_genres?.length > 0) prefsPrompt += ` Likes: ${user.favorite_genres.join(', ')}.`;
        if (user.excluded_content) prefsPrompt += ` Exclude: ${user.excluded_content}.`;
      }

      // Keep exclusion list small to reduce tokens & latency
      const excludeTitles = Array.from(new Set([...existingTitles, ...seenTitles])).slice(0, 40);
      const randomSeed = Math.random().toString(36).slice(2, 8);

      const newMoviesRaw = await base44.integrations.Core.InvokeLLM({
        prompt: `Suggest 5 real movies for mood "${criteria.mood}", energy "${criteria.energy}". ${userPromptText} ${promptNuance}${prefsPrompt}
Rules: match the mood; mix decades/genres; avoid stereotypical picks. Don't repeat: ${excludeTitles.join(", ")}. Variation: ${randomSeed}. Leave poster_url empty.`,
        response_json_schema: {
          type: "object",
          properties: {
            movies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  year: { type: "number" },
                  description: { type: "string" },
                  duration_minutes: { type: "number" },
                  primary_mood: { type: "string", enum: ["happy", "sad", "anxious", "romantic", "tired", "motivated", "bored", "cozy", "intense", "thrilling", "silly"] },
                  energy_level: { type: "string", enum: ["low", "medium", "high"] },
                  genres: { type: "array", items: { type: "string" } },
                  tags: { type: "array", items: { type: "string" } },
                  director: { type: "string" },
                  cast: { type: "array", items: { type: "string" } },
                  imdb_rating: { type: "number" },
                  streaming_providers: { type: "array", items: { type: "object", properties: { name: { type: "string" }, url: { type: "string" } } } }
                },
                required: ["title", "year", "primary_mood", "energy_level", "streaming_providers"]
              }
            }
          }
        }
      });

      let topPicks = [];
      if (newMoviesRaw?.movies?.length > 0) {
        const moviesToCreate = newMoviesRaw.movies
          .filter(m => !existingTitles.has(m.title.toLowerCase()) && !seenTitles.has(m.title.toLowerCase()))
          .map(m => ({
            ...m,
            primary_mood: criteria.mood,
            energy_level: m.energy_level || criteria.energy,
            platform: "Streaming",
            streaming_providers: m.streaming_providers || []
          }));

        const newTitleSet = new Set(newMoviesRaw.movies.map(m => m.title.toLowerCase()));
        const existingMatches = allMovies.filter(m => newTitleSet.has(m.title.toLowerCase()));

        let createdMovies = [];
        if (moviesToCreate.length > 0) {
          const result = await base44.entities.Movie.bulkCreate(moviesToCreate);
          createdMovies = Array.isArray(result) ? result : (result?.items || result?.records || []);
        }

        topPicks = [...existingMatches, ...createdMovies].slice(0, 5);
      }

      // Fallback: if AI returned nothing, use unseen movies from DB matching the mood, shuffled
      if (topPicks.length === 0) {
        const fallback = allMovies
          .filter(m => m.primary_mood?.toLowerCase() === criteria.mood?.toLowerCase() && !seenTitles.has(m.title.toLowerCase()))
          .sort(() => Math.random() - 0.5)
          .slice(0, 5);
        topPicks = fallback;
      }

      setRecommendations(topPicks);
      
      setStep('results');
      
      // Fetch missing images for the new picks
      enrichMoviesWithImages(topPicks);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatch = async (movie) => {
    try {
      // Save to Backend History
      const entry = {
        movie_id: movie.id,
        movie_title: movie.title,
        movie_year: movie.year,
        mood_context: userCriteria.mood,
        energy_context: userCriteria.energy,
        action: 'watched',
        timestamp: new Date().toISOString()
      };
      await base44.entities.History.create(entry);
      setUserHistory(prev => [entry, ...prev]);
    } catch (err) {
      console.error("Failed to save history", err);
    }

    // Show Share Card
    setShareMovie(movie);
  };

  const handleReject = async (movie) => {
    // Save rejection to backend to avoid recommending again
    try {
      const entry = {
        movie_id: movie.id,
        movie_title: movie.title,
        movie_year: movie.year,
        mood_context: userCriteria.mood,
        energy_context: userCriteria.energy,
        action: 'skipped',
        timestamp: new Date().toISOString()
      };
      base44.entities.History.create(entry); // fire and forget
      setUserHistory(prev => [entry, ...prev]);
    } catch (err) {
      console.error("Failed to save skip", err);
    }

    // Remove this movie from list
    const newRecs = recommendations.filter(m => m.id !== movie.id);
    
    // If we run out, maybe fetch more? For now just show remaining
    if (newRecs.length === 0) {
      // Reset or show empty state
      setStep('input');
    } else {
      setRecommendations(newRecs);
    }
  };

  const resetApp = () => {
    setStep('landing');
    setRecommendations([]);
    setShareMovie(null);
  };

  return (
    <div className="min-h-[80vh] flex flex-col">
      <AnimatePresence mode="wait">
        
        {/* LANDING SCREEN */}
        {step === 'landing' && (
          <motion.div 
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-12 py-20 relative"
          >
            <div className="space-y-6 max-w-lg mx-auto relative z-10">
              {/* Glowing Icon */}
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-fuchsia-500 blur-2xl opacity-40 animate-pulse rounded-full" />
                <div className="relative z-10 w-20 h-20 bg-gradient-to-tr from-violet-600 to-fuchsia-500 rounded-3xl shadow-2xl flex items-center justify-center rotate-3 transition-transform hover:rotate-6 duration-500">
                   <Sparkles className="w-10 h-10 text-white drop-shadow-md" />
                </div>
              </div>

              {/* Typography */}
              <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                Your mood.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-purple-400">
                  Your movie.
                </span>
              </h1>
              
              <p className="text-slate-400 text-lg sm:text-xl max-w-md mx-auto font-medium leading-relaxed">
                Tell AI how you're feeling. Get the perfect movie in seconds.
              </p>
            </div>

            {/* CTA Button */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500" />
              <Button 
                size="lg" 
                onClick={() => setStep('input')}
                className="relative h-14 px-10 text-lg rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 font-semibold tracking-wide transition-all hover:scale-[1.02] shadow-2xl shadow-purple-900/50 border border-white/10"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            <div className="pt-12">
               <span className="text-[10px] font-bold tracking-[0.2em] text-slate-700 uppercase">AI-POWERED RECOMMENDATIONS</span>
            </div>
          </motion.div>
        )}

        {/* INPUT SCREEN */}
        {step === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 py-6"
          >
            <div className="mb-8 flex items-center">
               <Button 
                 variant="ghost" 
                 size="sm" 
                 onClick={() => setStep('landing')} 
                 className="text-slate-400 hover:text-white hover:bg-white/5 transition-all -ml-2 rounded-full px-4 min-h-[44px]"
               >
                 ← Back to Home
               </Button>
            </div>
            <MoodPicker onSearch={handleSearch} isLoading={loading} />
          </motion.div>
        )}

        {/* RESULTS SCREEN */}
        {step === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 py-6 space-y-6"
          >
            <PullToRefresh onRefresh={() => handleSearch(userCriteria)}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">💫</span> Tonight's Picks
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setStep('input')} className="text-slate-400 min-h-[44px]">
                  Change Mood
                </Button>
              </div>

              <div className="space-y-6">
                <AnimatePresence>
                  {recommendations.map((movie) => (
                    <MovieCard 
                      key={movie.id} 
                      movie={movie} 
                      onWatch={handleWatch}
                      onReject={handleReject}
                      onPosterError={updateMoviePoster}
                    />
                  ))}
                </AnimatePresence>
                
                {recommendations.length === 0 && (
                  <div className="text-center py-10 text-slate-500">
                    <p>Running low on recommendations...</p>
                    <Button variant="link" onClick={() => setStep('input')} className="min-h-[44px]">Try different settings</Button>
                  </div>
                )}
              </div>
            </PullToRefresh>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SHARE MODAL */}
      {shareMovie && (
        <ShareCard 
          movie={shareMovie} 
          mood={userCriteria.mood}
          energy={userCriteria.energy}
          onClose={() => {
            setShareMovie(null);
            // Optional: Redirect to history or reset?
            // resetApp(); 
          }}
        />
      )}
    </div>
  );
}