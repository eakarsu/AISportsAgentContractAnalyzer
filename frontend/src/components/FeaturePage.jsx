import React, { useState, useEffect, useCallback } from 'react';
import { getAll, create, update, remove } from '../services/api';
import FormModal from './FormModal';
import DetailModal from './DetailModal';

function formatCurrency(val) {
  if (val === null || val === undefined || val === '') return '—';
  const n = Number(val);
  if (isNaN(n)) return val;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function formatCellValue(key, val) {
  if (val === null || val === undefined || val === '') return '—';
  if (/value|salary|money|price|offer|cap|spending|dead_money|top_salary/.test(key)) {
    const n = Number(val);
    if (!isNaN(n)) return formatCurrency(n);
  }
  if (/utilization/.test(key)) {
    const n = Number(val);
    if (!isNaN(n)) return `${(n * (n < 1 ? 100 : 1)).toFixed(1)}%`;
  }
  if (/followers/.test(key)) {
    const n = Number(val);
    if (!isNaN(n)) {
      if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    }
  }
  if (/date/.test(key)) {
    try {
      return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return String(val); }
  }
  return String(val);
}

function getStatusClasses(val) {
  if (!val) return '';
  const v = String(val).toLowerCase();
  if (/active|signed|completed|approved/.test(v)) return 'bg-green-500/10 text-green-400 border-green-500/20';
  if (/pending|negotiating|in.?progress/.test(v)) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
  if (/expired|rejected|cancelled|inactive|failed/.test(v)) return 'bg-red-500/10 text-red-400 border-red-500/20';
  if (/high/.test(v)) return 'bg-green-500/10 text-green-400 border-green-500/20';
  if (/medium/.test(v)) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
  if (/low/.test(v)) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (/up|rising|improving/.test(v)) return 'bg-green-500/10 text-green-400 border-green-500/20';
  if (/down|declining/.test(v)) return 'bg-red-500/10 text-red-400 border-red-500/20';
  return 'bg-navy-700/50 text-gray-300 border-navy-600';
}

function isStatusField(key) {
  return /status|demand|trend|priority|market_reach/.test(key);
}

export default function FeaturePage({
  feature,
  title,
  description,
  icon,
  accentColor,
  fields,
  tableColumns,
  selectOptions,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAll(feature);
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [feature]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreate = async (data) => {
    try {
      await create(feature, data);
      setShowForm(false);
      fetchItems();
    } catch (err) {
      alert('Error creating item: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdate = async (data) => {
    try {
      const id = editItem.id || editItem._id;
      await update(feature, id, data);
      setEditItem(null);
      setSelectedItem(null);
      fetchItems();
    } catch (err) {
      alert('Error updating item: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (item) => {
    try {
      const id = item.id || item._id;
      await remove(feature, id);
      setDeleteConfirm(null);
      setSelectedItem(null);
      fetchItems();
    } catch (err) {
      alert('Error deleting item: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    return Object.values(item).some((v) => String(v).toLowerCase().includes(lower));
  });

  const accentMap = {
    blue: { btn: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20', headerGrad: 'from-blue-500/20 to-blue-600/5' },
    green: { btn: 'bg-green-500 hover:bg-green-600 shadow-green-500/20', headerGrad: 'from-green-500/20 to-green-600/5' },
    purple: { btn: 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/20', headerGrad: 'from-purple-500/20 to-purple-600/5' },
    amber: { btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20', headerGrad: 'from-amber-500/20 to-amber-600/5' },
    red: { btn: 'bg-red-500 hover:bg-red-600 shadow-red-500/20', headerGrad: 'from-red-500/20 to-red-600/5' },
    cyan: { btn: 'bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/20', headerGrad: 'from-cyan-500/20 to-cyan-600/5' },
  };
  const colors = accentMap[accentColor] || accentMap.blue;

  return (
    <div>
      {/* Header */}
      <div className={`bg-gradient-to-r ${colors.headerGrad} bg-navy-800 rounded-xl border border-navy-700 p-6 mb-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{icon}</span>
            <div>
              <h1 className="text-xl font-bold text-white">{title}</h1>
              <p className="text-gray-400 text-sm">{description}</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className={`flex items-center gap-2 px-5 py-2.5 ${colors.btn} text-white text-sm font-medium rounded-lg shadow-lg transition-all`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
          />
        </div>
      </div>

      {/* Data table */}
      <div className="bg-navy-800 rounded-xl border border-navy-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-navy-700 border-t-accent-blue animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-4xl block mb-3">{icon}</span>
            <p className="text-gray-400 font-medium">No items found</p>
            <p className="text-gray-600 text-sm mt-1">Click "Add New" to create your first entry</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-700">
                  {tableColumns.map((col) => (
                    <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700/50">
                {filteredItems.map((item, idx) => (
                  <tr
                    key={item.id || item._id || idx}
                    onClick={() => setSelectedItem(item)}
                    className="hover:bg-navy-700/30 cursor-pointer transition-colors"
                  >
                    {tableColumns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-sm whitespace-nowrap">
                        {isStatusField(col.key) ? (
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusClasses(item[col.key])}`}>
                            {item[col.key] || '—'}
                          </span>
                        ) : (
                          <span className={col.key === tableColumns[0].key ? 'text-white font-medium' : 'text-gray-300'}>
                            {formatCellValue(col.key, item[col.key])}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && filteredItems.length > 0 && (
          <div className="px-4 py-3 border-t border-navy-700 flex items-center justify-between">
            <p className="text-gray-500 text-xs">
              Showing {filteredItems.length} of {items.length} items
            </p>
          </div>
        )}
      </div>

      {/* Create form modal */}
      {showForm && (
        <FormModal
          title={`Add New ${title.replace(/s$/, '')}`}
          fields={fields}
          selectOptions={selectOptions}
          onSave={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Edit form modal */}
      {editItem && (
        <FormModal
          title={`Edit ${title.replace(/s$/, '')}`}
          fields={fields}
          data={editItem}
          selectOptions={selectOptions}
          onSave={handleUpdate}
          onClose={() => setEditItem(null)}
        />
      )}

      {/* Detail modal */}
      {selectedItem && !editItem && (
        <DetailModal
          item={selectedItem}
          feature={feature}
          fields={fields}
          onClose={() => setSelectedItem(null)}
          onEdit={(item) => setEditItem(item)}
          onDelete={(item) => setDeleteConfirm(item)}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-navy-800 rounded-xl border border-navy-700 p-6 max-w-sm w-full scale-in">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Delete Item?</h3>
              <p className="text-gray-400 text-sm mb-6">
                This will permanently delete <span className="text-white font-medium">{deleteConfirm.player_name || deleteConfirm.team || deleteConfirm.brand || 'this item'}</span>. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-400 bg-navy-700 hover:bg-navy-600 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
