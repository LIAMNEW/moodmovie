import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import MoodPicker from '../components/mood/MoodPicker';
import MovieCard from '../components/movies/MovieCard';
import ShareCard from '../components/movies/ShareCard';

export default function Home() {
  const [step, setStep] = useState('landing'); // landing, input, results
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [userCriteria, setUserCriteria] = useState(null);
  const [shareMovie, setShareMovie] = useState(null);
  const [sessionSeenIds, setSessionSeenIds] = useState(new Set());

  // Search Logic
  // Helper to fetch images for movies that miss them
  const enrichMoviesWithImages = async (movies) => {
    const missingImages = movies.filter(m => !m.poster_url);
    if (missingImages.length === 0) return;

    // Process one by one to avoid rate limits or overwhelming the LLM
    for (const movie of missingImages) {
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `Find a verifiable, high-resolution movie poster URL for "${movie.title}" (${movie.year}). 
                   Prefer links from: image.tmdb.org, m.media-amazon.com, or upload.wikimedia.org.
                   Ensure the URL ends in .jpg or .png.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              poster_url: { type: "string" }
            }
          }
        });

        if (res?.poster_url) {
          await base44.entities.Movie.update(movie.id, { poster_url: res.poster_url });
          setRecommendations(prev => 
            prev.map(p => p.id === movie.id ? { ...p, poster_url: res.poster_url } : p)
          );
        }
      } catch (e) {
        console.error("Failed image fetch:", movie.title);
      }
    }
  };

  // Search Logic
  const handleSearch = async (initialCriteria) => {
    setLoading(true);
    let criteria = initialCriteria;

    try {
      // 0. AI Analysis if prompt exists
      if (criteria.prompt) {
        const aiRes = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this user mood description and extract the most likely structured criteria for movie recommendation.
User says: "${criteria.prompt}"

Map to these exact values:
- mood: happy, sad, anxious, romantic, tired, motivated, bored, cozy, intense, thrilling, silly
- energy: low, medium, high
- time: 30, 60, 90, 120 (approx minutes available)

Be smart. "I want to laugh" = happy/silly. "Long day" = tired/cozy. "Adrenaline" = intense/high.`,
          response_json_schema: {
            type: "object",
            properties: {
              mood: { type: "string", enum: ["happy", "sad", "anxious", "romantic", "tired", "motivated", "bored", "cozy", "intense", "thrilling", "silly"] },
              energy: { type: "string", enum: ["low", "medium", "high"] },
              time: { type: "number" }
            },
            required: ["mood", "energy"]
          }
        });
        
        // Merge AI results
        if (aiRes) {
          criteria = { ...aiRes, time: aiRes.time || 90 };
        }
      }

      setUserCriteria(criteria);

      // 1. Fetch movies
      const allMovies = await base44.entities.Movie.list(null, 100);
      console.log('Fetched movies:', allMovies.length);
      
      // 2. Filter & Rank
      let filtered = allMovies.filter(m => 
        m.primary_mood?.toLowerCase() === criteria.mood?.toLowerCase() && 
        !sessionSeenIds.has(m.id)
      );
      
      // 3. EXPANSIVE MODE: If we don't have enough movies, generate new ones
      if (filtered.length < 5) {
        console.log("Expanding library with AI...");
        const newMoviesRaw = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate 5 UNIQUE, REAL movie recommendations for a user feeling "${criteria.mood}" with "${criteria.energy}" energy.
                   Exclude these existing movies: ${allMovies.map(m => m.title).join(", ")}.
                   Return a list of movies with accurate details. 
                   For 'poster_url', leave it empty string, we will fetch it later.`,
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
                    tags: { type: "array", items: { type: "string" } }
                  },
                  required: ["title", "year", "primary_mood", "energy_level"]
                }
              }
            }
          }
        });

        if (newMoviesRaw?.movies?.length > 0) {
          // Normalize and Insert new movies
          const moviesToCreate = newMoviesRaw.movies.map(m => ({
            ...m,
            primary_mood: criteria.mood, // Enforce the requested mood
            energy_level: criteria.energy, // Enforce the requested energy
            platform: "Streaming",
            streaming_providers: ["Netflix", "Prime", "Disney+"] // Placeholders until real integration
          }));

          await base44.entities.Movie.bulkCreate(moviesToCreate);
          
          // Re-fetch to get IDs and fresh data
          const updatedAll = await base44.entities.Movie.list(null, 100);
          filtered = updatedAll.filter(m => m.primary_mood?.toLowerCase() === criteria.mood?.toLowerCase());
        }
      }

      // Sort by duration proximity
      filtered.sort((a, b) => {
        const diffA = Math.abs((a.duration_minutes || 90) - criteria.time);
        const diffB = Math.abs((b.duration_minutes || 90) - criteria.time);
        return diffA - diffB;
      });

      // Take top 5
      const topPicks = filtered.slice(0, 5);
      setRecommendations(topPicks);
      
      // Track seen movies for this session
      setSessionSeenIds(prev => {
        const next = new Set(prev);
        topPicks.forEach(m => next.add(m.id));
        return next;
      });

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
      await base44.entities.History.create({
        movie_title: movie.title,
        movie_year: movie.year,
        mood_context: userCriteria.mood,
        energy_context: userCriteria.energy,
        watched_date: new Date().toISOString()
      });
    } catch (err) {
      console.error("Failed to save history", err);
    }

    // Show Share Card
    setShareMovie(movie);
  };

  const handleReject = (movie) => {
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
            className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-12"
          >
            <div className="space-y-4 max-w-xs mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-purple-500/30">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-100 to-indigo-300">
                Find the perfect movie for your mood.
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed">
                Tell us how you feel and how much time you’ve got. We’ll do the rest.
              </p>
            </div>

            <Button 
              size="lg" 
              onClick={() => setStep('input')}
              className="h-14 px-8 text-lg rounded-full bg-white text-slate-950 hover:bg-slate-200 font-bold transition-all hover:scale-105 shadow-xl shadow-white/10"
            >
              Pick my mood 🎬
            </Button>
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
            <div className="mb-6 flex items-center gap-2">
               <Button variant="ghost" size="sm" onClick={() => setStep('landing')} className="text-slate-500 hover:text-white -ml-2">
                 ← Back
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">💫</span> Tonight's Picks
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setStep('input')} className="text-slate-400">
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
                  />
                ))}
              </AnimatePresence>
              
              {recommendations.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                  <p>Running low on recommendations...</p>
                  <Button variant="link" onClick={() => setStep('input')}>Try different settings</Button>
                </div>
              )}
            </div>
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