import { Injectable, signal, inject, computed } from '@angular/core';
import { BillingApiService } from './billing.api.service';
import { SessionService } from '@core/session/session.service';
import { environment } from '../../../src/environments/environment';

declare var MercadoPago: any;

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private api = inject(BillingApiService);
  private session = inject(SessionService);
  private mp: any;

  // States
  currentSubscription = signal<any>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed
  planId = computed(() => this.currentSubscription()?.plan?.id || 'free-3d');

  constructor() {
    // Inicializar Mercado Pago si el SDK está cargado
    // Nota: Reemplazar 'YOUR_PUBLIC_KEY' con la key real
    if (typeof MercadoPago !== 'undefined') {
      this.mp = new MercadoPago(environment.mpPublicKey || 'TEST-4806384774334416-081118-ee7378f294423fc65bd7b38266f4b109-278341531'); 
    }
  }

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

  async startCheckout(plan: string, price: number, description: string, email: string) {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) return;

    // 0. Ensure MP is initialized (if script loaded late)
    if (!this.mp && typeof MercadoPago !== 'undefined') {
      this.mp = new MercadoPago(environment.mpPublicKey);
    }

    this.loading.set(true);
    try {
      // 1. Preflight
      const check = await this.api.preflight(businessId, plan);
      if (!check.isAllowed) {
        throw new Error(`No puedes cambiar al plan ${plan}: ${check.violations.join(', ')}`);
      }

      // 2. Create MP Preference (passing email and ensuring numeric price)
      const { preferenceId } = await this.api.createCheckout(businessId, plan, Number(price), description, email);
      
      // 3. Open Modal if SDK is available
      if (this.mp) {
        const bricksBuilder = this.mp.bricks();
        this.mp.checkout({
          preference: {
            id: preferenceId
          },
          autoOpen: true,
        });
      } else {
        // Fallback: Redirect if no SDK
        const { initPoint } = await this.api.createCheckout(businessId, plan, Number(price), description, email);
        window.location.href = initPoint;
      }
    } catch (e: any) {
      this.error.set(e.message || 'Error al iniciar el proceso de pago');
      throw e;
    } finally {
      this.loading.set(false);
    }
  }
}
