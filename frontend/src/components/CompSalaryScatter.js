import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const PALETTE = [
  '#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
];

function formatMoney(v) {
  if (!v && v !== 0) return '$0';
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${Math.round(v)}`;
}

export default function CompSalaryScatter() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/custom-views/comp-salary-scatter', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => setSeries(r.data.series || []))
      .catch((e) => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-gray-400">Loading comparable salary scatter…</div>;
  if (error) return <div className="p-4 text-red-400">Error: {error}</div>;
  if (!series.length) return <div className="p-4 text-gray-400">No comparable contracts found.</div>;

  return (
    <div className="bg-navy-800/60 border border-navy-700 rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white">Comparable Salary Scatter</h3>
        <p className="text-sm text-gray-400">Years vs. Average Annual Value (AAV), colored by position.</p>
      </div>
      <div style={{ width: '100%', height: 420 }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 10 }}>
            <CartesianGrid stroke="#1e293b" />
            <XAxis
              type="number"
              dataKey="years"
              name="Years"
              stroke="#94a3b8"
              label={{ value: 'Contract Years', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
              domain={[0, 'dataMax + 1']}
            />
            <YAxis
              type="number"
              dataKey="aav"
              name="AAV"
              stroke="#94a3b8"
              tickFormatter={formatMoney}
              label={{ value: 'AAV', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <ZAxis range={[80, 80]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#e2e8f0' }}
              formatter={(value, key) => key === 'aav' ? formatMoney(value) : value}
              labelFormatter={() => ''}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const p = payload[0].payload;
                return (
                  <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: 8, color: '#e2e8f0', fontSize: 12 }}>
                    <div><b>{p.player_name}</b> ({p.position})</div>
                    <div>{p.team} – {p.league}</div>
                    <div>{p.years} yrs • AAV {formatMoney(p.aav)}</div>
                    <div>Total {formatMoney(p.contract_value)}</div>
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ color: '#cbd5e1' }} />
            {series.map((s, idx) => (
              <Scatter
                key={s.position}
                name={`${s.position} (${s.count})`}
                data={s.points}
                fill={PALETTE[idx % PALETTE.length]}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
