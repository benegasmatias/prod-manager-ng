export interface Cliente {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  businessId?: string;
  totalOrders?: number;
  createdAt: string; // ISO String
  updatedAt?: string; // ISO String
  status?: 'active' | 'inactive';
}

export interface ClienteStats {
  total: number;
  vip: number;
  nuevosMes: number;
}
