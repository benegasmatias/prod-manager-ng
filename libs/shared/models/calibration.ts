import { Machine } from './machine';
import { Material } from './material';

export interface Calibration {
  id: string;
  businessId: string;
  machineId: string;
  materialId?: string;
  testType: string;
  results?: any;
  notes?: string;
  success: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  machine?: Machine;
  material?: Material;
}

export interface CreateCalibrationDto {
  machineId: string;
  materialId?: string;
  testType: string;
  results?: any;
  notes?: string;
  success?: boolean;
}
