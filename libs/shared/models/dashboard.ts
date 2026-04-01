export type DashboardAlertTone = 'info' | 'warning' | 'error' | 'success';

export interface DashboardKPI {
  title: string;
  value: string | number;
  icon?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'highlight' | 'status';
  accentColor?: string;
  subtitle?: string;
}

export interface RecentOrderEntry {
  id: string;
  clientName: string;
  type: string;
  status: string;
  total: number;
  dueDate: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface DashboardSummary {
  // Core Business Metrics (Real Backend Data)
  totalSales: number;
  pendingBalance: number;
  activeOrders: number;
  productionOrders: number;
  activeMachines: number;
  newCustomers: number;
  
  // Lists
  alerts: {
    id?: string;
    message: string;
    type: DashboardAlertTone;
    timestamp: string;
    orderId?: string;
  }[];
  
  recentOrders: RecentOrderEntry[];
  
  // Analysis
  trends: any | null;

  // Legacy / UI Helpers
  kpis?: DashboardKPI[];
  
  // Specialized Rubric Data (Only if returned by backend)
  printers?: any[];
  productionQueue?: any[];
  materials?: any[];
}
