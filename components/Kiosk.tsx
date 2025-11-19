import React, { useState, useEffect, useRef } from 'react';
import { Employee, LogType, Site, TimeLog } from '../types';
import { StorageService } from '../services/storageService';
import { Camera, CheckCircle, UserX, MapPin, Lock, LogOut } from 'lucide-react';

interface KioskProps {
  employees: Employee[];
  sites: Site[];
  onSwitchToAdmin: () => void;
}

export const Kiosk: React.FC<KioskProps> = ({ employees, sites, onSwitchToAdmin }) => {
  const [input, setInput] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  // Added 'exit' type to support red background on checkout
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info' | 'exit', text: string } | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || '');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Clock updater
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Camera initialization
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
            videoRef.current?.play();
          };
        }
      } catch (err) {
        console.error("Camera error:", err);
        setStatusMessage({ type: 'error', text: "Erro na câmera. Verifique permissões." });
      }
    };
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleKeyPress = (num: string) => {
    if (input.length < 4) {
      setInput(prev => prev + num);
    }
  };

  const handleClear = () => setInput('');
  
  const capturePhoto = (): string => {
    if (!videoRef.current || !canvasRef.current) return '';
    const context = canvasRef.current.getContext('2d');
    if (context) {
      context.drawImage(videoRef.current, 0, 0, 320, 240);
      return canvasRef.current.toDataURL('image/jpeg', 0.8);
    }
    return '';
  };

  const handleSubmit = async () => {
    if (input.length !== 4) return;

    const employee = employees.find(e => e.phone.endsWith(input) && e.active);
    
    if (!employee) {
      setStatusMessage({ type: 'error', text: 'Funcionário não encontrado.' });
      setTimeout(() => { setStatusMessage(null); setInput(''); }, 2000);
      return;
    }

    if (!selectedSiteId) {
       setStatusMessage({ type: 'error', text: 'Selecione uma obra antes de registrar.' });
       return;
    }

    // Determine In or Out based on last log
    const logs = StorageService.getLogs();
    const lastLog = logs
      .filter(l => l.employeeId === employee.id)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    const type = (!lastLog || lastLog.type === LogType.OUT) ? LogType.IN : LogType.OUT;

    const photo = capturePhoto();
    
    const newLog: TimeLog = {
      id: crypto.randomUUID(),
      employeeId: employee.id,
      siteId: selectedSiteId,
      timestamp: Date.now(),
      type,
      photoSnapshot: photo
    };

    // Add Log (async sync to Google Sheets happens in background inside service)
    StorageService.addLog(newLog);

    const action = type === LogType.IN ? 'ENTRADA' : 'SAÍDA';
    
    // Set message type based on action: 'success' (Green) for IN, 'exit' (Red) for OUT
    setStatusMessage({ 
        type: type === LogType.IN ? 'success' : 'exit', 
        text: `Olá, ${employee.name.split(' ')[0]}! ${action} registrada.` 
    });
    
    setTimeout(() => {
      setStatusMessage(null);
      setInput('');
    }, 3000);
  };

  useEffect(() => {
    if (input.length === 4) {
      handleSubmit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === '0000') {
      onSwitchToAdmin();
    } else {
      alert("PIN Incorreto");
      setAdminPin('');
    }
  };

  // Helper to determine background color based on message type
  const getMessageColor = (type: string) => {
      switch (type) {
          case 'success': return 'bg-green-600 text-white';
          case 'exit': return 'bg-red-600 text-white'; // Red for exit
          case 'error': return 'bg-red-600 text-white';
          default: return 'bg-blue-600 text-white';
      }
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-slate-900 text-white relative">
      {/* Admin Button */}
      <button 
        onClick={() => setShowAdminModal(true)}
        className="absolute top-4 right-4 z-40 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
      >
        <Lock className="w-6 h-6" />
      </button>

      {/* Admin PIN Modal */}
      {showAdminModal && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white text-slate-900 p-6 rounded-xl w-full max-w-sm">
                <h3 className="text-xl font-bold mb-4">Acesso Administrativo</h3>
                <form onSubmit={handleAdminLogin}>
                    <label className="block text-sm text-slate-600 mb-2">Digite o PIN (Padrão: 0000)</label>
                    <input 
                        type="password" 
                        autoFocus
                        className="w-full text-center text-2xl tracking-widest p-3 border rounded-lg mb-4"
                        value={adminPin}
                        onChange={e => setAdminPin(e.target.value)}
                        maxLength={4}
                    />
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setShowAdminModal(false)} className="flex-1 py-3 bg-slate-200 rounded-lg font-medium">Cancelar</button>
                        <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium">Entrar</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Left Side: Camera & Info */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative border-r border-slate-800">
        
        <div className="mb-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-blue-500">
            {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </h1>
          <p className="text-slate-400 mt-2 text-xl">
            {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        <div className="relative w-full max-w-md aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border-4 border-slate-800">
            <video ref={videoRef} className="w-full h-full object-cover transform scale-x-[-1]" muted playsInline />
            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                <Camera className="w-12 h-12 animate-pulse" />
              </div>
            )}
            <canvas ref={canvasRef} width={320} height={240} className="hidden" />
        </div>

        {/* Status Overlay */}
        {statusMessage && (
          <div className={`absolute top-10 left-1/2 -translate-x-1/2 px-8 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in-down z-50 ${getMessageColor(statusMessage.type)}`}>
            {statusMessage.type === 'success' ? <CheckCircle className="w-8 h-8"/> : 
             statusMessage.type === 'exit' ? <LogOut className="w-8 h-8"/> : 
             <UserX className="w-8 h-8"/>}
            <span className="text-xl font-semibold">{statusMessage.text}</span>
          </div>
        )}

        <div className="mt-8 w-full max-w-md">
            <label className="block text-sm font-medium text-slate-400 mb-2">Obra Atual</label>
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select 
                    value={selectedSiteId}
                    onChange={(e) => setSelectedSiteId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-lg rounded-lg p-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                    {sites.map(site => (
                        <option key={site.id} value={site.id}>{site.name}</option>
                    ))}
                </select>
            </div>
        </div>
      </div>

      {/* Right Side: Keypad */}
      <div className="w-full md:w-[450px] bg-slate-950 p-8 flex flex-col justify-center">
        <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold mb-2">Registro de Ponto</h2>
            <p className="text-slate-400">Digite os 4 últimos dígitos do celular</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex gap-3">
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className={`w-4 h-4 rounded-full transition-all duration-200 ${
                input.length > idx ? 'bg-blue-500 scale-110' : 'bg-slate-800'
              }`} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-[300px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="h-20 w-20 rounded-full bg-slate-800 hover:bg-slate-700 text-3xl font-semibold transition-colors active:scale-95 shadow-lg"
            >
              {num}
            </button>
          ))}
          <button 
            onClick={handleClear}
            className="h-20 w-20 rounded-full bg-red-900/30 hover:bg-red-900/50 text-red-400 text-sm font-semibold transition-colors active:scale-95 flex items-center justify-center"
          >
            LIMPAR
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="h-20 w-20 rounded-full bg-slate-800 hover:bg-slate-700 text-3xl font-semibold transition-colors active:scale-95 shadow-lg"
          >
            0
          </button>
          <div className="h-20 w-20" /> {/* Spacer */}
        </div>
        
        <div className="mt-12 text-center text-slate-600 text-sm">
          Exempland Control v1.2
        </div>
      </div>
    </div>
  );
};