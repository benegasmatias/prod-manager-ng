import { Employee } from './employee';
import { Machine } from './machine';
import { Pedido as Order, PedidoItem as OrderItem } from './pedido';
import { Material } from './material';

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

export interface ProductionJobMaterial {
    id: string;
    jobId: string;
    materialId: string;
    material?: Material;
    quantity: number;
    consumedQuantity: number;
    isReserved: boolean;
}

export interface ProductionJob {
    id: string;
    businessId: string;
    orderId: string;
    orderItemId: string;
    status: ProductionJobStatus;
    priority: ProductionJobPriority;
    currentStage?: string;
    sequence: number;
    machineId?: string;
    operatorId?: string;
    machine?: Machine;
    responsable?: Employee;
    order?: any; // Context for the board
    orderItem?: any; // Context for the board
    jobMaterials?: ProductionJobMaterial[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
    actualMinutes?: number;
    estimatedMinutes?: number;
    startedAt?: string;
    completedAt?: string;
    lastStartedAt?: string;
}
