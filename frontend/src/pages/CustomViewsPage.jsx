import React, { useState } from 'react';
import CompSalaryScatter from '../components/CompSalaryScatter.js';
import ClauseNetwork from '../components/ClauseNetwork.js';
import ContractPDF from '../components/ContractPDF.js';
import ClauseComparisonWizard from '../components/ClauseComparisonWizard.js';

const TABS = [
  { key: 'scatter', label: 'Comp Salary Scatter', icon: '📈' },
  { key: 'network', label: 'Clause Network', icon: '🔗' },
  { key: 'pdf', label: 'Contract PDF Export', icon: '📄' },
  { key: 'wizard', label: 'Clause Comparison Wizard', icon: '🪄' },
];

export default function CustomViewsPage() {
  const [active, setActive] = useState('scatter');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Contract Views</h1>
        <p className="text-sm text-gray-400">
          Specialized views for sports agent contract analysis: comparable salaries, clause networks,
          full agreement PDFs, and a side-by-side clause comparison wizard.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" data-testid="custom-views-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            data-tab={t.key}
            className={`px-4 py-2 text-sm rounded-lg border transition ${
              active === t.key
                ? 'bg-accent-blue/20 border-accent-blue/40 text-accent-blue'
                : 'bg-navy-800 border-navy-700 text-gray-300 hover:text-white'
            }`}
          >
            <span className="mr-2">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div data-active-view={active}>
        {active === 'scatter' && <CompSalaryScatter />}
        {active === 'network' && <ClauseNetwork />}
        {active === 'pdf' && <ContractPDF />}
        {active === 'wizard' && <ClauseComparisonWizard />}
      </div>
    </div>
  );
}
