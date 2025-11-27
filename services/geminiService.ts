
import { GoogleGenAI } from "@google/genai";
import { GeminiModel, ChatMessage, TradingSignal, NewsItem, ChartVectorData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Digitizes a chart image into vector data points using Nano Banana (Flash).
 */
export const digitizeChartImage = async (base64Image: string): Promise<ChartVectorData | null> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    
    const response = await ai.models.generateContent({
      model: GeminiModel.FLASH,
      contents: {
        parts: [
          {
            text: `Act as a Scientific Data Digitizer. 
            Analyze the provided financial chart image.
            
            Task:
            1. Identify the main price trend line (the candles or line chart).
            2. Extract 50 to 100 representative data points (x, y) that reconstruct the curve.
            3. 'x' should be the horizontal position percentage (0 to 100).
            4. 'price' should be the estimated price value on the Y-axis corresponding to that x position.
            5. Determine the visual minPrice and maxPrice of the Y-axis.

            Return ONLY a valid JSON object with this structure:
            {
              "minPrice": number,
              "maxPrice": number,
              "points": [
                { "x": 0, "price": 12345.50 },
                { "x": 2, "price": 12348.20 },
                ...
              ]
            }
            Do not include markdown formatting.`
          },
          {
            inlineData: {
              mimeType: "image/png",
              data: cleanBase64
            }
          }
        ]
      },
      config: {
        temperature: 0.1, // Low temperature for precision
      }
    });

    const text = response.text || "";
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Digitization failed:", error);
    return null;
  }
};

/**
 * Analyzes a financial chart image using Gemini 3 Pro with reasoning capabilities.
 * Returns a structured TradingSignal.
 */
export const analyzeFinancialChart = async (
  base64Image: string,
  promptText: string
): Promise<TradingSignal> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: GeminiModel.PRO_PREVIEW,
      contents: {
        parts: [
          {
            text: `Eres "TradeMind Audaz", un escáner de patrones de velas de élite para Sergio Mensaque.
            
            TU MISIÓN PRIORITARIA (MODO SNIPER):
            Busca activamente el patrón "ENVOLVENTE" (Engulfing) en las últimas velas.
            Verifica si coincide con una barra de VOLUMEN ALTO (más alta que la media).
            Si se cumple Envolvente + Volumen Alto, ESTO ES UNA ALERTA DE OPERACIÓN INMEDIATA.

            TAREAS DE ANÁLISIS:
            1. Escanea visualmente pixel por pixel las últimas 5 velas del gráfico.
            2. Identifica con precisión quirúrgica: Martillos, Estrellas Fugaces, Envolventes, Haramis, Tweezers.
            3. Calcula la probabilidad de éxito.
            4. Define Stop Loss y Take Profit agresivos.
            5. CALIBRACIÓN (IMPORTANTE): Estima visualmente el precio MÍNIMO y MÁXIMO visibles en el eje Y de la imagen para calibrar mi herramienta de medición.

            IMPORTANTE: Tu respuesta DEBE ser un objeto JSON válido y NADA MÁS. 

            Estructura JSON requerida:
            {
              "action": "COMPRA" | "VENTA" | "ESPERA",
              "confidence": number (0-100),
              "patterns": [
                { "name": "Nombre del Patrón", "type": "bullish"|"bearish"|"neutral", "reliability": "High"|"Medium"|"Low" }
              ],
              "stopLoss": "Precio numérico",
              "takeProfit": "Precio numérico",
              "reasoning": "Breve explicación técnica agresiva.",
              "isSniperAlert": boolean,
              "chartMetadata": {
                 "minPrice": number (ej. 16900),
                 "maxPrice": number (ej. 17100),
                 "detectedAsset": "DAX" | "SP500" | "CRYPTO" | "UNKNOWN"
              }
            }

            Contexto del usuario: ${promptText}`
          },
          {
            inlineData: {
              mimeType: "image/png",
              data: cleanBase64
            }
          }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: 2048 },
        temperature: 0.2, 
      }
    });

    const text = response.text || "";
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const signal: TradingSignal = JSON.parse(jsonString);
      return signal;
    } catch (e) {
      console.error("Failed to parse JSON", jsonString);
      return {
        action: 'ESPERA',
        confidence: 0,
        patterns: [],
        stopLoss: 'N/A',
        takeProfit: 'N/A',
        reasoning: "Error al interpretar la señal estructurada.",
        isSniperAlert: false
      };
    }

  } catch (error: any) {
    console.error("Error analyzing chart:", error);
    throw new Error(error.message || "Error connecting to Gemini API");
  }
};

/**
 * Gets a real-time strategic summary structured as news items.
 */
export const getStrategicSummary = async (assetContext: string): Promise<{ text: string, news: NewsItem[], sources: { title: string, uri: string }[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: GeminiModel.FLASH,
      contents: {
        parts: [{ 
          text: `Eres el Editor Jefe de un periódico financiero viral para Sergio Mensaque. Dame las 3 noticias más impactantes de AHORA MISMO sobre: ${assetContext}.
          
          Responde SOLAMENTE con un JSON Array de objetos NewsItem.
          Estructura:
          [
            {
              "title": "Titular de Alto Impacto (Clickbait inteligente)",
              "summary": "Resumen de 2 lineas.",
              "sentiment": "bullish" | "bearish" | "neutral",
              "impact": "High" | "Medium" | "Low"
            },
            ...
          ]` 
        }]
      },
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
        // Removed responseMimeType: "application/json" because it is incompatible with tools
      }
    });

    const text = response.text || "[]";
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let news: NewsItem[] = [];
    try {
        news = JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse news JSON", text);
    }
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web)
      .map((web: any) => ({ title: web.title, uri: web.uri })) || [];

    return { text: "Resumen generado", news, sources };
  } catch (error: any) {
    console.error("Error getting strategy:", error);
    return { text: "Error de conexión.", news: [], sources: [] };
  }
};

export const sendChatMessage = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: GeminiModel.PRO_PREVIEW,
      config: {
        systemInstruction: "Eres TradeMind Audaz. Respondes como un trader de piso veterano: corto, rápido, sarcástico si es necesario, pero brutalmente honesto sobre el riesgo.",
      }
    });
    
    const response = await chat.sendMessage({
      message: newMessage
    });

    return response.text || "Sin señal.";
  } catch (error: any) {
    return "Error en el chat: " + error.message;
  }
}
