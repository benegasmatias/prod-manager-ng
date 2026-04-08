import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface InvitationCheckResult {
  email: string;
  userExists: boolean;
  alreadyMember: boolean;
  pendingInvitation: boolean;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ResendResult {
  message: string;
  resendCount: number;
  nextResendAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvitationsService {
  private api = inject(ApiService);

  async checkEmail(businessId: string, email: string): Promise<InvitationCheckResult> {
    return this.api.post<InvitationCheckResult>(`/businesses/${businessId}/invitations/check-email`, { email });
  }

  async invite(businessId: string, email: string, role: string) {
    return this.api.post(`/businesses/${businessId}/invitations`, { email, role });
  }

  async resend(businessId: string, invitationId: string): Promise<ResendResult> {
    return this.api.post<ResendResult>(`/businesses/${businessId}/invitations/${invitationId}/resend`, {});
  }

  async cancel(businessId: string, invitationId: string) {
    return this.api.delete(`/businesses/${businessId}/invitations/${invitationId}`);
  }

  getInvitations(businessId: string) {
    return this.api.get<any[]>(`/businesses/${businessId}/invitations`);
  }

  async getMyInvitations() {
    return this.api.get<any[]>(`/business-invitations/me`);
  }

  async getInfo(token: string) {
    return this.api.get<any>(`/business-invitations/by-token/${token}`);
  }

  async accept(token: string) {
    return this.api.post(`/business-invitations/${token}/accept`, {});
  }

  async reject(token: string) {
    return this.api.post(`/business-invitations/${token}/reject`, {});
  }
}
