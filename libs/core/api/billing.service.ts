import { Injectable, signal, inject, computed } from '@angular/core';
import { BillingApiService } from './billing.api.service';
import { SessionService } from '@core/session/session.service';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private api = inject(BillingApiService);
  private session = inject(SessionService);

  // States
  currentSubscription = signal<any>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed
  planId = computed(() => this.currentSubscription()?.plan || 'FREE');

  async loadSubscription() {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) return;

    this.loading.set(true);
    try {
      const data = await this.api.getSubscription(businessId);
      this.currentSubscription.set(data);
    } catch (e: any) {
      this.error.set('Error al cargar la información de facturación');
    } finally {
      this.loading.set(false);
    }
  }

  async startCheckout(plan: string, price: number, description: string) {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) return;

    this.loading.set(true);
    try {
      // 1. Preflight
      const check = await this.api.preflight(businessId, plan);
      if (!check.isAllowed) {
        throw new Error(`No puedes cambiar al plan ${plan}: ${check.violations.join(', ')}`);
      }

      // 2. Create MP Preference
      const { initPoint } = await this.api.createCheckout(businessId, plan, price, description);
      
      // 3. Redirect to Mercado Pago
      window.location.href = initPoint;
    } catch (e: any) {
      this.error.set(e.message || 'Error al iniciar el proceso de pago');
      throw e;
    } finally {
      this.loading.set(false);
    }
  }
}
