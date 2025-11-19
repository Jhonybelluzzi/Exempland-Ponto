import React, { useState } from 'react';
import { Employee, UserRole } from '../types';
import { Plus, Search, Edit2, Trash2, X, Save, Camera, User } from 'lucide-react';

interface EmployeesProps {
  employees: Employee[];
  onSave: (employee: Employee) => void;
  onDelete: (id: string) => void;
}

export const Employees: React.FC<EmployeesProps> = ({ employees, onSave, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmp, setEditingEmp] = useState<Partial<Employee> | null>(null);

  const filtered = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (emp?: Employee) => {
    if (emp) {
      setEditingEmp({ ...emp });
    } else {
      setEditingEmp({
        id: crypto.randomUUID(),
        name: '',
        phone: '',
        email: '',
        role: UserRole.WORKER,
        hourlyRate: 0,
        schedule: { days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'], start: '08:00', end: '17:00' },
        active: true,
        photoUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmp && editingEmp.name && editingEmp.phone && editingEmp.email) {
        onSave(editingEmp as Employee);
        setIsModalOpen(false);
        setEditingEmp(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setEditingEmp(prev => prev ? ({ ...prev, photoUrl: reader.result as string }) : null);
        };
        reader.readAsDataURL(file);
    }
  };

  const toggleDay = (day: string) => {
    if (!editingEmp?.schedule) return;
    const days = editingEmp.schedule.days;
    if (days.includes(day)) {
        setEditingEmp({ ...editingEmp, schedule: { ...editingEmp.schedule, days: days.filter(d => d !== day) } });
    } else {
        setEditingEmp({ ...editingEmp, schedule: { ...editingEmp.schedule, days: [...days, day] } });
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Gerenciar Funcionários</h2>
        <button 
            onClick={() => handleEdit()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
            <Plus className="w-4 h-4" /> Novo Funcionário
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Buscar por nome ou função..." 
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 w-16">Foto</th>
                        <th className="px-6 py-4">Nome</th>
                        <th className="px-6 py-4">Contato</th>
                        <th className="px-6 py-4">Função</th>
                        <th className="px-6 py-4">Valor Hora</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filtered.map(emp => (
                        <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center border border-slate-300">
                                    {emp.photoUrl ? (
                                        <img src={emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-900">{emp.name}</td>
                            <td className="px-6 py-4">
                                <div>{emp.phone}</div>
                                <div className="text-xs text-slate-400">{emp.email}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium">
                                    {emp.role}
                                </span>
                            </td>
                            <td className="px-6 py-4">R$ {emp.hourlyRate.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                <button onClick={() => handleEdit(emp)} className="p-2 hover:bg-slate-200 rounded-full text-blue-600">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => onDelete(emp.id)} className="p-2 hover:bg-red-100 rounded-full text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && editingEmp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-800">
                        {editingEmp.id ? 'Editar Funcionário' : 'Novo Funcionário'}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-500" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    {/* Photo Upload */}
                    <div className="flex flex-col items-center justify-center mb-4">
                        <div className="relative w-24 h-24 mb-2 group">
                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md flex items-center justify-center">
                                {editingEmp.photoUrl ? (
                                    <img src={editingEmp.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-slate-300" />
                                )}
                            </div>
                            <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-2 rounded-full cursor-pointer text-white shadow-lg transition-colors">
                                <Camera size={16} />
                            </label>
                            <input id="photo-upload" type="file" accept="image/*" hidden onChange={handleImageUpload} />
                        </div>
                        <span className="text-sm text-slate-500 font-medium">Foto do Perfil</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo <span className="text-red-500">*</span></label>
                            <input required className="w-full border border-slate-300 bg-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                value={editingEmp.name} onChange={e => setEditingEmp({...editingEmp, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Telefone (Login) <span className="text-red-500">*</span></label>
                            <input required className="w-full border border-slate-300 bg-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Apenas números"
                                value={editingEmp.phone} onChange={e => setEditingEmp({...editingEmp, phone: e.target.value.replace(/\D/g, '')})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail <span className="text-red-500">*</span></label>
                            <input required type="email" className="w-full border border-slate-300 bg-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                value={editingEmp.email} onChange={e => setEditingEmp({...editingEmp, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Função</label>
                            <select className="w-full border border-slate-300 bg-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={editingEmp.role} onChange={e => setEditingEmp({...editingEmp, role: e.target.value as UserRole})}
                            >
                                {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Valor Hora (R$)</label>
                            <input type="number" step="0.01" className="w-full border border-slate-300 bg-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                value={editingEmp.hourlyRate} onChange={e => setEditingEmp({...editingEmp, hourlyRate: parseFloat(e.target.value)})} />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-2">
                        <label className="block text-sm font-medium text-slate-800 mb-3">Jornada de Trabalho</label>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                                <button 
                                    type="button"
                                    key={day}
                                    onClick={() => toggleDay(day)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                                        editingEmp.schedule?.days.includes(day) 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                        : 'bg-white text-slate-500 border-slate-300 hover:border-blue-300'
                                    }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="text-xs text-slate-500 font-medium mb-1 block">Entrada</label>
                                <input type="time" className="w-full border border-slate-300 bg-white rounded-lg p-2"
                                    value={editingEmp.schedule?.start} 
                                    onChange={e => setEditingEmp({...editingEmp, schedule: {...editingEmp.schedule!, start: e.target.value}})} />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-slate-500 font-medium mb-1 block">Saída</label>
                                <input type="time" className="w-full border border-slate-300 bg-white rounded-lg p-2"
                                    value={editingEmp.schedule?.end} 
                                    onChange={e => setEditingEmp({...editingEmp, schedule: {...editingEmp.schedule!, end: e.target.value}})} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium shadow-sm">
                            <Save className="w-4 h-4" /> Salvar Funcionário
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};