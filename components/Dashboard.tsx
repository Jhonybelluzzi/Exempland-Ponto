import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Employee, TimeLog, LogType, Site } from '../types';
import { Users, Clock, HardHat, DollarSign } from 'lucide-react';

interface DashboardProps {
  employees: Employee[];
  logs: TimeLog[];
  sites: Site[];
  showFinancials: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ employees, logs, sites, showFinancials }) => {
  
  const stats = useMemo(() => {
    // Active employees today
    const today = new Date().setHours(0,0,0,0);
    const todayLogs = logs.filter(l => l.timestamp >= today);
    const activeEmployees = new Set(todayLogs.map(l => l.employeeId)).size;
    
    // Total hours this week
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekLogs = logs.filter(l => l.timestamp >= oneWeekAgo).sort((a, b) => a.timestamp - b.timestamp);
    
    let totalHours = 0;
    let totalCost = 0;

    // Simple calculation: match IN with next OUT per person
    const tempLogs: {[key: string]: TimeLog} = {};
    
    weekLogs.forEach(log => {
      if (log.type === LogType.IN) {
        tempLogs[log.employeeId] = log;
      } else if (log.type === LogType.OUT && tempLogs[log.employeeId]) {
        const start = tempLogs[log.employeeId].timestamp;
        const durationHours = (log.timestamp - start) / (1000 * 60 * 60);
        
        if (durationHours < 14) { // Sanity check: ignore shifts > 14h (likely error)
             totalHours += durationHours;
             const emp = employees.find(e => e.id === log.employeeId);
             if (emp) totalCost += durationHours * emp.hourlyRate;
        }
        delete tempLogs[log.employeeId];
      }
    });

    return {
      activeEmployees,
      totalEmployees: employees.filter(e => e.active).length,
      totalHoursWeek: totalHours.toFixed(1),
      estCostWeek: totalCost.toFixed(2)
    };
  }, [employees, logs]);

  const chartData = useMemo(() => {
     const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
            name: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
            dateStr: d.toDateString(),
            hours: 0
        };
     });

     logs.forEach((log, index) => {
        if (log.type === LogType.OUT) {
            // Look back for IN
            const prevLog = logs.slice(0, index).reverse().find(l => l.employeeId === log.employeeId && l.type === LogType.IN);
            if (prevLog) {
                const dateStr = new Date(log.timestamp).toDateString();
                const dayStat = last7Days.find(d => d.dateStr === dateStr);
                if (dayStat) {
                    const hours = (log.timestamp - prevLog.timestamp) / (1000 * 60 * 60);
                    if(hours < 24) dayStat.hours += hours;
                }
            }
        }
     });

     return last7Days;
  }, [logs]);

  const activeData = [
    { name: 'Ativos', value: stats.activeEmployees },
    { name: 'Inativos', value: stats.totalEmployees - stats.activeEmployees },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Funcionários Hoje</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.activeEmployees} / {stats.totalEmployees}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
               <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Horas (7 dias)</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalHoursWeek}h</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
               <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Obras Ativas</p>
              <h3 className="text-2xl font-bold text-slate-900">{sites.filter(s => s.active).length}</h3>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
               <HardHat className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {showFinancials && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Custo Est. (Semana)</p>
              <h3 className="text-2xl font-bold text-slate-900">R$ {stats.estCostWeek}</h3>
            </div>
            <div className="p-3 bg-emerald-100 rounded-full">
               <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Horas Trabalhadas por Dia</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                        <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Status dos Funcionários</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={activeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            <Cell key="cell-0" fill="#3b82f6" />
                            <Cell key="cell-1" fill="#e2e8f0" />
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-slate-600">Ativos Hoje</span>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <span className="text-sm text-slate-600">Ausentes</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};