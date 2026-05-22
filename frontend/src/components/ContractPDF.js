import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ContractPDF() {
  const [contracts, setContracts] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/contracts?limit=100', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        const list = r.data.data || r.data || [];
        setContracts(list);
        if (list.length) setSelectedId(String(list[0].id));
      })
      .catch((e) => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async () => {
    if (!selectedId) return;
    setDownloading(true);
    setStatus('');
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const resp = await axios.get(
        `/api/custom-views/contract-pdf?contract_id=${selectedId}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
      );
      const blob = new Blob([resp.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract_${selectedId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setStatus(`Downloaded contract_${selectedId}.pdf`);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setDownloading(false);
    }
  };

  const selected = contracts.find((c) => String(c.id) === String(selectedId));

  return (
    <div className="bg-navy-800/60 border border-navy-700 rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white">Contract PDF Export</h3>
        <p className="text-sm text-gray-400">Pick a contract and export the full agreement as a PDF.</p>
      </div>

      {loading && <div className="text-gray-400">Loading contracts…</div>}
      {error && <div className="text-red-400 text-sm mb-3">Error: {error}</div>}

      {!loading && (
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[260px]">
            <label className="block text-xs text-gray-400 mb-1">Contract</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 text-sm text-white px-3 py-2 rounded-lg"
            >
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.player_name} – {c.team} ({c.league}) – ${Number(c.contract_value).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading || !selectedId}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-lg disabled:opacity-50"
          >
            {downloading ? 'Generating…' : 'Download PDF'}
          </button>
        </div>
      )}

      {selected && (
        <div className="mt-4 p-4 bg-navy-900 rounded-lg border border-navy-700 text-sm text-gray-300">
          <div className="text-white font-medium mb-1">{selected.player_name} • {selected.position}</div>
          <div>{selected.team} ({selected.league})</div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div>Total: ${Number(selected.contract_value).toLocaleString()}</div>
            <div>AAV: ${Number(selected.annual_salary).toLocaleString()}</div>
            <div>Years: {selected.contract_years}</div>
            <div>Guaranteed: ${Number(selected.guaranteed_money || 0).toLocaleString()}</div>
          </div>
        </div>
      )}

      {status && <div className="mt-3 text-green-400 text-sm">{status}</div>}
    </div>
  );
}
