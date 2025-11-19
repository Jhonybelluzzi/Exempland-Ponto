import { GoogleGenAI } from "@google/genai";
import { Employee, TimeLog, Site } from '../types';

export const generateSmartReport = async (
  employees: Employee[],
  logs: TimeLog[],
  sites: Site[],
  prompt: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Erro: Chave de API não configurada.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare context data
  const dataContext = {
    employees: employees.map(e => ({ name: e.name, role: e.role, rate: e.hourlyRate })),
    sites: sites.map(s => ({ id: s.id, name: s.name })),
    logs: logs.slice(-50).map(l => ({
      employee: employees.find(e => e.id === l.employeeId)?.name || 'Unknown',
      site: sites.find(s => s.id === l.siteId)?.name || 'Unknown',
      type: l.type,
      time: new Date(l.timestamp).toLocaleString('pt-BR')
    }))
  };

  const fullPrompt = `
    Você é um assistente administrativo sênior de uma construtora.
    Analise os dados abaixo e responda à solicitação do usuário.
    Responda sempre em Português do Brasil, de forma profissional e sucinta.
    
    Dados (JSON):
    ${JSON.stringify(dataContext, null, 2)}

    Solicitação do Usuário: "${prompt}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });
    return response.text || "Não foi possível gerar o relatório.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao comunicar com a IA. Verifique sua conexão ou chave de API.";
  }
};