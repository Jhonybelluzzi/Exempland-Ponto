import React, { useState, useEffect } from 'react';
import { Kiosk } from './components/Kiosk';
import { AdminLayout } from './components/AdminLayout';
import { Dashboard } from './components/Dashboard';
import { Employees } from './components/Employees';
import { Sites } from './components/Sites';
import { SmartAssistant } from './components/SmartAssistant';
import { Settings } from './components/Settings';
import { StorageService } from './services/storageService';
import { AppState, Employee, Site, TimeLog } from './types';
import { ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  // Core State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [logs, setLogs] = useState<TimeLog[]>([]);
  
  // UI State
  const [view, setView] = useState<AppState['currentView']>('KIOSK');
  const [adminSection, setAdminSection] = useState<AppState['adminSection']>('DASHBOARD');
  const [showFinancials, setShowFinancials] = useState(false);

  // Load Data
  useEffect(() => {
    setEmployees(StorageService.getEmployees());
    setSites(StorageService.getSites());
    setLogs(StorageService.getLogs());
  }, [view]); // Reload when switching views to ensure fresh data

  // Actions
  const handleSaveEmployee = (emp: Employee) => {
    const exists = employees.some(e => e.id === emp.id);
    const updated = exists 
        ? employees.map(e => e.id === emp.id ? emp : e) 
        : [...employees, emp];
    
    setEmployees(updated);
    StorageService.saveEmployees(updated);
  };

  const handleDeleteEmployee = (id: string) => {
    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated);
    StorageService.saveEmployees(updated);
  };

  const handleSaveSite = (site: Site) => {
    const updated = [...sites, site];
    setSites(updated);
    StorageService.saveSites(updated);
  };

  const handleDeleteSite = (id: string) => {
    const updated = sites.filter(s => s.id !== id);
    setSites(updated);
    StorageService.saveSites(updated);
  };

  // Payroll uses Dashboard but with financials enabled logic (reused component for simplicity in this prompt constraint)
  const renderAdminContent = () => {
    switch (adminSection) {
        case 'DASHBOARD':
            return <Dashboard employees={employees} logs={logs} sites={sites} showFinancials={false} />;
        case 'PAYROLL':
             // Restricted area check could happen here
            return (
                <div>
                    <div className="p-6 bg-amber-50 border-b border-amber-100 mb-4">
                        <div className="flex items-center gap-2 text-amber-800">
                            <span className="font-bold">Área Restrita:</span> 
                            Custos e Pagamentos
                        </div>
                    </div>
                    <Dashboard employees={employees} logs={logs} sites={sites} showFinancials={true} />
                    {/* Add a detailed table here if needed, but dashboard covers requirements */}
                </div>
            );
        case 'EMPLOYEES':
            return <Employees employees={employees} onSave={handleSaveEmployee} onDelete={handleDeleteEmployee} />;
        case 'SITES':
            return <Sites sites={sites} onSave={handleSaveSite} onDelete={handleDeleteSite} />;
        case 'AI_INSIGHTS':
            return <SmartAssistant employees={employees} logs={logs} sites={sites} />;
        case 'SETTINGS':
            return <Settings />;
        default:
            return null;
    }
  };

  if (view === 'KIOSK') {
    return (
        <Kiosk 
            employees={employees} 
            sites={sites}
            onSwitchToAdmin={() => setView('ADMIN')} 
        />
    );
  }

  return (
    <AdminLayout 
        activeSection={adminSection} 
        onNavigate={setAdminSection} 
        onLogout={() => setView('KIOSK')}
        userEmail="admin@construcao.com"
    >
        <div className="h-full relative">
            {/* Back to Kiosk Shortcut for dev ease */}
            <button 
                onClick={() => setView('KIOSK')}
                className="md:hidden absolute top-4 right-4 z-50 p-2 bg-slate-200 rounded-full"
            >
                <ArrowLeft className="w-4 h-4" />
            </button>
            {renderAdminContent()}
        </div>
    </AdminLayout>
  );
};

export default App;