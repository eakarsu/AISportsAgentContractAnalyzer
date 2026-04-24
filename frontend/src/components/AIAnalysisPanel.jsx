import React from 'react';

function parseAIResponse(text) {
  if (!text) return [];
  if (typeof text === 'object') {
    text = JSON.stringify(text, null, 2);
  }
  const str = String(text);

  const sections = [];
  // Try to split by common header patterns
  const lines = str.split('\n');
  let currentSection = { title: 'Analysis Overview', icon: '📊', content: [], type: 'info' };

  const sectionPatterns = [
    { regex: /^#{1,3}\s+(.+)/,                     getTitle: (m) => m[1] },
    { regex: /^\*\*(.+?)\*\*/,                      getTitle: (m) => m[1] },
    { regex: /^(\d+)\.\s+\*\*(.+?)\*\*/,           getTitle: (m) => m[2] },
    { regex: /^([A-Z][A-Z\s&]{3,}):?\s*$/,         getTitle: (m) => m[1] },
    { regex: /^-{3,}$|^={3,}$/,                     getTitle: () => null },
  ];

  const iconMap = {
    'summary': '📋', 'overview': '📊', 'recommendation': '💡', 'risk': '⚠️',
    'strength': '💪', 'weakness': '📉', 'opportunity': '🎯', 'financial': '💰',
    'market': '📈', 'comparison': '🔄', 'conclusion': '✅', 'action': '🚀',
    'warning': '🔴', 'positive': '🟢', 'analysis': '🔍', 'valuation': '💎',
    'performance': '📊', 'projection': '📈', 'negotiation': '⚖️', 'benchmark': '📐',
    'insight': '💡', 'key': '🔑', 'metric': '📏', 'trend': '📈',
  };

  function getIcon(title) {
    const lower = title.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lower.includes(key)) return icon;
    }
    return '📌';
  }

  function getType(title) {
    const lower = title.toLowerCase();
    if (/risk|warning|concern|weak|threat|caution/.test(lower)) return 'warning';
    if (/strength|positive|advantage|opportunity|upside/.test(lower)) return 'positive';
    if (/recommend|action|suggest|next step|strateg/.test(lower)) return 'action';
    return 'info';
  }

  for (const line of lines) {
    let matched = false;
    for (const pattern of sectionPatterns) {
      const m = line.match(pattern.regex);
      if (m) {
        const title = pattern.getTitle(m);
        if (title) {
          if (currentSection.content.length > 0 || sections.length === 0) {
            if (currentSection.content.length > 0) sections.push(currentSection);
          }
          currentSection = {
            title: title.replace(/[*#]/g, '').trim(),
            icon: getIcon(title),
            content: [],
            type: getType(title),
          };
          matched = true;
        }
        break;
      }
    }
    if (!matched && line.trim()) {
      currentSection.content.push(line);
    }
  }
  if (currentSection.content.length > 0) {
    sections.push(currentSection);
  }

  if (sections.length === 0) {
    sections.push({
      title: 'AI Analysis',
      icon: '🤖',
      content: [str],
      type: 'info',
    });
  }

  return sections;
}

function formatLine(line, index) {
  let text = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em class="text-gray-300">$1</em>');

  // Highlight dollar amounts
  text = text.replace(
    /\$[\d,]+(?:\.\d+)?(?:\s*(?:million|billion|M|B|K))?/gi,
    '<span class="text-accent-green font-semibold">$&</span>'
  );

  // Highlight percentages
  text = text.replace(
    /\d+(?:\.\d+)?%/g,
    '<span class="text-accent-blue font-semibold">$&</span>'
  );

  const isBullet = /^\s*[-•]\s+/.test(line);
  const isNumbered = /^\s*\d+[.)]\s+/.test(line);

  if (isBullet || isNumbered) {
    text = text.replace(/^\s*[-•\d.)]+\s+/, '');
    return (
      <div key={index} className="flex items-start gap-2 py-1">
        <span className="text-accent-blue mt-1 text-xs">{isBullet ? '●' : `${line.match(/\d+/)[0]}.`}</span>
        <span className="text-gray-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />
      </div>
    );
  }

  return (
    <p
      key={index}
      className="text-gray-300 text-sm leading-relaxed py-0.5"
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
}

const typeStyles = {
  info: 'border-accent-blue/30 bg-accent-blue/5',
  warning: 'border-accent-gold/30 bg-accent-gold/5',
  positive: 'border-accent-green/30 bg-accent-green/5',
  action: 'border-accent-purple/30 bg-purple-500/5',
};

const typeBadge = {
  info: 'bg-accent-blue/20 text-accent-blue',
  warning: 'bg-accent-gold/20 text-accent-gold',
  positive: 'bg-accent-green/20 text-accent-green',
  action: 'bg-purple-500/20 text-purple-400',
};

export default function AIAnalysisPanel({ analysis, loading, onClose }) {
  if (loading) {
    return (
      <div className="bg-navy-800 rounded-xl border border-navy-700 p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-navy-700 border-t-accent-blue animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-2xl">🤖</span>
          </div>
          <div className="text-center">
            <p className="text-white font-semibold">AI is analyzing...</p>
            <p className="text-gray-500 text-sm mt-1">Processing data and generating insights</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const sections = parseAIResponse(analysis);

  return (
    <div className="bg-navy-800 rounded-xl border border-navy-700 overflow-hidden scale-in">
      <div className="px-6 py-4 bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border-b border-navy-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h3 className="text-white font-bold text-lg">AI Analysis Report</h3>
            <p className="text-gray-400 text-xs">Powered by Advanced AI Analytics</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
        {sections.map((section, i) => (
          <div key={i} className={`rounded-lg border p-4 ${typeStyles[section.type] || typeStyles.info}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{section.icon}</span>
              <h4 className="text-white font-semibold text-sm">{section.title}</h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ml-auto ${typeBadge[section.type] || typeBadge.info}`}>
                {section.type.toUpperCase()}
              </span>
            </div>
            <div className="space-y-1">
              {section.content.map((line, j) => formatLine(line, j))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
