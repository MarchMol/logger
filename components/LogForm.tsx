'use client';
import { useState } from 'react';
import { format } from 'date-fns';

const SYMPTOMS = [
  'Headache', 'Fatigue', 'Bloating', 'Joint pain',
  'Nausea', 'Brain fog', 'Anxiety', 'Back pain',
  'Poor digestion', 'Skin issues'
];

const PORTION_LABELS = ['Tiny', 'Light', 'Normal', 'Big', 'Stuffed'];
const FOOD_LABELS = ['Junk', 'Poor', 'Okay', 'Good', 'Clean'];

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  sublabels?: string[];
  onChange: (v: number) => void;
  color?: string;
};

function Slider({ label, value, min, max, step = 1, unit = '', sublabels, onChange, color = '#6EE7B7' }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-6">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">{label}</span>
        <span className="text-2xl font-bold text-white tabular-nums">
          {value}{unit}
          {sublabels && <span className="text-sm font-normal text-gray-400 ml-2">{sublabels[value - 1]}</span>}
        </span>
      </div>
      <div className="relative h-2 bg-gray-700 rounded-full">
        <div
          className="absolute h-2 rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
        />
      </div>
      {sublabels && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-600">{sublabels[0]}</span>
          <span className="text-xs text-gray-600">{sublabels[sublabels.length - 1]}</span>
        </div>
      )}
    </div>
  );
}

export default function LogForm({ onSaved }: { onSaved: () => void }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState(75);
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [mood, setMood] = useState(7);
  const [foodQuality, setFoodQuality] = useState(7);
  const [portions, setPortions] = useState(3);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleSymptom = (s: string) => {
    setSymptoms(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logged_date: date,
          weight_kg: weight,
          sleep_hours: sleepHours,
          sleep_quality: sleepQuality,
          energy,
          mood,
          food_quality: foodQuality,
          portions,
          symptoms,
          notes: notes || null,
        }),
      });
      setSaved(true);
      setTimeout(() => { setSaved(false); onSaved(); }, 1200);
    } catch (e) {
      alert('Error saving. Check your DB connection.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Date */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-gray-400 uppercase tracking-widest font-medium">Date</span>
        <input
          type="date"
          value={date}
          max={today}
          onChange={e => setDate(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-400"
        />
      </div>

      {/* Body */}
      <div className="bg-gray-800/50 rounded-2xl p-5 mb-4 border border-gray-700/50">
        <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest mb-4">⚖️ Body</p>
        <Slider label="Weight" value={weight} min={40} max={200} step={0.5} unit=" kg" onChange={setWeight} color="#6EE7B7" />
      </div>

      {/* Sleep */}
      <div className="bg-gray-800/50 rounded-2xl p-5 mb-4 border border-gray-700/50">
        <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-4">🌙 Sleep</p>
        <Slider label="Hours" value={sleepHours} min={2} max={12} step={0.5} unit="h" onChange={setSleepHours} color="#818CF8" />
        <Slider label="Quality" value={sleepQuality} min={1} max={10} onChange={setSleepQuality} color="#818CF8" />
      </div>

      {/* Mind */}
      <div className="bg-gray-800/50 rounded-2xl p-5 mb-4 border border-gray-700/50">
        <p className="text-xs text-yellow-400 font-semibold uppercase tracking-widest mb-4">⚡ Mind</p>
        <Slider label="Energy" value={energy} min={1} max={10} onChange={setEnergy} color="#FCD34D" />
        <Slider label="Mood" value={mood} min={1} max={10} onChange={setMood} color="#FCD34D" />
      </div>

      {/* Food */}
      <div className="bg-gray-800/50 rounded-2xl p-5 mb-4 border border-gray-700/50">
        <p className="text-xs text-orange-400 font-semibold uppercase tracking-widest mb-4">🍽️ Food</p>
        <Slider label="Quality" value={foodQuality} min={1} max={10} onChange={setFoodQuality} color="#FB923C"
          sublabels={['Junk', '', '', '', '', '', '', '', '', 'Clean']} />
        <Slider label="Portions" value={portions} min={1} max={5} onChange={setPortions} color="#FB923C"
          sublabels={PORTION_LABELS} />
      </div>

      {/* Symptoms */}
      <div className="bg-gray-800/50 rounded-2xl p-5 mb-4 border border-gray-700/50">
        <p className="text-xs text-red-400 font-semibold uppercase tracking-widest mb-4">🩺 Symptoms today</p>
        <div className="flex flex-wrap gap-2">
          {SYMPTOMS.map(s => (
            <button
              key={s}
              onClick={() => toggleSymptom(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                symptoms.includes(s)
                  ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                  : 'bg-gray-700 text-gray-400 border border-gray-600 hover:border-gray-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-gray-800/50 rounded-2xl p-5 mb-6 border border-gray-700/50">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-3">📝 Notes (optional)</p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Anything worth noting..."
          rows={2}
          className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 resize-none placeholder-gray-600"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving || saved}
        className={`w-full py-4 rounded-2xl font-bold text-lg tracking-wide transition-all ${
          saved
            ? 'bg-emerald-500 text-white'
            : 'bg-emerald-400 hover:bg-emerald-300 text-gray-900 active:scale-95'
        }`}
      >
        {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Today'}
      </button>
    </div>
  );
}
