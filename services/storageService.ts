import { Employee, Site, TimeLog, UserRole, AppSettings } from '../types';

const KEYS = {
  EMPLOYEES: 'cp_employees',
  SITES: 'cp_sites',
  LOGS: 'cp_logs',
  SETTINGS: 'cp_settings'
};

// Seed Data
const seedEmployees: Employee[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    phone: '11999991234',
    email: 'carlos@obra.com',
    role: UserRole.FOREMAN,
    hourlyRate: 35.00,
    schedule: { days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'], start: '07:00', end: '16:00' },
    active: true
  },
  {
    id: '2',
    name: 'Ana Souza',
    phone: '11988885678',
    email: 'ana@obra.com',
    role: UserRole.ENGINEER,
    hourlyRate: 85.00,
    schedule: { days: ['Seg', 'Qua', 'Sex'], start: '09:00', end: '17:00' },
    active: true
  }
];

const seedSites: Site[] = [
  { id: '1', name: 'Residencial Parque Verde', address: 'Rua das Flores, 123', active: true },
  { id: '2', name: 'Reforma Shopping Centro', address: 'Av. Central, 500', active: true }
];

export const StorageService = {
  getEmployees: (): Employee[] => {
    const data = localStorage.getItem(KEYS.EMPLOYEES);
    return data ? JSON.parse(data) : seedEmployees;
  },
  saveEmployees: (employees: Employee[]) => {
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(employees));
  },
  
  getSites: (): Site[] => {
    const data = localStorage.getItem(KEYS.SITES);
    return data ? JSON.parse(data) : seedSites;
  },
  saveSites: (sites: Site[]) => {
    localStorage.setItem(KEYS.SITES, JSON.stringify(sites));
  },

  getLogs: (): TimeLog[] => {
    const data = localStorage.getItem(KEYS.LOGS);
    return data ? JSON.parse(data) : [];
  },
  
  addLog: async (log: TimeLog) => {
    const logs = StorageService.getLogs();
    localStorage.setItem(KEYS.LOGS, JSON.stringify([...logs, log]));

    // Try to sync with Google Sheets if configured
    const settings = StorageService.getSettings();
    if (settings.googleSheetUrl) {
      try {
        const employees = StorageService.getEmployees();
        const sites = StorageService.getSites();
        const employee = employees.find(e => e.id === log.employeeId);
        const site = sites.find(s => s.id === log.siteId);

        const payload = {
          data: new Date(log.timestamp).toLocaleDateString('pt-BR'),
          hora: new Date(log.timestamp).toLocaleTimeString('pt-BR'),
          funcionario: employee?.name || 'Desconhecido',
          tipo: log.type === 'ENTRADA' ? 'ENTRADA' : 'SAÍDA',
          obra: site?.name || 'Desconhecida',
          foto: log.photoSnapshot || '' // Sending base64 string
        };

        // Use no-cors to avoid CORS preflight issues with Google Script Web Apps
        // Note: 'no-cors' mode prevents reading the response, but sends the data.
        await fetch(settings.googleSheetUrl, {
          method: 'POST',
          mode: 'no-cors', 
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
        console.log("Enviado para Google Sheets");
      } catch (error) {
        console.error("Erro ao sincronizar com Google Sheets", error);
      }
    }
  },

  getSettings: (): AppSettings => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : {};
  },

  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }
};