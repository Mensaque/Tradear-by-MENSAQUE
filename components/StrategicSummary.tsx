import React, { useState, useEffect } from 'react';
import { getStrategicSummary } from '../services/geminiService';
import { StrategicInsight } from '../types';

const StrategicSummary: React.FC = () => {
  const [insight, setInsight] = useState<StrategicInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsedSummary, setParsedSummary] = useState({ strategy: '', points: '' });

  const fetchInsight = async () => {
    setLoading(true);
    const { text, sources } = await getStrategicSummary("DAX Index, Mercado Europeo y SP500 hoy");
    
    // Parse response
    const strategyMatch = text.match(/<<<STRATEGY>>>([\s\S]*?)<<<POINTS>>>/);
    const pointsMatch = text.match(/<<<POINTS>>>([\s\S]*)/);
    
    setParsedSummary({
        strategy: strategyMatch ? strategyMatch[1].trim() : text,
        points: pointsMatch ? pointsMatch[1].trim() : ''
    });

    setInsight({
      summary: text,
      sources: sources,
      lastUpdated: new Date()
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchInsight();
  }, []);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-xl mb-4 relative overflow-hidden group">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2.5">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Estrategia Global</h3>
        </div>
        <button 
            onClick={fetchInsight}
            disabled={loading}
            className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded transition-colors"
        >
            {loading ? 'Sincronizando...' : 'Actualizar'}
        </button>
      </div>

      <div className="space-y-4">
        {loading && !insight ? (
            <div className="animate-pulse space-y-3">
                <div className="h-2 bg-slate-700 rounded w-full"></div>
                <div className="h-2 bg-slate-700 rounded w-3/4"></div>
            </div>
        ) : (
            <>
                {/* Main Strategy - Personal Message */}
                <div className="relative z-10">
                    <p className="text-base font-medium text-white leading-snug">
                        {parsedSummary.strategy || "Conectando con el mercado..."}
                    </p>
                </div>

                {/* Key Points */}
                {parsedSummary.points && (
                    <div className="bg-black/20 rounded p-3 border-l-2 border-slate-600">
                         <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-light">
                             {parsedSummary.points}
                         </div>
                    </div>
                )}
                
                {/* External Resource - TradingView */}
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer" 
                       className="w-full bg-[#131722] hover:bg-[#1e222d] text-white text-xs font-bold py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors border border-slate-700 group/btn">
                        <svg className="w-4 h-4 text-blue-500 group-hover/btn:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 12a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1zm-6-8a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V5.41l5.3 5.3a1 1 0 0 0 1.4-1.42L16.42 4H18a1 1 0 0 0 0-2h-3z"/>
                        </svg>
                        ABRIR TERMINAL TRADINGVIEW
                    </a>
                </div>
            </>
        )}
      </div>
      
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-500"></div>
    </div>
  );
};

export default StrategicSummary;