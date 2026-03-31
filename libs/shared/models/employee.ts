export interface Employee {
  id: string;
  firstName: string;
  lastName?: string;
  active: boolean;
  phone?: string;
  email?: string;
  specialties?: string;
}
