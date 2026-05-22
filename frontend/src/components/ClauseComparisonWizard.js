import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ALL_CLAUSE_TYPES = [
  { key: 'base_salary', label: 'Base Salary' },
  { key: 'signing_bonus', label: 'Signing Bonus' },
  { key: 'guaranteed_money', label: 'Guaranteed Money' },
  { key: 'term', label: 'Term (Years)' },
  { key: 'no_trade', label: 'No-Trade Clause' },
  { key: 'total_value', label: 'Total Value' },
];

function riskColor(label) {
  if (label === 'High') return 'text-red-400 bg-red-500/10 border-red-500/30';
  if (label === 'Medium') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
  return 'text-green-400 bg-green-500/10 border-green-500/30';
}

export default function ClauseComparisonWizard() {
  const [step, setStep] = useState(1);
  const [contracts, setContracts] = useState([]);
  const [aId, setAId] = useState('');
  const [bId, setBId] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(['base_salary', 'guaranteed_money', 'term']);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/contracts?limit=100', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        const list = r.data.data || r.data || [];
        setContracts(list);
        if (list.length >= 2) {
          setAId(String(list[0].id));
          setBId(String(list[1].id));
        }
      })
      .catch((e) => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleType = (key) => {
    setSelectedTypes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleCompare = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const resp = await axios.post(
        '/api/custom-views/clause-comparison',
        { contract_a_id: Number(aId), contract_b_id: Number(bId), clause_types: selectedTypes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(resp.data);
      setStep(3);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep(1);
    setResult(null);
  };

  if (loading) return <div className="p-4 text-gray-400">Loading contracts…</div>;

  return (
    <div className="bg-navy-800/60 border border-navy-700 rounded-xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Clause Comparison Wizard</h3>
          <p className="text-sm text-gray-400">Step {step} of 3</p>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1 w-10 rounded ${n <= step ? 'bg-accent-blue' : 'bg-navy-700'}`}
            />
          ))}
        </div>
      </div>

      {error && <div className="text-red-400 text-sm mb-3">Error: {error}</div>}

      {step === 1 && (
        <div>
          <div className="text-sm text-gray-300 mb-3">Pick two contracts to compare.</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Contract A</label>
              <select
                value={aId}
                onChange={(e) => setAId(e.target.value)}
                className="w-full bg-navy-900 border border-navy-700 text-sm text-white px-3 py-2 rounded-lg"
              >
                {contracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.player_name} – {c.team}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Contract B</label>
              <select
                value={bId}
                onChange={(e) => setBId(e.target.value)}
                className="w-full bg-navy-900 border border-navy-700 text-sm text-white px-3 py-2 rounded-lg"
              >
                {contracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.player_name} – {c.team}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!aId || !bId || aId === bId}
              className="px-4 py-2 bg-accent-blue text-white text-sm rounded-lg disabled:opacity-50"
            >
              Next: Select Clauses
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="text-sm text-gray-300 mb-3">Select clause types to compare.</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {ALL_CLAUSE_TYPES.map((t) => (
              <label
                key={t.key}
                className="flex items-center gap-2 px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg cursor-pointer text-sm text-gray-200"
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(t.key)}
                  onChange={() => toggleType(t.key)}
                />
                {t.label}
              </label>
            ))}
          </div>
          <div className="mt-4 flex justify-between">
            <button onClick={() => setStep(1)} className="px-4 py-2 bg-navy-700 text-white text-sm rounded-lg">Back</button>
            <button
              onClick={handleCompare}
              disabled={submitting || selectedTypes.length === 0}
              className="px-4 py-2 bg-accent-blue text-white text-sm rounded-lg disabled:opacity-50"
            >
              {submitting ? 'Comparing…' : 'Run Comparison'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && result && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-300">
              <span className="text-white font-medium">{result.contract_a.player_name}</span>
              {' vs '}
              <span className="text-white font-medium">{result.contract_b.player_name}</span>
            </div>
            <div className={`px-3 py-1 text-xs font-medium rounded border ${riskColor(result.overall_risk_label)}`}>
              Overall Risk: {result.overall_risk_score} ({result.overall_risk_label})
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-navy-700">
                  <th className="px-3 py-2">Clause</th>
                  <th className="px-3 py-2">{result.contract_a.player_name}</th>
                  <th className="px-3 py-2">{result.contract_b.player_name}</th>
                  <th className="px-3 py-2">Diff %</th>
                  <th className="px-3 py-2">Risk</th>
                </tr>
              </thead>
              <tbody>
                {result.comparisons.map((c) => (
                  <tr key={c.clause_type} className="border-b border-navy-800">
                    <td className="px-3 py-2 text-gray-300 font-medium">{c.clause_type}</td>
                    <td className="px-3 py-2 text-gray-200">{c.a.text}</td>
                    <td className="px-3 py-2 text-gray-200">{c.b.text}</td>
                    <td className="px-3 py-2 text-gray-400">{(c.diff_pct * 100).toFixed(1)}%</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 text-xs rounded border ${riskColor(c.risk_label)}`}>
                        {c.risk_score} {c.risk_label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between">
            <button onClick={reset} className="px-4 py-2 bg-navy-700 text-white text-sm rounded-lg">Start Over</button>
            <button onClick={() => setStep(2)} className="px-4 py-2 bg-accent-blue text-white text-sm rounded-lg">Adjust Clauses</button>
          </div>
        </div>
      )}
    </div>
  );
}
