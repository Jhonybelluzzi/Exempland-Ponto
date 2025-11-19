import React, { useState } from 'react';
import { Employee, TimeLog, Site } from '../types';
import { generateSmartReport } from '../services/geminiService';
import { Bot, Send, Sparkles, Loader2 } from 'lucide-react';

interface SmartAssistantProps {
  employees: Employee[];
  logs: TimeLog[];
  sites: Site[];
}

export const SmartAssistant: React.FC<SmartAssistantProps> = ({ employees, logs, sites }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse('');
    
    const result = await generateSmartReport(employees, logs, sites, query);
    setResponse(result);
    setIsLoading(false);
  };

  const suggestions = [
    "Faça um resumo das horas trabalhadas nesta semana.",
    "Quem teve mais horas extras?",
    "Qual é o custo estimado de mão de obra hoje?",
    "Liste os funcionários que faltaram ontem."
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg mb-8">
            <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 p-3 rounded-full">
                    <Sparkles className="w-8 h-8 text-yellow-300" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Assistente Inteligente</h2>
                    <p className="text-indigo-100">Use Inteligência Artificial para analisar os dados da sua obra.</p>
                </div>
            </div>
            
            <form onSubmit={handleAsk} className="relative">
                <input 
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Pergunte algo sobre sua equipe..."
                    className="w-full p-4 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-200 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all"
                />
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                    <button 
                        key={i}
                        onClick={() => setQuery(s)}
                        className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors border border-transparent hover:border-white/30"
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>

        {response && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 animate-fade-in">
                <div className="flex items-start gap-4">
                    <Bot className="w-8 h-8 text-violet-600 mt-1" />
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Análise</h3>
                        <div className="prose prose-slate text-slate-600 whitespace-pre-line">
                            {response}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};