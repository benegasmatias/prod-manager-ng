export interface DashboardSummary {
  operationalCounters: {
    visitsToday: number;
    pendingBudgets: number;
    inProduction: number;
    deliveriesThisWeek: number;
    delayedOrders: number;
    pendingPayments: number;
  };
  pipelineSummary: {
    stage: string;
    count: number;
  }[];
  calendarEvents: {
    id: string;
    type: string;
    clientName: string;
    date: string;
    time: string;
    status: string;
  }[];
  alerts: {
    message: string;
    type?: 'warning' | 'error';
  }[];
}
