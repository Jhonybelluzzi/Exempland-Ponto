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

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">E</div>
                <span className="text-xl font-bold text-slate-800">Exempland</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-10">Control System</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id as AppState['adminSection'])}
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

        <div className="p-4 border-t border-slate-100">
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
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20">
            <div className="font-bold text-slate-800">Exempland Control</div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
                {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-800/50 z-10" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="absolute right-0 top-16 bottom-0 w-64 bg-white p-4 shadow-xl" onClick={e => e.stopPropagation()}>
                 <nav className="space-y-2">
                    {navItems.map((item) => (
                         <button
                            key={item.id}
                            onClick={() => { onNavigate(item.id as any); setIsMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                                activeSection === item.id ? 'bg-blue-50 text-blue-600' : 'text-slate-600'
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                     <button 
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 mt-4 border-t border-slate-100"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair
                    </button>
                 </nav>
            </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
};