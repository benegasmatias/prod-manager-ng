import { Pedido } from '@shared/models';

export type CalendarViewMode = 'WEEK' | 'MONTH' | 'AGENDA';

export type RiskLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type UrgencyLevel = 'NORMAL' | 'UPCOMING' | 'TODAY' | 'OVERDUE';

export interface CalendarOrderEvent extends Pedido {
  // UI Derived state
  risk: {
    level: RiskLevel;
    reasons: string[];
  };
  urgency: UrgencyLevel;
  isAssigned: boolean;
  completionPercentage: number;
}

export interface CalendarFilters {
  status: string[];
  operatorId?: string;
  machineId?: string;
  onlyRisky: boolean;
  onlyOverdue: boolean;
}

export interface DayColumn {
  date: Date;
  isToday: boolean;
  events: CalendarOrderEvent[];
}
