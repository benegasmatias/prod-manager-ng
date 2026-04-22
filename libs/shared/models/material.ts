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
  attributes?: Record<string, string | number | boolean | null>;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaterialFormFieldSchema {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'color' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: any }[];
  industry?: string;
}
