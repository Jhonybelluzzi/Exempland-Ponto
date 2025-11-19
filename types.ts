export enum UserRole {
  ADMIN = 'Admin',
  WORKER = 'Operário',
  FOREMAN = 'Mestre de Obras',
  ENGINEER = 'Engenheiro'
}

export interface Schedule {
  days: string[]; // e.g., ['Seg', 'Ter', 'Qua'...]
  start: string; // "09:00"
  end: string; // "17:00"
}

export interface Employee {
  id: string;
  name: string;
  phone: string; // We use last 4 digits for login
  email: string;
  role: UserRole;
  hourlyRate: number;
  schedule: Schedule;
  photoUrl?: string; // Base64 or URL
  active: boolean;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  active: boolean;
}

export enum LogType {
  IN = 'ENTRADA',
  OUT = 'SAIDA'
}

export interface TimeLog {
  id: string;
  employeeId: string;
  siteId: string;
  timestamp: number; // Date.now()
  type: LogType;
  photoSnapshot: string; // Base64 of the selfie at that moment
}

export interface AppSettings {
  googleSheetUrl?: string;
}

export interface AppState {
  currentView: 'KIOSK' | 'ADMIN';
  adminSection: 'DASHBOARD' | 'EMPLOYEES' | 'SITES' | 'PAYROLL' | 'AI_INSIGHTS' | 'SETTINGS';
}