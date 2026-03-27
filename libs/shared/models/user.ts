export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  defaultBusinessId?: string;
}

export interface BusinessUser {
  businessId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}
