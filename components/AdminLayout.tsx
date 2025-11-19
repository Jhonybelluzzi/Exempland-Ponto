import React, { useState } from 'react';
import { AppState } from '../types';
import { LayoutDashboard, Users, Map, Wallet, Bot, LogOut, Menu, X, Settings } from 'lucide-react';

interface AdminLayoutProps {
  activeSection: AppState['adminSection'];
  onNavigate: (section: AppState['adminSection']) => void;
  onLogout: () => void;
  children: React.ReactNode;
  userEmail: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ activeSection, onNavigate, onLogout, children, userEmail }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'DASHBOARD', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'EMPLOYEES', label: 'Funcionários', icon: Users },
    { id: 'SITES', label: 'Obras', icon: Map },
    { id: 'PAYROLL', label: 'Folha / Custos', icon: Wallet },
    { id: 'AI_INSIGHTS', label: 'Assistente IA', icon: Bot },
    { id: 'SETTINGS', label: 'Integrações', icon: Settings },
  ];

  const handleNavigate = (id: AppState['adminSection']) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full">
        <div className="p-6 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">E</div>
                <span className="text-xl font-bold text-slate-800">Exempland</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-10">Control System</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => handleNavigate(item.id as AppState['adminSection'])}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                            isActive 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                        <Icon className="w-5 h-5" />
                        {item.label}
                    </button>
                )
            })}
        </nav>

        <div className="p-4 border-t border-slate-100 flex-shrink-0">
             <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                    AD
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">Admin</p>
                    <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                </div>
             </div>
             <button 
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
                <LogOut className="w-4 h-4" />
                Sair do Painel
             </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-30">
            <div className="flex items-center gap-2">
                 <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">E</div>
                 <div className="font-bold text-slate-800">Exempland</div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-800/50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl flex flex-col animate-fade-in" onClick={e => e.stopPropagation()}>
                 <div className="p-4 border-b border-slate-100 flex justify-between items-center h-16">
                    <span className="font-bold text-slate-800">Menu</span>
                    <button onClick={() => setIsMobileMenuOpen(false)}><X className="w-5 h-5 text-slate-500"/></button>
                 </div>
                 <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                         <button
                            key={item.id}
                            onClick={() => handleNavigate(item.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                                activeSection === item.id ? 'bg-blue-50 text-blue-600' : 'text-slate-600'
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                 </nav>
                 <div className="p-4 border-t border-slate-100">
                     <button 
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair
                    </button>
                 </div>
            </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-full flex flex-col overflow-hidden relative w-full">
        {/* Spacer for mobile header */}
        <div className="md:hidden h-16 flex-shrink-0" />
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 scroll-smooth">
             <div className="max-w-7xl mx-auto pb-20 md:pb-0">
                {children}
            </div>
        </div>
      </main>
    </div>
  );
};