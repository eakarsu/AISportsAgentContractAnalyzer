import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function NegotiationWarRoom() {
  const [negotiations, setNegotiations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [roundForm, setRoundForm] = useState({ offered_by: 'Agent', offer_amount: '', counter_amount: '', notes: '' });
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchNegotiations();
  }, [page]);

  const fetchNegotiations = async () => {
    try {
      const res = await api.get(`/negotiations?page=${page}&limit=10`);
      setNegotiations(res.data.data || res.data);
      if (res.data.pagination) setPagination(res.data.pagination);
    } catch (err) {
      setError('Failed to load negotiations');
    }
  };

  const selectNegotiation = async (neg) => {
    setSelected(neg);
    setAiAnalysis(null);
    setError('');
    try {
      const res = await api.get(`/negotiations/${neg.id}`);
      setSelected(res.data);
      setRounds(res.data.rounds || []);
    } catch (err) {
      setError('Failed to load negotiation details');
    }
  };

  const handleAddRound = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setError('');
    try {
      const payload = {
        offered_by: roundForm.offered_by,
        notes: roundForm.notes,
        ...(roundForm.offer_amount && { offer_amount: parseFloat(roundForm.offer_amount) }),
        ...(roundForm.counter_amount && { counter_amount: parseFloat(roundForm.counter_amount) }),
      };
      const res = await api.post(`/negotiations/${selected.id}/add-round`, payload);
      setRounds([...rounds, res.data]);
      setRoundForm({ offered_by: 'Agent', offer_amount: '', counter_amount: '', notes: '' });
      // Refresh negotiation
      selectNegotiation(selected);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add round');
    } finally {
      setLoading(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (!selected) return;
    setAiLoading(true);
    setError('');
    try {
      const res = await api.post(`/negotiations/${selected.id}/ai-analyze-rounds`);
      setAiAnalysis(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'AI analysis failed');
    } finally {
      setAiLoading(false);
    }
  };

  const formatMoney = (val) => {
    if (!val) return 'N/A';
    return '$' + parseFloat(val).toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  const statusColor = (status) => {
    if (status === 'Completed') return 'bg-green-100 text-green-800';
    if (status === 'In Progress') return 'bg-blue-100 text-blue-800';
    if (status === 'On Hold') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Negotiation War Room</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Negotiations List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b">
              <h2 className="font-semibold text-gray-700">Active Negotiations</h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {negotiations.map(neg => (
                <div
                  key={neg.id}
                  onClick={() => selectNegotiation(neg)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${selected?.id === neg.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                >
                  <p className="font-medium text-gray-900 text-sm">{neg.player_name}</p>
                  <p className="text-xs text-gray-500">{neg.team} · Round {neg.round}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor(neg.status)}`}>{neg.status}</span>
                    <span className="text-xs text-gray-500">{neg.priority}</span>
                  </div>
                </div>
              ))}
              {negotiations.length === 0 && (
                <p className="text-gray-500 text-sm p-4">No negotiations found.</p>
              )}
            </div>
            {pagination && pagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t flex justify-between items-center">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
                >Prev</button>
                <span className="text-xs text-gray-600">{page} / {pagination.totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
                >Next</button>
              </div>
            )}
          </div>
        </div>

        {/* War Room Detail */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Select a negotiation to open the War Room
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{selected.player_name}</h2>
                    <p className="text-sm text-gray-500">{selected.team} · Agent: {selected.agent_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${statusColor(selected.status)}`}>{selected.status}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded p-2 text-center">
                    <p className="text-xs text-gray-500">Current Offer</p>
                    <p className="font-bold text-gray-800 text-sm">{formatMoney(selected.current_offer)}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2 text-center">
                    <p className="text-xs text-gray-500">Asking Price</p>
                    <p className="font-bold text-gray-800 text-sm">{formatMoney(selected.asking_price)}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2 text-center">
                    <p className="text-xs text-gray-500">Round</p>
                    <p className="font-bold text-gray-800 text-sm">{selected.round}</p>
                  </div>
                </div>
              </div>

              {/* Round Timeline */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Negotiation Timeline</h3>
                {rounds.length === 0 ? (
                  <p className="text-sm text-gray-500">No rounds yet. Add the first round below.</p>
                ) : (
                  <div className="space-y-2">
                    {rounds.map((round, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">{round.round_number}</div>
                          {i < rounds.length - 1 && <div className="w-0.5 h-4 bg-gray-200 mt-1" />}
                        </div>
                        <div className="flex-1 bg-gray-50 rounded p-3 mb-1">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-medium text-gray-700">{round.offered_by}</span>
                            <span className="text-xs text-gray-400">{new Date(round.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="mt-1 flex gap-4 text-xs">
                            {round.offer_amount && <span>Offer: <strong>{formatMoney(round.offer_amount)}</strong></span>}
                            {round.counter_amount && <span>Counter: <strong>{formatMoney(round.counter_amount)}</strong></span>}
                          </div>
                          {round.notes && <p className="text-xs text-gray-500 mt-1">{round.notes}</p>}
                          {round.ai_analysis && (
                            <div className="mt-2 bg-purple-50 rounded p-2">
                              <p className="text-xs text-purple-700 font-medium">AI Insight</p>
                              <p className="text-xs text-purple-600">{round.ai_analysis.zopa || round.ai_analysis.summary || 'See full analysis'}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Round Form */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Add Round</h3>
                <form onSubmit={handleAddRound} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Offered By</label>
                      <select
                        value={roundForm.offered_by}
                        onChange={e => setRoundForm({ ...roundForm, offered_by: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Agent">Agent</option>
                        <option value="Team">Team</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Offer Amount ($)</label>
                      <input
                        type="number"
                        value={roundForm.offer_amount}
                        onChange={e => setRoundForm({ ...roundForm, offer_amount: e.target.value })}
                        placeholder="e.g. 25000000"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Counter Amount ($)</label>
                      <input
                        type="number"
                        value={roundForm.counter_amount}
                        onChange={e => setRoundForm({ ...roundForm, counter_amount: e.target.value })}
                        placeholder="e.g. 30000000"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                      <input
                        type="text"
                        value={roundForm.notes}
                        onChange={e => setRoundForm({ ...roundForm, notes: e.target.value })}
                        placeholder="Key points..."
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Round'}
                    </button>
                    <button
                      type="button"
                      onClick={handleAIAnalysis}
                      disabled={aiLoading}
                      className="px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                    >
                      {aiLoading ? 'Analyzing...' : 'AI ZOPA/BATNA Analysis'}
                    </button>
                  </div>
                </form>
              </div>

              {/* AI Analysis */}
              {aiAnalysis && aiAnalysis.analysis && (
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-semibold text-gray-700 mb-3">AI Negotiation Intelligence</h3>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {aiAnalysis.analysis.zopa && (
                      <div className="bg-blue-50 rounded p-2 text-center">
                        <p className="text-xs text-blue-600">ZOPA</p>
                        <p className="text-xs font-bold text-blue-800">{aiAnalysis.analysis.zopa}</p>
                      </div>
                    )}
                    {aiAnalysis.analysis.batna && (
                      <div className="bg-orange-50 rounded p-2 text-center">
                        <p className="text-xs text-orange-600">BATNA</p>
                        <p className="text-xs font-bold text-orange-800">{aiAnalysis.analysis.batna}</p>
                      </div>
                    )}
                    {aiAnalysis.analysis.leverage_score && (
                      <div className="bg-green-50 rounded p-2 text-center">
                        <p className="text-xs text-green-600">Leverage Score</p>
                        <p className="text-xs font-bold text-green-800">{aiAnalysis.analysis.leverage_score}/10</p>
                      </div>
                    )}
                  </div>
                  {aiAnalysis.analysis.summary && (
                    <p className="text-sm text-gray-600 mb-2">{aiAnalysis.analysis.summary}</p>
                  )}
                  {aiAnalysis.analysis.recommendations?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Recommendations</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {aiAnalysis.analysis.recommendations.map((r, i) => (
                          <li key={i} className="text-xs text-gray-600">{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
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
