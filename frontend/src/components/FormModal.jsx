import React, { useState, useEffect } from 'react';

function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getInputType(key) {
  if (/date/.test(key)) return 'date';
  if (/email/.test(key)) return 'email';
  if (/value|salary|money|price|offer|cap|spending|dead_money|top_salary/.test(key)) return 'number';
  if (/years|age|games|votes|wins|selections|round|num_players|followers/.test(key)) return 'number';
  if (/rating|utilization|per_game|shares|impact/.test(key)) return 'number';
  return 'text';
}

function isTextArea(key) {
  return /notes|summary|leverage_points|injury_history|stats_summary/.test(key);
}

function isSelect(key, options) {
  return options && options.length > 0;
}

export default function FormModal({ title, fields, data, selectOptions, onSave, onClose }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (data) {
      setFormData({ ...data });
    } else {
      const empty = {};
      fields.forEach((f) => {
        empty[f] = '';
      });
      setFormData(empty);
    }
  }, [data, fields]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-navy-800 rounded-xl border border-navy-700 w-full max-w-2xl max-h-[90vh] overflow-hidden scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-navy-700 flex items-center justify-between bg-gradient-to-r from-navy-800 to-navy-700">
          <h3 className="text-white font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => {
              const opts = selectOptions?.[field];
              return (
                <div key={field} className={isTextArea(field) ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    {formatLabel(field)}
                  </label>
                  {isTextArea(field) ? (
                    <textarea
                      value={formData[field] || ''}
                      onChange={(e) => handleChange(field, e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all resize-none"
                    />
                  ) : opts && opts.length > 0 ? (
                    <select
                      value={formData[field] || ''}
                      onChange={(e) => handleChange(field, e.target.value)}
                      className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
                    >
                      <option value="">Select...</option>
                      {opts.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={getInputType(field)}
                      value={formData[field] || ''}
                      onChange={(e) => handleChange(field, e.target.value)}
                      step={getInputType(field) === 'number' ? 'any' : undefined}
                      className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-navy-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-navy-700 hover:bg-navy-600 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 rounded-lg transition-all shadow-lg shadow-accent-blue/20"
            >
              {data ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
