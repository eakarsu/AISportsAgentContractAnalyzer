import React, { useState } from 'react';
import AIAnalysisPanel from './AIAnalysisPanel';
import { aiAnalyze } from '../services/api';

function formatLabel(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(key, value) {
  if (value === null || value === undefined || value === '') return '—';
  if (/value|salary|money|price|offer|cap|spending|dead_money|top_salary/.test(key) && typeof value === 'number') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  }
  if (/utilization/.test(key) && typeof value === 'number') {
    return `${(value * (value < 1 ? 100 : 1)).toFixed(1)}%`;
  }
  if (/date/.test(key) && value) {
    try {
      return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return String(value); }
  }
  if (/followers/.test(key) && typeof value === 'number') {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  }
  return String(value);
}

function getValueColor(key, value) {
  if (/status/.test(key)) {
    const v = String(value).toLowerCase();
    if (/active|signed|completed|approved/.test(v)) return 'text-accent-green';
    if (/pending|negotiating|in.?progress/.test(v)) return 'text-accent-gold';
    if (/expired|rejected|cancelled|inactive/.test(v)) return 'text-accent-red';
  }
  if (/demand/.test(key)) {
    const v = String(value).toLowerCase();
    if (/high/.test(v)) return 'text-accent-green';
    if (/medium/.test(v)) return 'text-accent-gold';
    if (/low/.test(v)) return 'text-accent-red';
  }
  if (/trend/.test(key)) {
    const v = String(value).toLowerCase();
    if (/up|rising|improving/.test(v)) return 'text-accent-green';
    if (/down|declining|falling/.test(v)) return 'text-accent-red';
  }
  if (/priority/.test(key)) {
    const v = String(value).toLowerCase();
    if (/high|critical/.test(v)) return 'text-accent-red';
    if (/medium/.test(v)) return 'text-accent-gold';
  }
  return 'text-white';
}

const hiddenFields = ['id', '_id', '__v', 'createdAt', 'updatedAt', 'created_at', 'updated_at'];

export default function DetailModal({ item, feature, fields, onClose, onEdit, onDelete }) {
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  if (!item) return null;

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setShowAnalysis(true);
    try {
      const res = await aiAnalyze(feature, item);
      setAnalysis(res.data?.analysis || res.data?.result || res.data?.data || JSON.stringify(res.data));
    } catch (err) {
      setAnalysis('Analysis could not be completed. Please try again.\n\nError: ' + (err.response?.data?.message || err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const displayFields = fields.filter((f) => !hiddenFields.includes(f));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[5vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-navy-800 rounded-xl border border-navy-700 w-full max-w-3xl max-h-[90vh] overflow-hidden scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-navy-700 bg-gradient-to-r from-accent-blue/10 to-accent-green/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-lg">
                {item.player_name || item.team || item.brand || 'Item Details'}
              </h3>
              <p className="text-gray-400 text-sm mt-0.5">
                {item.team && item.player_name ? item.team : ''} {item.league ? `• ${item.league}` : ''} {item.position ? `• ${item.position}` : ''}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
          {/* Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayFields.map((field) => (
              <div
                key={field}
                className={`bg-navy-900/50 rounded-lg p-3 border border-navy-700/50 ${
                  /notes|summary|leverage_points|injury_history/.test(field) ? 'sm:col-span-2' : ''
                }`}
              >
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
                  {formatLabel(field)}
                </p>
                <p className={`text-sm font-medium ${getValueColor(field, item[field])}`}>
                  {formatValue(field, item[field])}
                </p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-blue to-accent-purple text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-accent-blue/20 transition-all disabled:opacity-50"
            >
              <span>🤖</span>
              {analyzing ? 'Analyzing...' : 'AI Analyze'}
            </button>
            <button
              onClick={() => onEdit(item)}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent-gold/20 text-accent-gold text-sm font-medium rounded-lg hover:bg-accent-gold/30 transition-all border border-accent-gold/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => onDelete(item)}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500/20 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/30 transition-all border border-red-500/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>

          {/* AI Analysis */}
          {showAnalysis && (
            <AIAnalysisPanel
              analysis={analysis}
              loading={analyzing}
              onClose={() => { setShowAnalysis(false); setAnalysis(null); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
