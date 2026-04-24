import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/contracts', label: 'Contracts', icon: '📋' },
  { path: '/salary-caps', label: 'Salary Caps', icon: '💰' },
  { path: '/endorsements', label: 'Endorsements', icon: '🤝' },
  { path: '/free-agents', label: 'Free Agents', icon: '🏃' },
  { path: '/negotiations', label: 'Negotiations', icon: '⚖️' },
  { path: '/performance', label: 'Performance', icon: '📊' },
  { path: '/draft-scouting', label: 'Draft Scouting', icon: '🎯' },
  { path: '/injury-reports', label: 'Injury Reports', icon: '🏥' },
  { path: '/team-rosters', label: 'Team Rosters', icon: '👥' },
  { path: '/trade-analysis', label: 'Trade Analysis', icon: '🔄' },
  { path: '/clients', label: 'Clients', icon: '🧑‍💼' },
  { path: '/financials', label: 'Financials', icon: '💵' },
  { path: '/league-rules', label: 'League Rules', icon: '📖' },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-800 border-r border-navy-700 flex flex-col fixed h-full z-30 transition-all duration-300 lg:translate-x-0 -translate-x-full lg:static"
        id="sidebar">
        <div className="p-5 border-b border-navy-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">AI Sports Agent</h1>
              <p className="text-xs text-accent-blue font-medium">Contract Analyzer</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30'
                    : 'text-gray-400 hover:text-white hover:bg-navy-700'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-navy-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-xs font-bold text-white">
              {(user.name || user.email || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name || 'Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{user.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-navy-800 border-b border-navy-700 flex items-center px-4 z-20">
        <button
          onClick={() => {
            const sb = document.getElementById('sidebar');
            sb.classList.toggle('-translate-x-full');
          }}
          className="text-gray-400 hover:text-white mr-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-lg">🏆</span>
        <span className="ml-2 font-bold text-sm text-white">AI Sports Agent</span>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-0 mt-14 lg:mt-0 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
