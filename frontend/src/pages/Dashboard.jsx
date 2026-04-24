import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAll } from '../services/api';

const features = [
  {
    key: 'contracts',
    path: '/contracts',
    icon: '📋',
    name: 'Player Contracts',
    description: 'Benchmark player contracts across leagues. Analyze values, terms, and market comparisons.',
    gradient: 'from-blue-500/20 to-blue-600/5',
    border: 'border-blue-500/20 hover:border-blue-500/40',
    accent: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-400',
  },
  {
    key: 'salary-caps',
    path: '/salary-caps',
    icon: '💰',
    name: 'Salary Caps',
    description: 'Optimize team salary cap utilization. Track spending, cap space, and dead money.',
    gradient: 'from-green-500/20 to-green-600/5',
    border: 'border-green-500/20 hover:border-green-500/40',
    accent: 'text-green-400',
    badge: 'bg-green-500/20 text-green-400',
  },
  {
    key: 'endorsements',
    path: '/endorsements',
    icon: '🤝',
    name: 'Endorsements',
    description: 'Match players with endorsement opportunities. Analyze brand deals and market reach.',
    gradient: 'from-purple-500/20 to-purple-600/5',
    border: 'border-purple-500/20 hover:border-purple-500/40',
    accent: 'text-purple-400',
    badge: 'bg-purple-500/20 text-purple-400',
  },
  {
    key: 'free-agents',
    path: '/free-agents',
    icon: '🏃',
    name: 'Free Agents',
    description: 'Analyze the free agency market. Track projected values and market demand.',
    gradient: 'from-amber-500/20 to-amber-600/5',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    accent: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-400',
  },
  {
    key: 'negotiations',
    path: '/negotiations',
    icon: '⚖️',
    name: 'Negotiations',
    description: 'AI-powered negotiation assistant. Manage offers, leverage points, and deadlines.',
    gradient: 'from-red-500/20 to-red-600/5',
    border: 'border-red-500/20 hover:border-red-500/40',
    accent: 'text-red-400',
    badge: 'bg-red-500/20 text-red-400',
  },
  {
    key: 'performance',
    path: '/performance',
    icon: '📊',
    name: 'Performance',
    description: 'Player performance analytics. Track stats, efficiency, and market value impact.',
    gradient: 'from-cyan-500/20 to-cyan-600/5',
    border: 'border-cyan-500/20 hover:border-cyan-500/40',
    accent: 'text-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-400',
  },
  {
    key: 'draft-scouting',
    path: '/draft-scouting',
    icon: '🎯',
    name: 'Draft Scouting',
    description: 'Track draft prospects, scouting reports, and projected draft positions across leagues.',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    accent: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-400',
  },
  {
    key: 'injury-reports',
    path: '/injury-reports',
    icon: '🏥',
    name: 'Injury Reports',
    description: 'Monitor player injuries, recovery timelines, and contract impact analysis.',
    gradient: 'from-rose-500/20 to-rose-600/5',
    border: 'border-rose-500/20 hover:border-rose-500/40',
    accent: 'text-rose-400',
    badge: 'bg-rose-500/20 text-rose-400',
  },
  {
    key: 'team-rosters',
    path: '/team-rosters',
    icon: '👥',
    name: 'Team Rosters',
    description: 'Manage team rosters, depth charts, and roster composition analysis.',
    gradient: 'from-indigo-500/20 to-indigo-600/5',
    border: 'border-indigo-500/20 hover:border-indigo-500/40',
    accent: 'text-indigo-400',
    badge: 'bg-indigo-500/20 text-indigo-400',
  },
  {
    key: 'trade-analysis',
    path: '/trade-analysis',
    icon: '🔄',
    name: 'Trade Analysis',
    description: 'Evaluate trade scenarios, grade deals, and analyze multi-team transactions.',
    gradient: 'from-orange-500/20 to-orange-600/5',
    border: 'border-orange-500/20 hover:border-orange-500/40',
    accent: 'text-orange-400',
    badge: 'bg-orange-500/20 text-orange-400',
  },
  {
    key: 'clients',
    path: '/clients',
    icon: '🧑‍💼',
    name: 'Client Management',
    description: 'Manage athlete clients, contact info, representation status, and commission rates.',
    gradient: 'from-sky-500/20 to-sky-600/5',
    border: 'border-sky-500/20 hover:border-sky-500/40',
    accent: 'text-sky-400',
    badge: 'bg-sky-500/20 text-sky-400',
  },
  {
    key: 'financials',
    path: '/financials',
    icon: '💵',
    name: 'Financial Tracker',
    description: 'Track commissions, expenses, and revenue across all client deals and transactions.',
    gradient: 'from-teal-500/20 to-teal-600/5',
    border: 'border-teal-500/20 hover:border-teal-500/40',
    accent: 'text-teal-400',
    badge: 'bg-teal-500/20 text-teal-400',
  },
  {
    key: 'league-rules',
    path: '/league-rules',
    icon: '📖',
    name: 'League Rules',
    description: 'Reference CBA terms, salary caps, roster limits, and key dates by league.',
    gradient: 'from-yellow-500/20 to-yellow-600/5',
    border: 'border-yellow-500/20 hover:border-yellow-500/40',
    accent: 'text-yellow-400',
    badge: 'bg-yellow-500/20 text-yellow-400',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    features.forEach(async (f) => {
      try {
        const res = await getAll(f.key);
        const data = res.data;
        const count = Array.isArray(data) ? data.length : (data?.data ? data.data.length : 0);
        setCounts((prev) => ({ ...prev, [f.key]: count }));
      } catch {
        setCounts((prev) => ({ ...prev, [f.key]: 0 }));
      }
    });
  }, []);

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-400 text-sm">Welcome to the AI Sports Agent Contract Analyzer</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {features.map((f) => (
          <div key={f.key} className="bg-navy-800 rounded-lg border border-navy-700 p-3 text-center">
            <p className="text-2xl font-bold text-white">{counts[f.key] ?? '—'}</p>
            <p className="text-gray-500 text-xs mt-0.5">{f.name}</p>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {features.map((feature) => (
          <button
            key={feature.key}
            onClick={() => navigate(feature.path)}
            className={`group text-left bg-gradient-to-br ${feature.gradient} bg-navy-800 rounded-xl border ${feature.border} p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-3xl">{feature.icon}</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${feature.badge}`}>
                {counts[feature.key] ?? '—'}
              </span>
            </div>
            <h3 className="text-white font-bold text-lg mb-1 group-hover:text-accent-blue transition-colors">
              {feature.name}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {feature.description}
            </p>
            <div className={`mt-4 flex items-center gap-1 text-sm font-medium ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity`}>
              Open
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
