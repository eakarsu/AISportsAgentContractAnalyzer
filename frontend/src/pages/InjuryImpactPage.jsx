import React, { useState } from 'react';
import api from '../services/api';

export default function InjuryImpactPage() {
  const [form, setForm] = useState({
    player_name: '',
    position: '',
    sport: '',
    age: '',
    injury_type: '',
    injury_severity: 'moderate',
    current_salary: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true); setResult(null);
    try {
      const payload = {
        player_name: form.player_name,
        position: form.position,
        sport: form.sport,
        age: form.age ? Number(form.age) : undefined,
        injury_type: form.injury_type,
        injury_severity: form.injury_severity,
        current_salary: form.current_salary ? Number(form.current_salary) : undefined,
      };
      const res = await api.post('/ai/injury-impact', payload);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to project injury impact');
    } finally {
      setLoading(false);
    }
  };

  const impact = result?.impact || result;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Injury Impact Projection</h1>
        <p className="text-gray-500 text-sm mt-1">AI projects recovery timeline, performance decay, and earnings impact.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Player Name</label>
            <input type="text" value={form.player_name} onChange={(e) => handleChange('player_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Position</label>
            <input type="text" value={form.position} onChange={(e) => handleChange('position', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sport</label>
            <input type="text" value={form.sport} onChange={(e) => handleChange('sport', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input type="number" value={form.age} onChange={(e) => handleChange('age', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Injury Type *</label>
            <input type="text" required value={form.injury_type} onChange={(e) => handleChange('injury_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g. ACL tear" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Severity</label>
            <select value={form.injury_severity} onChange={(e) => handleChange('injury_severity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
              <option value="career-threatening">Career-threatening</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Current Salary (annual)</label>
            <input type="number" value={form.current_salary} onChange={(e) => handleChange('current_salary', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Projecting...' : 'Project Impact'}
        </button>
      </form>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-4">{error}</div>}

      {impact && (
        <div className="bg-white rounded-xl shadow p-6 space-y-3">
          <h2 className="font-semibold text-lg">Impact</h2>
          <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-3 rounded">{JSON.stringify(impact, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
