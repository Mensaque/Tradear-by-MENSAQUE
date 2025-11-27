
import React, { useState } from 'react';
import { AnalysisState, DetectedPattern } from '../types';

interface AnalysisViewProps {
  analysis: AnalysisState;
  onUploadClick: () => void;
}

const PatternCard: React.FC<{ pattern: DetectedPattern }> = ({ pattern }) => {
  const color = pattern.type === 'bullish' ? 'bg-green-500/10 border-green-500/30 text-green-400' 
              : pattern.type === 'bearish' ? 'bg-red-500/10 border-red-500/30 text-red-400' 
              : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';

  return (
    <div className={`flex items-center justify-between p-2 rounded border ${color} mb-2 backdrop-blur-sm`}>
      <div className="flex flex-col">
        <span className="font-bold text-xs uppercase tracking-wide">{pattern.name}</span>
        <span className="text-[9px] opacity-80 uppercase">{pattern.type}</span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[9px] uppercase font-mono opacity-70">Fiabilidad</span>
        <span className="font-bold text-[10px]">{pattern.reliability}</span>
      </div>
    </div>
  );
};

const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis, onUploadClick }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const getActionColor = (action: string) => {
    if (action === 'COMPRA') return 'text-green-400 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]';
    if (action === 'VENTA') return 'text-red-400 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]';
    return 'text-yellow-400 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]';
  };

  const handleAction = (type: 'COMPRA' | 'VENTA') => {
      setNotification(`ORDEN DE ${type} ENVIADA AL MERCADO`);
      setTimeout(() => setNotification(null), 3000);
  };

  const getConfidenceBar = (conf: number) => {
    const color = conf > 70 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : conf > 40 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${conf}%` }}></div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 shadow-2xl h-full flex flex-col relative overflow-hidden backdrop-blur-md">
      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-14 left-4 right-4 z-50 bg-indigo-600/90 text-white p-3 rounded shadow-xl animate-bounce text-center font-bold text-sm backdrop-blur">
            {notification}
        </div>
      )}

      {/* HUD Header */}
      <div className="p-3 bg-slate-900/80 border-b border-slate-700 flex justify-between items-center relative z-10 shrink-0">
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${analysis.isLoading ? 'bg-yellow-400 animate-spin' : 'bg-green-500 animate-pulse'}`}></div>
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-widest font-mono">
                {analysis.isLoading ? 'ANALIZANDO...' : 'PANEL DE SEÑALES'}
            </h2>
        </div>
        <div className="text-[10px] text-slate-500 font-mono">AI.CORE.V3</div>
      </div>

      <div className="flex-grow p-4 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
        {analysis.isLoading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6 opacity-70">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
            </div>
            <div className="font-mono text-xs text-indigo-300 text-center animate-pulse">
                PROCESANDO PATRONES...
                <br/>
                <span className="text-[9px] text-slate-500 mt-1">CALIBRANDO EJES VISUALES</span>
            </div>
          </div>
        ) : analysis.error ? (
           <div className="p-4 bg-red-900/20 border border-red-500/50 rounded text-red-300 text-sm font-mono">
             [ERROR]: {analysis.error}
           </div>
        ) : analysis.result ? (
          <div className="space-y-5 animate-fadeIn">
            
            {/* SNIPER ALERT */}
            {analysis.result.isSniperAlert && (
               <div className="bg-red-600/90 animate-pulse border-l-4 border-white p-3 rounded shadow-lg">
                  <div className="flex items-center gap-3 text-white">
                      <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      <div>
                          <h3 className="font-black text-sm tracking-tighter uppercase">ALERTA FRANCOTIRADOR</h3>
                          <p className="text-[10px] font-mono opacity-90">PATRÓN CONFIRMADO</p>
                      </div>
                  </div>
               </div>
            )}

            {/* MAIN SIGNAL & CONFIDENCE */}
            <div className={`border rounded-xl p-4 text-center bg-slate-900/40 backdrop-blur-sm ${getActionColor(analysis.result.action)}`}>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-mono">Recomendación</p>
                <h1 className="text-4xl font-black tracking-tighter drop-shadow-lg">{analysis.result.action}</h1>
                <div className="mt-3 max-w-[140px] mx-auto">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                        <span>Fiabilidad</span>
                        <span>{analysis.result.confidence}%</span>
                    </div>
                    {getConfidenceBar(analysis.result.confidence)}
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => handleAction('COMPRA')}
                    className="bg-green-600 hover:bg-green-500 active:scale-95 transition-all text-white py-3 rounded-lg font-bold shadow-lg shadow-green-900/20 border border-green-400/20 flex flex-col items-center justify-center group"
                >
                    <span className="text-lg tracking-tighter">COMPRAR</span>
                    <span className="text-[9px] opacity-70 group-hover:opacity-100 font-mono">LARGO</span>
                </button>
                <button 
                    onClick={() => handleAction('VENTA')}
                    className="bg-red-600 hover:bg-red-500 active:scale-95 transition-all text-white py-3 rounded-lg font-bold shadow-lg shadow-red-900/20 border border-red-400/20 flex flex-col items-center justify-center group"
                >
                    <span className="text-lg tracking-tighter">VENDER</span>
                    <span className="text-[9px] opacity-70 group-hover:opacity-100 font-mono">CORTO</span>
                </button>
            </div>

            {/* LEVELS */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 border border-slate-700/50 p-2 rounded text-center">
                    <p className="text-[9px] text-slate-400 uppercase font-mono">Stop Loss</p>
                    <p className="text-sm font-bold text-red-300 font-mono">{analysis.result.stopLoss}</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/50 p-2 rounded text-center">
                    <p className="text-[9px] text-slate-400 uppercase font-mono">Take Profit</p>
                    <p className="text-sm font-bold text-green-300 font-mono">{analysis.result.takeProfit}</p>
                </div>
            </div>

            {/* COLLAPSIBLE DETAILS */}
            <div>
                <button 
                    onClick={() => setDetailsOpen(!detailsOpen)}
                    className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-white py-2 border-b border-slate-700 transition-colors"
                >
                    <span className="uppercase font-bold tracking-wider">Informe Técnico Detallado</span>
                    <svg className={`w-4 h-4 transition-transform ${detailsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {detailsOpen && (
                    <div className="pt-3 space-y-4 animate-fadeIn">
                         {/* PATTERNS */}
                        <div>
                            {analysis.result.patterns.length > 0 ? (
                                analysis.result.patterns.map((p, idx) => <PatternCard key={idx} pattern={p} />)
                            ) : (
                                <p className="text-[10px] text-slate-600 italic">Sin patrones definidos.</p>
                            )}
                        </div>

                        {/* REASONING */}
                        <div className="bg-indigo-900/10 border-l-2 border-indigo-500 pl-3 py-2 rounded-r">
                            <p className="text-[10px] text-indigo-300 uppercase font-bold mb-1">Análisis de Sergio (IA)</p>
                            <p className="text-xs text-slate-300 italic leading-relaxed">"{analysis.result.reasoning}"</p>
                        </div>
                    </div>
                )}
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
            <div className="w-16 h-16 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-indigo-500 hover:text-indigo-400 transition-all group" onClick={onUploadClick}>
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
            </div>
            <p className="text-xs text-slate-400 font-mono text-center px-4">
                Sube una captura para iniciar el escáner táctico
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisView;
