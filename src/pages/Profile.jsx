import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Activity, Heart, Flame } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: history, isLoading } = useQuery({
    queryKey: ['history-analytics'],
    queryFn: () => base44.entities.History.list('-timestamp', 1000)
  });

  if (isLoading) return <div className="p-8 text-center text-slate-400">Loading profile...</div>;
  if (!user) return <div className="p-8 text-center text-slate-400">Please sign in to view your profile.</div>;

  const watched = history?.filter(h => h.action === 'watched') || [];
  const favorites = history?.filter(h => h.is_favorite) || [];

  // Analytics calculations
  const moodCounts = watched.reduce((acc, curr) => {
    const mood = curr.mood_context ? curr.mood_context.charAt(0).toUpperCase() + curr.mood_context.slice(1) : 'Unknown';
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {});

  const moodData = Object.entries(moodCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const energyCounts = watched.reduce((acc, curr) => {
    const energy = curr.energy_context ? curr.energy_context.charAt(0).toUpperCase() + curr.energy_context.slice(1) : 'Unknown';
    acc[energy] = (acc[energy] || 0) + 1;
    return acc;
  }, {});

  const energyData = Object.entries(energyCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const barColors = ['#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#f97316'];
  const pieColors = ['#8b5cf6', '#6366f1', '#3b82f6'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto pb-10">
      <div className="flex items-center gap-4 bg-[#12121A] border border-slate-800 p-6 rounded-2xl">
        <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-violet-500/20">
          {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{user.full_name || 'Movie Lover'}</h1>
          <p className="text-sm text-slate-400">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#12121A] border border-slate-800 p-5 rounded-xl flex items-center gap-4 shadow-lg shadow-black/20">
          <div className="p-3 bg-violet-500/10 rounded-xl">
            <Activity className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Total Watched</p>
            <p className="text-2xl font-bold text-white">{watched.length}</p>
          </div>
        </div>
        <div className="bg-[#12121A] border border-slate-800 p-5 rounded-xl flex items-center gap-4 shadow-lg shadow-black/20">
          <div className="p-3 bg-pink-500/10 rounded-xl">
            <Heart className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Favorites</p>
            <p className="text-2xl font-bold text-white">{favorites.length}</p>
          </div>
        </div>
      </div>

      {watched.length > 0 ? (
        <div className="space-y-6">
          {moodData.length > 0 && (
            <div className="bg-[#12121A] border border-slate-800 p-6 rounded-2xl shadow-lg shadow-black/20">
              <h2 className="text-lg font-semibold text-white mb-6">Top Moods</h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moodData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 13, fontWeight: 500 }} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                      {moodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {energyData.length > 0 && (
            <div className="bg-[#12121A] border border-slate-800 p-6 rounded-2xl shadow-lg shadow-black/20">
              <div className="flex items-center gap-2 mb-6">
                <Flame className="w-5 h-5 text-orange-400" />
                <h2 className="text-lg font-semibold text-white">Energy Preference</h2>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={energyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {energyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {energyData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                    <span className="text-sm text-slate-300">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#12121A] border border-slate-800 p-8 rounded-2xl text-center text-slate-400">
          <p>Watch some movies to see your analytics!</p>
        </div>
      )}
    </div>
  );
}