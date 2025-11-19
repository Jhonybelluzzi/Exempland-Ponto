import React, { useState } from 'react';
import { Site } from '../types';
import { MapPin, Plus, Trash2 } from 'lucide-react';

interface SitesProps {
  sites: Site[];
  onSave: (site: Site) => void;
  onDelete: (id: string) => void;
}

export const Sites: React.FC<SitesProps> = ({ sites, onSave, onDelete }) => {
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteAddress, setNewSiteAddress] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSiteName) {
        onSave({
            id: crypto.randomUUID(),
            name: newSiteName,
            address: newSiteAddress,
            active: true
        });
        setNewSiteName('');
        setNewSiteAddress('');
    }
  };

  return (
    <div className="p-6">
       <h2 className="text-2xl font-bold text-slate-800 mb-6">Obras e Ambientes</h2>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
             <h3 className="text-lg font-semibold mb-4">Adicionar Nova Obra</h3>
             <form onSubmit={handleAdd} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Obra</label>
                    <input 
                        required
                        className="w-full border border-slate-300 rounded-lg p-2"
                        placeholder="Ex: Edifício Horizonte"
                        value={newSiteName}
                        onChange={e => setNewSiteName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Endereço / Local</label>
                    <input 
                        className="w-full border border-slate-300 rounded-lg p-2"
                        placeholder="Ex: Rua 10, Centro"
                        value={newSiteAddress}
                        onChange={e => setNewSiteAddress(e.target.value)}
                    />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Criar Obra
                </button>
             </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {sites.map(site => (
                <div key={site.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between group">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                             <MapPin className="w-4 h-4 text-orange-500" />
                             <h4 className="font-semibold text-slate-900">{site.name}</h4>
                        </div>
                        <p className="text-sm text-slate-500 ml-6">{site.address}</p>
                        <div className="ml-6 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${site.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {site.active ? 'Em Andamento' : 'Concluída'}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={() => onDelete(site.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}
          </div>
       </div>
    </div>
  );
};