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
      this.mp = new MercadoPago(environment.mpPublicKey); 
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

  async getPreferenceId(plan: string, price: number, description: string, email: string): Promise<string> {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) throw new Error('Business no seleccionado');

    this.loading.set(true);
    try {
      // 1. Preflight
      const check = await this.api.preflight(businessId, plan);
      if (!check.isAllowed) {
        throw new Error(`No puedes cambiar al plan ${plan}: ${check.violations.join(', ')}`);
      }

      // 2. Create MP Preference
      const { preferenceId } = await this.api.createCheckout(businessId, plan, Number(price), description, email);
      return preferenceId;
    } catch (e: any) {
      this.error.set(e.message || 'Error al iniciar el proceso de pago');
      throw e;
    } finally {
      this.loading.set(false);
    }
  }

  async renderWalletBrick(containerId: string, preferenceId: string) {
    if (!this.mp && typeof MercadoPago !== 'undefined') {
      this.mp = new MercadoPago(environment.mpPublicKey);
    }
    
    if (this.mp) {
      try {
        const bricksBuilder = this.mp.bricks();
        await bricksBuilder.create("wallet", containerId, {
          initialization: {
            preferenceId: preferenceId,
          },
          customization: {
            texts: {
              valueProp: 'security_safety'
            },
            visual: {
              buttonBackground: 'black',
              borderRadius: '24px'
            }
          }
        });
      } catch (e: any) {
         console.error('Error rendering wallet brick:', e);
         this.error.set('Error al cargar la pasarela de pagos.');
      }
    } else {
      this.error.set('El SDK de MercadoPago no está disponible');
    }
  }
}
