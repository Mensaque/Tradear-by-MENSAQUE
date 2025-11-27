
export interface ChartDataPoint {
  time: string;
  price: number;
  ma7: number;
  ma25: number;
}

export interface AnalysisState {
  isLoading: boolean;
  result: TradingSignal | null;
  error: string | null;
}

export interface ChartMetadata {
  minPrice: number;
  maxPrice: number;
  detectedAsset?: string;
}

export interface ChartVectorPoint {
  x: number; // 0 to 100 relative width
  price: number; // Estimated price value
}

export interface ChartVectorData {
  points: ChartVectorPoint[];
  minPrice: number;
  maxPrice: number;
}

export interface TradingSignal {
  action: 'COMPRA' | 'VENTA' | 'ESPERA';
  confidence: number; // 0-100
  patterns: DetectedPattern[];
  stopLoss: string;
  takeProfit: string;
  reasoning: string;
  rawText?: string;
  isSniperAlert?: boolean;
  chartMetadata?: ChartMetadata;
  vectorData?: ChartVectorData; // New field for digitized chart
}

export interface DetectedPattern {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  reliability: 'High' | 'Medium' | 'Low';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isAlert?: boolean;
}

export interface StrategicInsight {
  summary: string;
  sources: { title: string; uri: string }[];
  lastUpdated: Date;
}

export interface NewsItem {
  title: string;
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  impact: 'High' | 'Medium' | 'Low';
}

export enum GeminiModel {
  PRO_PREVIEW = 'gemini-3-pro-preview', // For deep reasoning
  FLASH = 'gemini-2.5-flash', // For quick interactions & search
}
