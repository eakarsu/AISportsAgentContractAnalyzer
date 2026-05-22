import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ReactFlow, {
  Background, Controls, MiniMap,
  applyNodeChanges, applyEdgeChanges
} from 'reactflow';
import 'reactflow/dist/style.css';

export default function ClauseNetwork() {
  const [contracts, setContracts] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/contracts?limit=50', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        const list = r.data.data || r.data || [];
        setContracts(list);
        if (list.length && !selectedId) setSelectedId(String(list[0].id));
      })
      .catch((e) => setError(e.response?.data?.error || e.message));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    axios.get(`/api/custom-views/clause-network?contract_id=${selectedId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => {
        const styled = (r.data.nodes || []).map((n) => ({
          ...n,
          style: {
            background: n.id === 'contract' ? '#1e3a8a' : '#0f172a',
            color: '#e2e8f0',
            border: '1px solid #334155',
            padding: 8,
            borderRadius: 8,
            fontSize: 11,
            width: 200,
            whiteSpace: 'pre-line',
          },
        }));
        const styledEdges = (r.data.edges || []).map((e) => ({
          ...e,
          animated: true,
          style: { stroke: '#3b82f6' },
          labelStyle: { fill: '#94a3b8', fontSize: 10 },
        }));
        setNodes(styled);
        setEdges(styledEdges);
        setContract(r.data.contract);
      })
      .catch((e) => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  return (
    <div className="bg-navy-800/60 border border-navy-700 rounded-xl p-5">
      <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-bold text-white">Clause Network</h3>
          <p className="text-sm text-gray-400">Relationships between clauses across a contract.</p>
        </div>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="bg-navy-900 border border-navy-700 text-sm text-white px-3 py-2 rounded-lg"
        >
          {contracts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.player_name} – {c.team}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="text-red-400 text-sm mb-2">Error: {error}</div>}
      {loading && <div className="text-gray-400 text-sm mb-2">Loading clauses…</div>}

      {contract && (
        <div className="mb-3 text-xs text-gray-400">
          Showing: <span className="text-white font-medium">{contract.player_name}</span> –
          {contract.team} ({contract.league}) – ${Number(contract.contract_value).toLocaleString()} / {contract.contract_years} yrs
        </div>
      )}

      <div style={{ width: '100%', height: 540, background: '#0a1628', borderRadius: 8 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background color="#1e293b" gap={20} />
          <Controls />
          <MiniMap nodeColor={() => '#3b82f6'} maskColor="rgba(15,23,42,0.7)" />
        </ReactFlow>
      </div>
    </div>
  );
}
