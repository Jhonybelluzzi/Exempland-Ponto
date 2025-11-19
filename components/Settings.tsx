import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { AppSettings } from '../types';
import { Save, ExternalLink, Copy, Check } from 'lucide-react';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({});
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSettings(StorageService.getSettings());
  }, []);

  const handleSave = () => {
    StorageService.saveSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const scriptCode = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Data", "Hora", "Funcionário", "Tipo", "Obra"]);
  }

  var data = JSON.parse(e.postData.contents);
  
  sheet.appendRow([
    data.data,
    data.hora,
    data.funcionario,
    data.tipo,
    data.obra
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Configurações e Integrações</h2>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
                <ExternalLink className="w-6 h-6 text-green-600" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-slate-800">Integração com Google Sheets</h3>
                <p className="text-sm text-slate-500">Envie os registros de ponto automaticamente para uma planilha.</p>
            </div>
        </div>

        <div className="space-y-6">
            {/* Step 1 */}
            <div className="border-l-4 border-blue-500 pl-4 py-1">
                <h4 className="font-medium text-slate-900">Passo 1: Criar Script no Google Sheets</h4>
                <p className="text-sm text-slate-600 mb-3">
                    Abra sua planilha Google, vá em <strong>Extensões {'>'} Apps Script</strong>. Apague todo o código lá e cole o código abaixo:
                </p>
                <div className="relative">
                    <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg text-xs overflow-x-auto font-mono">
                        {scriptCode}
                    </pre>
                    <button 
                        onClick={copyToClipboard}
                        className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded text-white flex items-center gap-2 text-xs transition-colors"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copiado!' : 'Copiar Código'}
                    </button>
                </div>
            </div>

            {/* Step 2 */}
            <div className="border-l-4 border-blue-500 pl-4 py-1">
                <h4 className="font-medium text-slate-900">Passo 2: Implantar como App da Web</h4>
                <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1 mt-2">
                    <li>No editor do Script, clique em <strong>Implantar (Deploy) {'>'} Nova implantação</strong>.</li>
                    <li>Selecione o tipo <strong>App da Web</strong>.</li>
                    <li>Em "Quem pode acessar", selecione <strong>Qualquer pessoa (Anyone)</strong>. <span className="text-red-500 font-bold">*Importante</span></li>
                    <li>Clique em Implantar e copie a <strong>URL do App da Web</strong>.</li>
                </ol>
            </div>

            {/* Step 3 */}
            <div className="border-l-4 border-green-500 pl-4 py-1">
                <h4 className="font-medium text-slate-900">Passo 3: Colar a URL aqui</h4>
                <div className="mt-3">
                    <label className="block text-sm font-medium text-slate-700 mb-1">URL do Web App (Google Script)</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="https://script.google.com/macros/s/..."
                            className="flex-1 border border-slate-300 rounded-lg p-2 text-sm"
                            value={settings.googleSheetUrl || ''}
                            onChange={e => setSettings({...settings, googleSheetUrl: e.target.value})}
                        />
                        <button 
                            onClick={handleSave}
                            className={`px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 transition-colors ${
                                isSaved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            {isSaved ? 'Salvo!' : 'Salvar'}
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        Assim que salvo, novos registros serão enviados automaticamente para a planilha.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};