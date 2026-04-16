export type UserStatus = 'PENDING' | 'ACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'DELETED';
export type GlobalRole = 'SUPER_ADMIN' | 'USER';
export type BusinessRole = 'OWNER' | 'ADMIN' | 'OPERATOR';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  globalRole: GlobalRole;
  status: UserStatus;
  plan?: string;
  createdAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  defaultBusinessId?: string;
}

export interface BusinessUser {
  businessId: string;
  userId: string;
  role: BusinessRole;
}

export interface PlatformMetadata {
  userStatuses: UserStatus[];
  invitationStatuses: string[];
  businessStatuses: string[];
  globalRoles: { id: string; label: string }[];
  plans: { id: string; name: string }[];
}
