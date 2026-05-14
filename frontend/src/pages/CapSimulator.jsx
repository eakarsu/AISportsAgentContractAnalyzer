import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function CapSimulator() {
  const [form, setForm] = useState({ team: '', league: '', total_cap: '', action: 'sign', new_salary: '', player_id: '' });
  const [contracts, setContracts] = useState([]);
  const [capCalc, setCapCalc] = useState(null);
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calcLoading, setCalcLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCalculate = async (e) => {
    e.preventDefault();
    setCalcLoading(true);
    setError('');
    try {
      const res = await api.post('/salary-caps/calculate', {
        team: form.team,
        league: form.league,
        total_cap: parseFloat(form.total_cap),
      });
      setCapCalc(res.data);
      setContracts(res.data.players || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to calculate cap');
    } finally {
      setCalcLoading(false);
    }
  };

  const handleSimulate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/salary-caps/simulate', {
        team: form.team,
        league: form.league,
        total_cap: parseFloat(form.total_cap),
        action: form.action,
        player_id: form.player_id ? parseInt(form.player_id) : undefined,
        new_salary: form.new_salary ? parseFloat(form.new_salary) : undefined,
      });
      setSimResult(res.data.simulation);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to simulate');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (val) => {
    if (val === null || val === undefined) return 'N/A';
    return '$' + parseFloat(val).toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Cap Simulator - What-If Engine</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <form onSubmit={handleCalculate} className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Cap Space Calculator</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                <input
                  type="text"
                  value={form.team}
                  onChange={e => setForm({ ...form, team: e.target.value })}
                  placeholder="e.g. Los Angeles Lakers"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">League</label>
                <input
                  type="text"
                  value={form.league}
                  onChange={e => setForm({ ...form, league: e.target.value })}
                  placeholder="e.g. NBA"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Cap ($)</label>
                <input
                  type="number"
                  value={form.total_cap}
                  onChange={e => setForm({ ...form, total_cap: e.target.value })}
                  placeholder="e.g. 136000000"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={calcLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {calcLoading ? 'Calculating...' : 'Calculate Current Cap'}
              </button>
            </div>
          </form>

          {capCalc && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-700 mb-3">Current Cap Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Cap</span>
                  <span className="font-medium">{formatMoney(capCalc.total_cap)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Spending</span>
                  <span className="font-medium text-red-600">{formatMoney(capCalc.current_spending)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cap Space</span>
                  <span className={`font-medium ${capCalc.cap_space >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatMoney(capCalc.cap_space)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cap Utilization</span>
                  <span className="font-medium">{capCalc.cap_utilization}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Contracts</span>
                  <span className="font-medium">{capCalc.active_contracts}</span>
                </div>
              </div>
              <div className="mt-3 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${parseFloat(capCalc.cap_utilization) > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(100, parseFloat(capCalc.cap_utilization))}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">What-If Simulation</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <select
                  value={form.action}
                  onChange={e => setForm({ ...form, action: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sign">Sign Player</option>
                  <option value="cut">Cut Player</option>
                  <option value="extend">Extend Player</option>
                </select>
              </div>
              {form.action !== 'sign' && contracts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Player</label>
                  <select
                    value={form.player_id}
                    onChange={e => setForm({ ...form, player_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select --</option>
                    {contracts.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.player_name} ({formatMoney(c.annual_salary)}/yr)
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {(form.action === 'sign' || form.action === 'extend') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Salary ($)</label>
                  <input
                    type="number"
                    value={form.new_salary}
                    onChange={e => setForm({ ...form, new_salary: e.target.value })}
                    placeholder="e.g. 15000000"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <button
                onClick={handleSimulate}
                disabled={loading || !form.team || !form.total_cap}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Simulating...' : 'Run Simulation'}
              </button>
            </div>
          </div>

          {simResult && (
            <div className={`bg-white rounded-lg shadow p-6 ${simResult.over_cap ? 'border-2 border-red-300' : 'border-2 border-green-300'}`}>
              <h3 className="font-semibold text-gray-700 mb-3">Simulation Result</h3>
              {simResult.over_cap && (
                <div className="bg-red-50 text-red-700 px-3 py-2 rounded mb-3 text-sm font-medium">
                  WARNING: This action would put team over the salary cap!
                </div>
              )}
              <p className="text-sm text-gray-600 mb-3 italic">{simResult.impact_description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Cap Space</span>
                  <span className={`font-medium ${simResult.current_cap_space >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatMoney(simResult.current_cap_space)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Simulated Cap Space</span>
                  <span className={`font-medium ${simResult.simulated_cap_space >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatMoney(simResult.simulated_cap_space)}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-gray-700 font-medium">Delta</span>
                  <span className={`font-bold ${simResult.spending_delta > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {simResult.spending_delta > 0 ? '+' : ''}{formatMoney(simResult.spending_delta)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-4">
          {error}
        </div>
      )}
    </div>
  );
}
