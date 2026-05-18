'use client';
import { useState } from 'react';
import LogForm from '@/components/LogForm';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [tab, setTab] = useState<'log' | 'dashboard'>('log');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSaved = () => {
    setRefreshKey(k => k + 1);
    setTimeout(() => setTab('dashboard'), 800);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-xl mx-auto px-4 pb-20">
        {/* Header */}
        <div className="pt-10 pb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">Health Log</h1>
          <p className="text-gray-500 text-sm mt-1">Quick daily check-in</p>
        </div>

        {/* Tab bar */}
        <div className="flex bg-gray-800 rounded-xl p-1 mb-6 border border-gray-700">
          <button
            onClick={() => setTab('log')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === 'log'
                ? 'bg-emerald-400 text-gray-900 shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            + Log Today
          </button>
          <button
            onClick={() => setTab('dashboard')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === 'dashboard'
                ? 'bg-emerald-400 text-gray-900 shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📈 Trends
          </button>
        </div>

        {tab === 'log' ? (
          <LogForm onSaved={handleSaved} />
        ) : (
          <Dashboard refreshKey={refreshKey} />
        )}
      </div>
    </main>
  );
}
