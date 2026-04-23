export type MachineStatus = 'IDLE' | 'WORKING' | 'MAINTENANCE';

export interface ProductionJob {
  id: string;
  orderId: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  totalUnits?: number;
  order?: {
    code?: string;
    clientName?: string;
  };
  orderItem?: {
    name?: string;
  };
}

export interface Machine {
  id: string;
  name: string;
  model: string | null;
  status: MachineStatus;
  active: boolean;
  blockedByQuota?: boolean;
  businessId?: string;
  type?: string;     // Generic type or model specifier

  // UI Support
  currentJobId?: string;
  productionJobs?: ProductionJob[];

  // 3D Printing Extensions (Optional)
  nozzle?: string;
  maxFilaments?: number;
}
