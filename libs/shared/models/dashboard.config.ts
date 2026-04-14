import { Rubro } from './negocio';

export interface DashboardMetric {
  id: string;
  label: string;
  icon: string;
  color?: string;
  dataKey: string; // The property name in the summary DTO (e.g. 'totalSales', 'activePrinters')
  unit?: string;
  requiredCapability?: string;
}

export interface DashboardQuickAction {
  label: string;
  icon: string;
  url?: string;
  action?: string;
  color?: string;
  requiredCapability?: string;
}

export interface DashboardSection {
  title: string;
  type: 'grid' | 'list' | 'chart' | 'custom';
  widgetId?: string; // For specialized components
  fullWidth?: boolean;
  requiredCapability?: string;
}

export interface DashboardSectionTitles {
  printers?: string;
  materials?: string;
  financials?: string;
  financialsNeto?: string;
  financialsMonthly?: string;
  alerts?: string;
  queue?: string;
  [key: string]: string | undefined;
}

export interface DashboardConfig {
  rubro: Rubro;
  category: string;
  title: string;
  titleAccent: string;
  description: string;
  metrics: DashboardMetric[];
  quickActions: DashboardQuickAction[];
  sections: DashboardSection[];
  kpiTitles?: Record<string, string>;
  statusLabels?: Record<string, string>;
  sectionTitles?: DashboardSectionTitles;
}
