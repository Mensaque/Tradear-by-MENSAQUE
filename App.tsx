
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import ChartVisualizer from './components/ChartVisualizer';
import AnalysisView from './components/AnalysisView';
import StrategicSummary from './components/StrategicSummary';
import ChatInterface from './components/ChatInterface';
import InteractiveChartInspector from './components/InteractiveChartInspector';
import { AnalysisState, ChatMessage, ChartMetadata, ChartVectorData } from './types';
import { analyzeFinancialChart, digitizeChartImage } from './services/geminiService';

type Tab = 'terminal' | 'strategy';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('terminal');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isLoading: false,
    result: null,
    error: null,
  });
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hola David, soy TradeMind. Estoy monitoreando el mercado con Sergio. ¿Escaneamos el DAX o esperamos señal?', timestamp: Date.now() }
  ]);
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSelectedImage(base64String);
      setActiveTab('terminal');
      runAnalysis(base64String);
    };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async (base64Image: string) => {
    setAnalysis({ isLoading: true, result: null, error: null });
    try {
      // Parallel execution: Deep Reasoning + Scientific Digitization
      const [analysisResult, vectorData] = await Promise.all([
        analyzeFinancialChart(
            base64Image,
            "Analiza este gráfico intradiario (TF: 5 min). Busca patrones de velas ENVOLVENTES + VOLUMEN ALTO."
        ),
        digitizeChartImage(base64Image)
      ]);

      // Merge vector data into result
      if (vectorData) {
          analysisResult.vectorData = vectorData;
          // Prefer vector data calibration if available
          if (analysisResult.chartMetadata) {
             analysisResult.chartMetadata.minPrice = vectorData.minPrice;
             analysisResult.chartMetadata.maxPrice = vectorData.maxPrice;
          }
      }

      setAnalysis({ isLoading: false, result: analysisResult, error: null });

      if (analysisResult.isSniperAlert && alertsEnabled) {
          const alertMsg: ChatMessage = {
              id: Date.now().toString(),
              role: 'model',
              text: `🚨 ALERTA SNIPER: Patrón Envolvente detectado con volumen. Acción recomendada: ${analysisResult.action}. Stop: ${analysisResult.stopLoss}.`,
              timestamp: Date.now(),
              isAlert: true
          };
          setMessages(prev => [...prev, alertMsg]);
      }

    } catch (err: any) {
      setAnalysis({ isLoading: false, result: null, error: err.message });
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-[1920px] mx-auto w-full px-4 sm:px-6 py-4 flex flex-col">
        
        {/* TABS NAVIGATION */}
        <div className="flex border-b border-slate-800 mb-4 overflow-x-auto">
            <button 
                onClick={() => setActiveTab('terminal')}
                className={`px-6 py-3 text-sm font-bold tracking-wider uppercase border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'terminal' ? 'border-indigo-500 text-white bg-slate-900/50' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                TERMINAL OPERATIVO
            </button>
            <button 
                onClick={() => setActiveTab('strategy')}
                className={`px-6 py-3 text-sm font-bold tracking-wider uppercase border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'strategy' ? 'border-indigo-500 text-white bg-slate-900/50' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                SALA DE ESTRATEGIA
            </button>
        </div>

        {/* TAB CONTENT: TERMINAL */}
        <div className={activeTab === 'terminal' ? 'block flex-grow' : 'hidden'}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
                
                {/* Left Column: Visual Data */}
                <div className="lg:col-span-9 flex flex-col gap-4 h-[calc(100vh-140px)] min-h-[600px]">
                    
                    {/* Top: Live Chart */}
                    <div className="flex-1 h-1/2 min-h-[300px]">
                        <ChartVisualizer />
                    </div>

                    {/* Bottom: Image Inspector */}
                    <div className="flex-1 h-1/2 min-h-[300px] flex flex-col">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept="image/*"
                        />
                        
                        {selectedImage ? (
                            <InteractiveChartInspector 
                                imageUrl={selectedImage}
                                onRescan={triggerUpload}
                                isLoading={analysis.isLoading}
                                calibrationData={analysis.result?.chartMetadata}
                                vectorData={analysis.result?.vectorData}
                            />
                        ) : (
                            <div 
                                onClick={triggerUpload}
                                className="h-full bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800/50 hover:border-indigo-500/50 transition-all group"
                            >
                                <div className="p-4 rounded-full bg-slate-800 group-hover:scale-110 transition-transform mb-4 shadow-xl">
                                    <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <h3 className="font-bold text-slate-300">SUBIR CAPTURA PARA ANÁLISIS</h3>
                                <p className="text-xs text-slate-500 mt-1">Escáner de Velas 5 min (Soporta JPG/PNG)</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Analysis Panel */}
                <div className="lg:col-span-3 h-[calc(100vh-140px)] min-h-[600px]">
                    <AnalysisView analysis={analysis} onUploadClick={triggerUpload} />
                </div>
            </div>
        </div>

        {/* TAB CONTENT: STRATEGY */}
        <div className={activeTab === 'strategy' ? 'block flex-grow' : 'hidden'}>
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
                <div className="lg:col-span-3 h-full">
                    <StrategicSummary />
                </div>
                <div className="lg:col-span-1 h-full">
                    <ChatInterface 
                        messages={messages} 
                        setMessages={setMessages} 
                        alertsEnabled={alertsEnabled}
                        setAlertsEnabled={setAlertsEnabled}
                    />
                </div>
             </div>
        </div>

      </main>
      
      <style>{`
        @keyframes scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
        }
        .animate-scan {
            animation: scan 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default App;
