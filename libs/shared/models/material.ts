export interface Material {
  id: string;
  businessId: string;
  name: string;
  color?: string;
  brand?: string;
  type: string;
  totalWeightGrams: number;
  remainingWeightGrams: number;
  unit: string;
  costPerKg: number;
  bedTemperature?: number;
  nozzleTemperature?: number;
  createdAt?: string;
  updatedAt?: string;
}
