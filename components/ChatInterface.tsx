import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  alertsEnabled: boolean;
  setAlertsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  setMessages, 
  alertsEnabled, 
  setAlertsEnabled 
}) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const responseText = await sendChatMessage(messages, input);
    
    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
        <div>
            <h3 className="font-semibold text-white">Chat Colaborativo</h3>
            <div className="flex items-center gap-3">
              <p className="text-xs text-slate-400">Conectado con Gemini 3 Pro</p>
              <button 
                onClick={() => setAlertsEnabled(!alertsEnabled)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${alertsEnabled ? 'bg-indigo-900/50 border-indigo-500 text-indigo-300' : 'bg-slate-700 border-slate-600 text-slate-400'}`}
              >
                {alertsEnabled ? '🔔 Alertas ACT. ' : '🔕 Alertas DES.'}
              </button>
            </div>
        </div>
        <div className="flex -space-x-2">
            <div title="David (Tú)" className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white border-2 border-slate-800 font-bold">D</div>
            <div title="Sergio Mensaque (Dev)" className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white border-2 border-slate-800 font-bold cursor-help">S</div>
            <div title="TradeMind AI" className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs text-white border-2 border-slate-800">AI</div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : msg.isAlert 
                  ? 'bg-red-900/80 border border-red-500 text-red-100 rounded-bl-none shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'bg-slate-700 text-slate-200 rounded-bl-none'
            }`}>
              {msg.isAlert && (
                 <div className="flex items-center gap-2 mb-1 border-b border-red-500/30 pb-1">
                    <span className="animate-pulse">🚨</span>
                    <span className="font-bold text-xs uppercase tracking-wider">Señal de Trading</span>
                 </div>
              )}
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-700 rounded-lg rounded-bl-none p-3 flex gap-1">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-slate-800 border-t border-slate-700">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta a TradeMind..."
            className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409 5 5 0 119.454 0 1 1 0 001.169-1.409l-7-14z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;