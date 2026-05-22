import React, { useEffect, useState } from 'react';

export default function EscrowHoldbackTracker() {
  const [data, setData] = useState({ summary: {}, holdbacks: [] });
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    fetch('/api/escrow-holdback-tracker').then((res) => res.json()).then(setData);
  }, []);

  const releasePlan = async (id) => {
    const res = await fetch('/api/escrow-holdback-tracker/release-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setPlan(await res.json());
  };

  return (
    <div className="page">
      <h1>Escrow Holdback Tracker</h1>
      <p>Monitor player contract holdbacks, release triggers, and cap compliance signoffs.</p>
      {Object.entries(data.summary).map(([key, value]) => <div className="card" key={key}><strong>{value}</strong> {key}</div>)}
      {data.holdbacks.map((item) => (
        <div className="card" key={item.id}>
          <h3>{item.athlete} - {item.team}</h3>
          <p>${item.amount} held until {item.releaseDate}; trigger: {item.trigger}; {item.status}</p>
          <button onClick={() => releasePlan(item.id)}>Create release plan</button>
        </div>
      ))}
      {plan && <pre className="card">{JSON.stringify(plan, null, 2)}</pre>}
    </div>
  );
}
