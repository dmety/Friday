export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface SystemStats {
  batteryLevel: number;
  isCharging: boolean;
  online: boolean;
  latitude: number | null;
  longitude: number | null;
  cpuLoad: number; // Simulated
  memoryUsage: number; // Simulated
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  sender: 'USER' | 'FRIDAY' | 'SYSTEM';
  text: string;
}
