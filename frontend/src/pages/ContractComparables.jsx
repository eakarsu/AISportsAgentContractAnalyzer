import React, { useState } from 'react';
import api from '../services/api';

export default function ContractComparables() {
  const [form, setForm] = useState({ position: '', sport: '', limit: 10 });
  const [results, setResults] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/contracts/comparables', form);
      setResults(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch comparables');
    } finally {
      setLoading(false);
    }
  };

  const handleAIAnalysis = async () => {
    setAiLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/comparable-analysis', {
        position: form.position,
        sport: form.sport,
        player_name: 'Market Analysis',
      });
      setAiAnalysis(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'AI analysis failed');
    } finally {
      setAiLoading(false);
    }
  };

  const formatMoney = (val) => {
    if (!val) return 'N/A';
    return '$' + parseFloat(val).toLocaleString();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Contract Comparables</h1>

      <form onSubmit={handleSearch} className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input
              type="text"
              value={form.position}
              onChange={e => setForm({ ...form, position: e.target.value })}
              placeholder="e.g. Point Guard, QB"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sport/League</label>
            <input
              type="text"
              value={form.sport}
              onChange={e => setForm({ ...form, sport: e.target.value })}
              placeholder="e.g. NBA, NFL"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Results Limit</label>
            <input
              type="number"
              value={form.limit}
              onChange={e => setForm({ ...form, limit: parseInt(e.target.value) || 10 })}
              min={1}
              max={20}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Comparables'}
          </button>
          {results.length > 0 && (
            <button
              type="button"
              onClick={handleAIAnalysis}
              disabled={aiLoading}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {aiLoading ? 'Analyzing...' : 'AI Valuation Analysis'}
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-700">
              {results.length} Comparable Contract{results.length !== 1 ? 's' : ''} Found
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">League</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Annual Salary</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Value</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Years</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((contract, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{contract.player_name}</td>
                    <td className="px-4 py-3 text-gray-600">{contract.team}</td>
                    <td className="px-4 py-3 text-gray-600">{contract.position}</td>
                    <td className="px-4 py-3 text-gray-600">{contract.league}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-700">{formatMoney(contract.annual_salary)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatMoney(contract.contract_value)}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{contract.contract_years}yr</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        contract.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {contract.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {aiAnalysis && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">AI Valuation Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Recommended Market Value</p>
              <p className="text-lg font-bold text-blue-900 mt-1">{aiAnalysis.analysis?.market_value || 'N/A'}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-yellow-600 font-medium">Risk Score</p>
              <p className="text-lg font-bold text-yellow-900 mt-1">{aiAnalysis.analysis?.risk_score || 'N/A'} / 10</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Confidence</p>
              <p className="text-lg font-bold text-green-900 mt-1 capitalize">{aiAnalysis.analysis?.valuation_confidence || 'N/A'}</p>
            </div>
          </div>
          {aiAnalysis.analysis?.summary && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Summary</p>
              <p className="text-gray-600">{aiAnalysis.analysis.summary}</p>
            </div>
          )}
          {aiAnalysis.analysis?.recommendations?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Recommendations</p>
              <ul className="list-disc list-inside space-y-1">
                {aiAnalysis.analysis.recommendations.map((r, i) => (
                  <li key={i} className="text-gray-600 text-sm">{r}</li>
                ))}
              </ul>
            </div>
          )}
          {aiAnalysis.analysis?.red_flags?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Red Flags</p>
              <ul className="list-disc list-inside space-y-1">
                {aiAnalysis.analysis.red_flags.map((r, i) => (
                  <li key={i} className="text-red-600 text-sm">{r}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-4">Model: {aiAnalysis.model} | Tokens: {aiAnalysis.tokensUsed}</p>
        </div>
      )}
    </div>
  );
}
