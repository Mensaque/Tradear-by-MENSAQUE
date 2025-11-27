import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-700 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">TradeMind <span className="text-indigo-400">3.0</span></h1>
              <p className="text-xs text-slate-400">Powered by Gemini 3 Pro</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-300">Desarrollado por <span className="text-indigo-400">Sergio Mensaque</span></p>
              <div className="flex items-center justify-end gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <p className="text-xs text-slate-500">Colaborando con David</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center overflow-hidden">
                <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=David" alt="David's Profile" className="w-full h-full" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
