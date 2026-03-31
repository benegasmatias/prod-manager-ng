import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_ENDPOINTS } from '@shared/config/api-endpoints.config';

export interface ReportsSummary {
  summary: {
    pendingOrders: number;
    activeJobs: number;
    monthlyTotal: number;
    averageMargin: number;
  };
  charts: {
    salesByMonth: { name: string; total: number }[];
    productUsage: { name: string; value: number }[];
  };
  printerStats: {
    name: string;
    jobsDone: number;
    efficiency: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportsApiService {
  private http = inject(HttpClient);

  async getSummary(businessId: string): Promise<ReportsSummary> {
    const params = new HttpParams().set('businessId', businessId);
    return firstValueFrom(this.http.get<ReportsSummary>(API_ENDPOINTS.REPORTS.SUMMARY, { params }));
  }
}
