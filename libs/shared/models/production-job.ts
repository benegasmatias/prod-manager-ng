import { Employee } from './employee';
import { Machine } from './machine';

export enum ProductionJobStatus {
    QUEUED = 'QUEUED',
    IN_PROGRESS = 'IN_PROGRESS',
    PAUSED = 'PAUSED',
    DONE = 'DONE',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED'
}

export enum ProductionJobPriority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}

export interface ProductionJob {
    id: string;
    businessId: string;
    orderId: string;
    orderItemId: string;
    status: ProductionJobStatus;
    priority: ProductionJobPriority;
    currentStage: string;
    sequence: number;
    machineId?: string;
    operatorId?: string;
    machine?: Machine;
    responsable?: Employee;
    order?: any; // Context for the board
    orderItem?: any; // Context for the board
    notes?: string;
    createdAt: string;
    updatedAt: string;
    startedAt?: string;
    completedAt?: string;
}
