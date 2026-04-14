export type UserStatus = 'PENDING' | 'ACTIVE' | 'BLOCKED';
export type GlobalRole = 'SUPER_ADMIN' | 'USER';
export type BusinessRole = 'OWNER' | 'ADMIN' | 'OPERATOR';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  globalRole: GlobalRole;
  status: UserStatus;
  approvedAt?: string;
  approvedBy?: string;
  defaultBusinessId?: string;
}

export interface BusinessUser {
  businessId: string;
  userId: string;
  role: BusinessRole;
}
