
import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

const AVAILABLE_INDICATORS = [
  { id: "RSI@tv-basicstudies", name: "RSI (Relative Strength Index)" },
  { id: "MACD@tv-basicstudies", name: "MACD" },
  { id: "MASimple@tv-basicstudies", name: "Media Móvil Simple (SMA)" },
  { id: "MAExp@tv-basicstudies", name: "Media Móvil Exponencial (EMA)" },
  { id: "BB@tv-basicstudies", name: "Bandas de Bollinger" },
  { id: "Stochastic@tv-basicstudies", name: "Estocástico" }
];

const ChartVisualizer: React.FC = () => {
  const containerId = "tradingview_widget_container";
  const widgetRef = useRef<any>(null);
  
  const [activeIndicators, setActiveIndicators] = useState<string[]>(["RSI@tv-basicstudies", "MACD@tv-basicstudies"]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const initWidget = () => {
    if (window.TradingView) {
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = "";

        widgetRef.current = new window.TradingView.widget({
          "autosize": true,
          "symbol": "XETR:DAX",
          "interval": "15",
          "timezone": "Europe/Madrid",
          "theme": "dark",
          "style": "1",
          "locale": "es",
          "enable_publishing": false,
          "allow_symbol_change": true,
          "container_id": containerId,
          "hide_side_toolbar": false,
          "details": true, 
          "hotlist": false,
          "calendar": false,
          "studies": activeIndicators
        });
    }
  };

  useEffect(() => {
    if (!document.getElementById('tv-script')) {
      const script = document.createElement('script');
      script.id = 'tv-script';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    } else {
      if (window.TradingView) {
        initWidget();
      }
    }
  }, [activeIndicators]);

  const toggleIndicator = (id: string) => {
    setActiveIndicators(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="h-full w-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl relative flex flex-col group">
       {/* Toolbar Header */}
       <div className="px-4 py-2 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex justify-between items-center z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">XETR:DAX</span>
            </div>
            
            {/* Indicator Dropdown */}
            <div className="relative">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 px-2 py-1 rounded transition-all font-bold tracking-wide shadow-sm"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    INDICADORES ({activeIndicators.length})
                </button>

                {isMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
                        <div className="absolute top-full left-0 mt-2 w-56 bg-slate-800/95 backdrop-blur border border-slate-600 rounded-lg shadow-xl z-20 p-1 flex flex-col gap-1">
                            <p className="px-2 py-1 text-[9px] text-slate-500 font-bold uppercase border-b border-slate-700 mb-1">Añadir al gráfico</p>
                            {AVAILABLE_INDICATORS.map((ind) => (
                                <button
                                    key={ind.id}
                                    onClick={() => toggleIndicator(ind.id)}
                                    className={`text-left px-2 py-1.5 text-xs rounded flex items-center justify-between transition-colors ${activeIndicators.includes(ind.id) ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                                >
                                    {ind.name}
                                    {activeIndicators.includes(ind.id) && (
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] text-slate-500 font-mono hidden sm:inline-block tracking-tight">DATOS OHLC ACTIVOS</span>
          </div>
       </div>
       
       {/* Widget Container */}
       <div id={containerId} className="flex-grow w-full bg-slate-950 relative z-0" />
    </div>
  );
};

export default ChartVisualizer;
