import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Settings, Save } from 'lucide-react';

export default function PreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    favorite_genres: '',
    favorite_directors: '',
    favorite_actors: '',
    excluded_content: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          setLoading(false);
          return;
        }
        const user = await base44.auth.me();
        if (user) {
          setPrefs({
            favorite_genres: user.favorite_genres ? user.favorite_genres.join(', ') : '',
            favorite_directors: user.favorite_directors || '',
            favorite_actors: user.favorite_actors || '',
            excluded_content: user.excluded_content || ''
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        favorite_genres: prefs.favorite_genres.split(',').map(s => s.trim()).filter(Boolean),
        favorite_directors: prefs.favorite_directors,
        favorite_actors: prefs.favorite_actors,
        excluded_content: prefs.excluded_content
      });
      toast({ title: 'Preferences saved', description: 'Your recommendations will now be tailored to these preferences.' });
    } catch (e) {
      toast({ title: 'Error saving preferences', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto pb-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-violet-500/10 rounded-xl">
          <Settings className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Advanced Personalization</h1>
          <p className="text-sm text-slate-400">Tailor your movie recommendations</p>
        </div>
      </div>

      <div className="bg-[#12121A] border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Favorite Genres (comma-separated)</label>
          <Input 
            value={prefs.favorite_genres} 
            onChange={e => setPrefs({...prefs, favorite_genres: e.target.value})} 
            placeholder="e.g. Sci-Fi, Thriller, Dark Comedy"
            className="bg-slate-900/50 border-slate-700 focus:border-violet-500 text-slate-200"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Favorite Directors</label>
          <Input 
            value={prefs.favorite_directors} 
            onChange={e => setPrefs({...prefs, favorite_directors: e.target.value})} 
            placeholder="e.g. Christopher Nolan, Denis Villeneuve"
            className="bg-slate-900/50 border-slate-700 focus:border-violet-500 text-slate-200"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Favorite Actors</label>
          <Input 
            value={prefs.favorite_actors} 
            onChange={e => setPrefs({...prefs, favorite_actors: e.target.value})} 
            placeholder="e.g. Florence Pugh, Ryan Gosling"
            className="bg-slate-900/50 border-slate-700 focus:border-violet-500 text-slate-200"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Exclude Content (Themes, Tropes, etc.)</label>
          <Textarea 
            value={prefs.excluded_content} 
            onChange={e => setPrefs({...prefs, excluded_content: e.target.value})} 
            placeholder="e.g. Excessive gore, sad endings, horror"
            className="bg-slate-900/50 border-slate-700 focus:border-violet-500 text-slate-200 h-24 resize-none"
          />
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full h-12 bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:scale-[1.02]"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}