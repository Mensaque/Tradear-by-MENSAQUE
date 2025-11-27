
import React, { useState, useRef, MouseEvent } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import { ChartMetadata, ChartVectorData } from '../types';

interface InteractiveChartInspectorProps {
  imageUrl: string;
  onRescan: () => void;
  isLoading: boolean;
  calibrationData?: ChartMetadata;
  vectorData?: ChartVectorData;
}

const InteractiveChartInspector: React.FC<InteractiveChartInspectorProps> = ({ imageUrl, onRescan, isLoading, calibrationData, vectorData }) => {
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false });
  const [readout, setReadout] = useState({ 
      price: '0.00', 
      time: '00:00'
  });
  const [isVectorMode, setIsVectorMode] = useState(true);
  
  // Measurement Tool State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{x: number, y: number} | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic Calibration
  const MIN_PRICE = vectorData?.minPrice || calibrationData?.minPrice || 16900.00;
  const MAX_PRICE = vectorData?.maxPrice || calibrationData?.maxPrice || 17050.00;
  const PRICE_RANGE = MAX_PRICE - MIN_PRICE;

  const calculatePrice = (y: number, height: number) => {
    const ratio = 1 - (y / height); // 0 at bottom
    return MIN_PRICE + (ratio * PRICE_RANGE);
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
     if (!containerRef.current || isVectorMode) return;
     const rect = containerRef.current.getBoundingClientRect();
     const x = e.clientX - rect.left;
     const y = e.clientY - rect.top;
     setIsDragging(true);
     setDragStart({ x, y });
     setDragCurrent({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isVectorMode) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Clamp
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const clampedY = Math.max(0, Math.min(y, rect.height));

    setCursor({ x: clampedX, y: clampedY, visible: true });

    // Drag Logic
    if (isDragging && dragStart) {
        setDragCurrent({ x: clampedX, y: clampedY });
    }

    // Readout Calculation
    const currentPrice = calculatePrice(clampedY, rect.height);
    const now = new Date();
    const xRatio = clampedX / rect.width;
    const timeOffset = (xRatio * 240) - 240; 
    const timePoint = new Date(now.getTime() + timeOffset * 60000);

    setReadout({
        price: currentPrice.toFixed(2),
        time: timePoint.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  };

  const handleMouseLeave = () => {
    setCursor(prev => ({ ...prev, visible: false }));
    setIsDragging(false);
    setDragStart(null);
  };

  // Measurement Calculations
  const measurementData = isDragging && dragStart && dragCurrent ? (() => {
      if (!containerRef.current) return null;
      const height = containerRef.current.clientHeight;
      const startPrice = calculatePrice(dragStart.y, height);
      const endPrice = calculatePrice(dragCurrent.y, height);
      const delta = endPrice - startPrice;
      const percent = (delta / startPrice) * 100;
      const bars = Math.round(Math.abs(dragCurrent.x - dragStart.x) / 10); 

      return {
          delta: delta.toFixed(2),
          percent: percent.toFixed(2),
          bars,
          isPositive: delta >= 0
      };
  })() : null;

  return (
    <div className="h-full w-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl flex flex-col relative group select-none">
      
      {/* SVG Filter Definition */}
      <svg className="hidden">
        <defs>
          <filter id="vectorize">
            <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0
                                                 0.33 0.33 0.33 0 0
                                                 0.33 0.33 0.33 0 0
                                                 0 0 0 1 0" />
            <feComponentTransfer>
               <feFuncR type="discrete" tableValues="0 1"/>
               <feFuncG type="discrete" tableValues="0 1"/>
               <feFuncB type="discrete" tableValues="0 1"/>
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      {/* HEADER BAR */}
      <div className="h-10 bg-slate-800 border-b border-slate-700 flex justify-between items-center px-4 shrink-0 z-20">
         <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-spin' : vectorData ? 'bg-green-500' : 'bg-indigo-500'}`}></div>
            <span className="text-[10px] font-bold text-slate-300 tracking-wider">
                {vectorData ? 'DIGITAL TWIN: CIENTÍFICO' : (calibrationData ? `CALIBRADO (${MIN_PRICE}-${MAX_PRICE})` : 'VISOR: ESTIMADO')}
            </span>
         </div>
         <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsVectorMode(!isVectorMode)}
                disabled={!vectorData}
                className={`text-[10px] px-2 py-1 rounded border transition-colors flex items-center gap-1 ${isVectorMode && vectorData ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400'}`}
            >
                {vectorData ? 'VECTOR IA' : 'ESPERANDO DATOS...'}
            </button>
            <button onClick={onRescan} className="text-slate-400 hover:text-red-400 transition-colors" title="Nueva Captura">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
         </div>
      </div>

      {/* CHART AREA */}
      <div 
        ref={containerRef}
        className="flex-grow relative bg-slate-950 cursor-crosshair overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {isVectorMode && vectorData ? (
             // RECHARTS REAL VECTOR MODE
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={vectorData.points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="x" hide />
                    <YAxis domain={[vectorData.minPrice, vectorData.maxPrice]} hide />
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px', fontSize: '12px' }}
                        itemStyle={{ color: '#818cf8' }}
                        labelFormatter={() => ''}
                        formatter={(value: number) => [value.toFixed(2), 'Precio']}
                    />
                    <Area type="monotone" dataKey="price" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
             </ResponsiveContainer>
        ) : (
            // RAW IMAGE MODE
            <>
                <div className="absolute inset-0 pointer-events-none opacity-20" 
                     style={{ 
                         backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
                         backgroundSize: '40px 40px'
                     }}>
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center p-0 overflow-hidden pointer-events-none">
                     <img 
                        src={imageUrl} 
                        alt="Uploaded Chart" 
                        className={`max-w-none w-full h-full object-contain transition-all duration-300 ${isLoading ? 'opacity-50 blur-sm' : 'opacity-100'}`}
                        style={{ filter: 'invert(1) hue-rotate(180deg) brightness(1.2) contrast(1.5) url(#vectorize)', mixBlendMode: 'screen' }}
                     />
                </div>
            </>
        )}

        {/* Measurement Ruler Overlay (Only for Image Mode) */}
        {!isVectorMode && isDragging && dragStart && dragCurrent && measurementData && (
            <>
                <div 
                    className={`absolute border-2 opacity-50 ${measurementData.isPositive ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'}`}
                    style={{
                        left: Math.min(dragStart.x, dragCurrent.x),
                        top: Math.min(dragStart.y, dragCurrent.y),
                        width: Math.abs(dragCurrent.x - dragStart.x),
                        height: Math.abs(dragCurrent.y - dragStart.y)
                    }}
                ></div>
                
                <div 
                    className={`absolute z-50 text-[10px] font-bold text-white px-2 py-1 rounded shadow-xl whitespace-nowrap pointer-events-none
                    ${measurementData.isPositive ? 'bg-green-600' : 'bg-red-600'}`}
                    style={{
                        left: dragCurrent.x + 10,
                        top: dragCurrent.y
                    }}
                >
                    {measurementData.isPositive ? '+' : ''}{measurementData.delta} ({measurementData.isPositive ? '+' : ''}{measurementData.percent}%)
                </div>
            </>
        )}

        {/* Scanner Effect */}
        {isLoading && (
             <div className="absolute inset-0 z-10 bg-indigo-900/20 flex items-center justify-center pointer-events-none">
                 <div className="w-full h-0.5 bg-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.8)] animate-scan"></div>
             </div>
        )}

        {/* HUD OVERLAYS (Raw Mode) */}
        {!isVectorMode && cursor.visible && !isLoading && !isDragging && (
            <>
                <div className="absolute top-0 bottom-0 border-l border-indigo-500/50 pointer-events-none z-20" style={{ left: cursor.x }}></div>
                <div className="absolute left-0 right-0 border-t border-indigo-500/50 pointer-events-none z-20" style={{ top: cursor.y }}></div>
                <div 
                    className="absolute right-0 bg-indigo-600 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-l shadow-lg z-30 pointer-events-none translate-y-[-50%]"
                    style={{ top: cursor.y }}
                >
                    {readout.price}
                </div>
            </>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="h-6 bg-slate-950 border-t border-slate-800 flex justify-between items-center px-4 text-[9px] text-slate-500 font-mono z-20">
         <span className="flex items-center gap-1">
             <div className={`w-1.5 h-1.5 rounded-full ${vectorData ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
             {vectorData ? 'MODO CIENTÍFICO ACTIVO' : 'MODO RAW (CALIBRACIÓN)'}
         </span>
         <span>{isVectorMode && vectorData ? 'RECHARTS ENGINE' : 'HERRAMIENTA: REGLA'}</span>
      </div>
    </div>
  );
};

export default InteractiveChartInspector;
