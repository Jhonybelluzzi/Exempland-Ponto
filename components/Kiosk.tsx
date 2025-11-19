import React, { useState, useEffect, useRef } from 'react';
import { Employee, LogType, Site, TimeLog } from '../types';
import { StorageService } from '../services/storageService';
import { Camera, CheckCircle, UserX, MapPin, Lock, LogOut, ArrowLeft, User } from 'lucide-react';

interface KioskProps {
  employees: Employee[];
  sites: Site[];
  onSwitchToAdmin: () => void;
}

export const Kiosk: React.FC<KioskProps> = ({ employees, sites, onSwitchToAdmin }) => {
  // Steps: 'LOGIN' (Keypad) -> 'DETAILS' (Camera/Site/Confirm)
  const [step, setStep] = useState<'LOGIN' | 'DETAILS'>('LOGIN');
  const [input, setInput] = useState('');
  const [identifiedEmployee, setIdentifiedEmployee] = useState<Employee | null>(null);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info' | 'exit', text: string } | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
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

  // Initialize Camera when entering DETAILS step
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    if (step === 'DETAILS') {
        const startCamera = async () => {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.onloadedmetadata = () => {
                setIsCameraReady(true);
                // Use a timeout to ensure play() is called after loading
                setTimeout(() => {
                    videoRef.current?.play().catch(e => console.error("Play error", e));
                }, 100);
              };
            }
          } catch (err) {
            console.error("Camera error:", err);
            setStatusMessage({ type: 'error', text: "Erro na câmera. Verifique permissões." });
          }
        };
        startCamera();
    }

    return () => {
      if (stream) {
          (stream as MediaStream).getTracks().forEach(track => track.stop());
      }
      setIsCameraReady(false);
    };
  }, [step]);

  // Set default site when entering details
  useEffect(() => {
    if (step === 'DETAILS' && sites.length > 0 && !selectedSiteId) {
        setSelectedSiteId(sites[0].id);
    }
  }, [step, sites, selectedSiteId]);

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
      // Draw image smaller to save data size for Google Sheets
      context.drawImage(videoRef.current, 0, 0, 320, 240);
      // Use lower quality JPEG to reduce payload size
      return canvasRef.current.toDataURL('image/jpeg', 0.6);
    }
    return '';
  };

  // Step 1: Verify User Code
  const handleLoginSubmit = () => {
    if (input.length !== 4) return;

    const employee = employees.find(e => e.phone.endsWith(input) && e.active);
    
    if (!employee) {
      setStatusMessage({ type: 'error', text: 'Funcionário não encontrado.' });
      setTimeout(() => { setStatusMessage(null); setInput(''); }, 2000);
      return;
    }

    setIdentifiedEmployee(employee);
    setStep('DETAILS');
    setInput('');
  };

  useEffect(() => {
    if (input.length === 4 && step === 'LOGIN') {
        handleLoginSubmit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);


  // Step 2: Finalize Record
  const handleConfirmRecord = async () => {
    if (!identifiedEmployee) return;

    if (!selectedSiteId) {
       setStatusMessage({ type: 'error', text: 'Selecione uma obra.' });
       return;
    }

    // Determine In or Out based on last log
    const logs = StorageService.getLogs();
    const lastLog = logs
      .filter(l => l.employeeId === identifiedEmployee.id)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    const type = (!lastLog || lastLog.type === LogType.OUT) ? LogType.IN : LogType.OUT;
    const action = type === LogType.IN ? 'ENTRADA' : 'SAÍDA';

    const photo = capturePhoto();
    
    const newLog: TimeLog = {
      id: crypto.randomUUID(),
      employeeId: identifiedEmployee.id,
      siteId: selectedSiteId,
      timestamp: Date.now(),
      type,
      photoSnapshot: photo
    };

    StorageService.addLog(newLog);
    
    setStatusMessage({ 
        type: type === LogType.IN ? 'success' : 'exit', 
        text: `${action} Confirmada!` 
    });
    
    // Reset flow
    setTimeout(() => {
      setStatusMessage(null);
      setStep('LOGIN');
      setIdentifiedEmployee(null);
    }, 3000);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded simple PIN for demo purposes as requested
    if (adminPin === '0000') {
      onSwitchToAdmin();
    } else {
      alert("PIN Incorreto");
      setAdminPin('');
    }
  };

  const getMessageColor = (type: string) => {
      switch (type) {
          case 'success': return 'bg-green-600 text-white';
          case 'exit': return 'bg-red-600 text-white';
          case 'error': return 'bg-red-600 text-white';
          default: return 'bg-blue-600 text-white';
      }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white relative min-h-screen">
      
      {/* Admin Lock Button */}
      <button 
        onClick={() => setShowAdminModal(true)}
        className="absolute top-4 right-4 z-40 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
      >
        <Lock className="w-6 h-6" />
      </button>

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="bg-white text-slate-900 p-6 rounded-xl w-full max-w-sm animate-fade-in-down">
                <h3 className="text-xl font-bold mb-4">Acesso Administrativo</h3>
                <form onSubmit={handleAdminLogin}>
                    <label className="block text-sm text-slate-600 mb-2">Digite o PIN</label>
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

      {/* Status Toast */}
      {statusMessage && (
          <div className={`fixed top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-md p-6 rounded-xl shadow-2xl flex flex-col items-center justify-center text-center gap-2 animate-fade-in-down z-50 ${getMessageColor(statusMessage.type)}`}>
            {statusMessage.type === 'success' ? <CheckCircle className="w-12 h-12 mb-2"/> : 
             statusMessage.type === 'exit' ? <LogOut className="w-12 h-12 mb-2"/> : 
             <UserX className="w-12 h-12 mb-2"/>}
            <span className="text-2xl font-bold">{statusMessage.text}</span>
          </div>
      )}

      {/* === STEP 1: CLOCK & KEYPAD === */}
      {step === 'LOGIN' && (
        <div className="flex flex-col items-center justify-center flex-1 p-4 animate-fade-in w-full max-w-md mx-auto">
            <div className="mb-8 text-center">
                <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-blue-500">
                    {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </h1>
                <p className="text-slate-400 mt-1 text-lg uppercase tracking-widest">
                    {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
            </div>

            <div className="w-full px-4">
                <div className="text-center mb-6">
                    <p className="text-slate-300 mb-3 text-sm uppercase tracking-wider">Código de Acesso</p>
                    <div className="flex justify-center gap-4 h-4">
                        {[0, 1, 2, 3].map((idx) => (
                        <div key={idx} className={`w-4 h-4 rounded-full transition-all duration-200 border-2 border-slate-600 ${
                            input.length > idx ? 'bg-blue-500 border-blue-500 scale-110' : 'bg-transparent'
                        }`} />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                    key={num}
                    onClick={() => handleKeyPress(num.toString())}
                    className="aspect-square w-full rounded-full bg-slate-800 hover:bg-slate-700 text-2xl font-semibold transition-all active:scale-95 shadow-lg flex items-center justify-center"
                    >
                    {num}
                    </button>
                ))}
                <button 
                    onClick={handleClear}
                    className="aspect-square w-full rounded-full bg-red-900/20 text-red-400 text-xs font-bold transition-all active:scale-95 flex items-center justify-center hover:bg-red-900/30"
                >
                    LIMPAR
                </button>
                <button
                    onClick={() => handleKeyPress('0')}
                    className="aspect-square w-full rounded-full bg-slate-800 hover:bg-slate-700 text-2xl font-semibold transition-all active:scale-95 shadow-lg flex items-center justify-center"
                >
                    0
                </button>
                </div>
            </div>
            
            <div className="mt-10 text-slate-600 text-xs">Exempland Control v1.6</div>
        </div>
      )}

      {/* === STEP 2: DETAILS (CAMERA & SITE) === */}
      {step === 'DETAILS' && identifiedEmployee && (
          <div className="flex flex-col flex-1 p-4 items-center animate-fade-in w-full max-w-md mx-auto overflow-y-auto">
              <div className="w-full flex justify-start mb-4">
                <button 
                    onClick={() => { setStep('LOGIN'); setIdentifiedEmployee(null); setInput(''); }}
                    className="p-3 bg-slate-800 rounded-full text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
              </div>

              <div className="w-full flex flex-col gap-5 pb-6">
                  
                  <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                      <div className="w-16 h-16 bg-slate-700 rounded-full overflow-hidden border-2 border-blue-500 shrink-0">
                          {identifiedEmployee.photoUrl ? 
                            <img src={identifiedEmployee.photoUrl} className="w-full h-full object-cover" alt="User" /> : 
                            <User className="w-full h-full p-3 text-slate-400"/>
                          }
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Olá, {identifiedEmployee.name.split(' ')[0]}</h2>
                        <p className="text-blue-400 text-sm font-medium">{identifiedEmployee.role}</p>
                      </div>
                  </div>

                  {/* Camera Preview */}
                  <div className="w-full">
                      <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Confirmação Visual</label>
                      <div className="relative w-full aspect-[4/3] bg-black rounded-xl overflow-hidden border-2 border-slate-600 shadow-2xl">
                            <video ref={videoRef} className="w-full h-full object-cover transform scale-x-[-1]" muted playsInline />
                            {!isCameraReady && (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-500 gap-2 bg-slate-900">
                                    <Camera className="animate-pulse w-8 h-8" /> 
                                    <span>Ativando câmera...</span>
                                </div>
                            )}
                            <canvas ref={canvasRef} width={320} height={240} className="hidden" />
                      </div>
                  </div>

                  {/* Site Selector */}
                  <div className="w-full">
                      <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Local de Trabalho</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <select 
                            value={selectedSiteId}
                            onChange={(e) => setSelectedSiteId(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 text-white text-lg rounded-xl p-4 pl-12 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                        >
                            {sites.map(site => (
                                <option key={site.id} value={site.id}>{site.name}</option>
                            ))}
                        </select>
                      </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleConfirmRecord}
                    disabled={!isCameraReady}
                    className="w-full mt-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-lg font-bold py-4 rounded-xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-3"
                  >
                    <CheckCircle className="w-6 h-6" />
                    CONFIRMAR PONTO
                  </button>

              </div>
          </div>
      )}

    </div>
  );
}