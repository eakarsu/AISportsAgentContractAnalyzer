import React, { useState } from 'react';
import api from '../services/api';

export default function PlayerValuationPage() {
  const [form, setForm] = useState({
    player_name: '',
    position: '',
    sport: '',
    age: '',
    recent_stats: '',
    injury_history: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true); setResult(null);
    try {
      const tryParse = (s) => { try { return s ? JSON.parse(s) : undefined; } catch { return s; } };
      const payload = {
        player_name: form.player_name,
        position: form.position,
        sport: form.sport,
        age: form.age ? Number(form.age) : undefined,
        recent_stats: tryParse(form.recent_stats),
        injury_history: tryParse(form.injury_history),
      };
      const res = await api.post('/ai/player-valuation', payload);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to value player');
    } finally {
      setLoading(false);
    }
  };

  const valuation = result?.valuation || result;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Player Valuation</h1>
        <p className="text-gray-500 text-sm mt-1">AI estimate of fair open-market value based on comparable contracts.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Player Name</label>
            <input type="text" value={form.player_name} onChange={(e) => handleChange('player_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g. John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Position *</label>
            <input type="text" value={form.position} onChange={(e) => handleChange('position', e.target.value)}
              required className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g. PG" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sport</label>
            <input type="text" value={form.sport} onChange={(e) => handleChange('sport', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="NBA / NFL / MLB / NHL / Soccer" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input type="number" value={form.age} onChange={(e) => handleChange('age', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g. 27" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Recent Stats (JSON or text)</label>
            <textarea value={form.recent_stats} onChange={(e) => handleChange('recent_stats', e.target.value)}
              rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs"
              placeholder='{"ppg": 24.5, "apg": 7.2}' />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Injury History (JSON or text)</label>
            <textarea value={form.injury_history} onChange={(e) => handleChange('injury_history', e.target.value)}
              rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs"
              placeholder='[{"injury":"ACL", "year":2022}]' />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Valuing...' : 'Run Valuation'}
        </button>
      </form>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-4">{error}</div>}

      {valuation && (
        <div className="bg-white rounded-xl shadow p-6 space-y-3">
          <h2 className="font-semibold text-lg">Valuation</h2>
          <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-3 rounded">{JSON.stringify(valuation, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
