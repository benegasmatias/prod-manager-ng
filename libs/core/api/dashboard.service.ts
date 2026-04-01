import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { SessionService } from '../session/session.service';
import { DashboardSummary, Rubro } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private api = inject(ApiService);
  private session = inject(SessionService);

  private _summary = signal<DashboardSummary | null>(null);
  summary = computed(() => this._summary());

  private _loading = signal(false);
  loading = computed(() => this._loading());

  private _error = signal<string | null>(null);
  error = computed(() => this._error());

  /**
   * Refreshes dashboard data. 
   * Uses simple caching to avoid multiple calls on route navigation
   * unless 'force' is passed or business context changed.
   */
  async refresh(force = false) {
    // If not forced and we already have data, skip
    if (!force && this._summary()) return;

    const businessId = this.session.activeId();
    if (!businessId) return;

    this._loading.set(true);
    this._error.set(null);

    try {
      const data = await this.api.businesses.getDashboardSummary(businessId);
      const rubro = this.session.rubro();
      
      // Ensure the summary has a normalized structure based on what backend returns
      this._summary.set(this.normalizeData(data));
    } catch (err: any) {
      console.error('[DashboardService] Error fetching summary:', err);
      this._error.set(err.message || 'Error al cargar dashboard');
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Normalizes backend response to ensure no missing properties in the UI.
   * No hardcoded mocks are added here unless requested by the user for skeletal purposes.
   */
  private normalizeData(data: any): DashboardSummary {
    const alerts = (data?.alerts ?? []).map((a: any) => {
      let searchQuery = null;
      if (!a.orderId && a.message?.includes('ORD-')) {
        const match = a.message.match(/ORD-[A-Z0-9-]+/i);
        if (match) searchQuery = match[0];
      }

      return {
        ...a,
        searchQuery
      };
    });

    return {
      totalSales: data?.totalSales ?? 0,
      pendingBalance: data?.pendingBalance ?? 0,
      activeOrders: data?.activeOrders ?? 0,
      productionOrders: data?.productionOrders ?? 0,
      activeMachines: data?.activeMachines ?? 0,
      newCustomers: data?.newCustomers ?? 0,
      alerts,
      recentOrders: data?.recentOrders ?? [],
      trends: data?.trends ?? null,
      kpis: data?.kpis ?? []
    };
  }

  /** Clears the current summary (on logout or business switch) */
  clear() {
    this._summary.set(null);
  }
}
