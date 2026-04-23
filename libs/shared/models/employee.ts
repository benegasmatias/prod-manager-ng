export interface Employee {
  id: string;
  firstName: string;
  lastName?: string;
  active: boolean;
  blockedByQuota?: boolean;
  phone?: string;
  email?: string;
  specialties?: string;
  role?: string;
}
