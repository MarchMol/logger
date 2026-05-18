'use client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area, BarChart, Bar
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { useState, useEffect } from 'react';

type Log = {
  logged_date: string;
  weight_kg: number;
  sleep_hours: number;
  sleep_quality: number;
  energy: number;
  mood: number;
  food_quality: number;
  portions: number;
  symptoms: string[];
};

type Stats = {
  summary: {
    total_entries: string;
    avg_weight: string;
    min_weight: string;
    max_weight: string;
    avg_sleep: string;
    avg_sleep_quality: string;
    avg_energy: string;
    avg_mood: string;
    avg_food_quality: string;
  };
  top_symptoms: { symptom: string; count: string }[];
};

const TOOLTIP_STYLE = {
  backgroundColor: '#1F2937',
  border: '1px solid #374151',
  borderRadius: '8px',
  color: '#F9FAFB',
};

function StatCard({ label, value, unit = '', color }: { label: string; value: string | number; unit?: string; color: string }) {
  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-4 text-center">
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}<span className="text-sm font-normal text-gray-400 ml-1">{unit}</span></p>
    </div>
  );
}

export default function Dashboard({ refreshKey }: { refreshKey: number }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/logs?days=${days}`).then(r => r.json()),
      fetch('/api/stats').then(r => r.json()),
    ]).then(([logsData, statsData]) => {
      setLogs(logsData);
      setStats(statsData);
      setLoading(false);
    });
  }, [days, refreshKey]);

  const chartData = logs.map(l => ({
    date: format(parseISO(l.logged_date), 'MMM d'),
    weight: l.weight_kg ? parseFloat(String(l.weight_kg)) : null,
    sleep: l.sleep_hours ? parseFloat(String(l.sleep_hours)) : null,
    sleepQ: l.sleep_quality,
    energy: l.energy,
    mood: l.mood,
    food: l.food_quality,
    portions: l.portions,
  }));

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-500">Loading your data...</div>
  );

  if (logs.length === 0) return (
    <div className="text-center py-20">
      <p className="text-gray-500 text-lg">No logs yet.</p>
      <p className="text-gray-600 text-sm mt-2">Start logging to see your trends here!</p>
    </div>
  );

  const s = stats?.summary;

  return (
    <div className="space-y-6">
      {/* Range selector */}
      <div className="flex gap-2 justify-end">
        {[7, 14, 30, 90].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              days === d
                ? 'bg-emerald-400 text-gray-900'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      {/* Summary cards */}
      {s && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Avg Weight" value={s.avg_weight || '—'} unit="kg" color="#6EE7B7" />
          <StatCard label="Avg Sleep" value={s.avg_sleep || '—'} unit="h" color="#818CF8" />
          <StatCard label="Avg Energy" value={s.avg_energy || '—'} unit="/10" color="#FCD34D" />
          <StatCard label="Avg Mood" value={s.avg_mood || '—'} unit="/10" color="#F472B6" />
        </div>
      )}

      {/* Weight chart */}
      <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50">
        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-4">⚖️ Weight</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6EE7B7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6EE7B7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} />
            <YAxis domain={['auto', 'auto']} tick={{ fill: '#6B7280', fontSize: 11 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area type="monotone" dataKey="weight" stroke="#6EE7B7" strokeWidth={2} fill="url(#wGrad)" dot={{ fill: '#6EE7B7', r: 3 }} connectNulls />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sleep chart */}
      <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50">
        <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-widest mb-4">🌙 Sleep</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} />
            <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9CA3AF' }} />
            <Line type="monotone" dataKey="sleep" name="Hours" stroke="#818CF8" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            <Line type="monotone" dataKey="sleepQ" name="Quality" stroke="#C4B5FD" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Energy & Mood */}
      <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50">
        <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-widest mb-4">⚡ Energy & Mood</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} />
            <YAxis domain={[1, 10]} tick={{ fill: '#6B7280', fontSize: 11 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9CA3AF' }} />
            <Line type="monotone" dataKey="energy" name="Energy" stroke="#FCD34D" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            <Line type="monotone" dataKey="mood" name="Mood" stroke="#F472B6" strokeWidth={2} dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Food quality */}
      <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50">
        <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-widest mb-4">🍽️ Food Quality</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} />
            <YAxis domain={[0, 10]} tick={{ fill: '#6B7280', fontSize: 11 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="food" name="Food Quality" fill="#FB923C" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top symptoms */}
      {stats?.top_symptoms && stats.top_symptoms.length > 0 && (
        <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50">
          <h3 className="text-sm font-semibold text-red-400 uppercase tracking-widest mb-4">🩺 Most frequent symptoms (30d)</h3>
          <div className="space-y-2">
            {stats.top_symptoms.map(({ symptom, count }) => {
              const pct = (parseInt(count) / parseInt(stats.summary.total_entries)) * 100;
              return (
                <div key={symptom} className="flex items-center gap-3">
                  <span className="text-sm text-gray-300 w-32 shrink-0">{symptom}</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div className="h-2 rounded-full bg-red-400/70" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">{count}x</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
