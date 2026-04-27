import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BillingApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/businesses`;
  private publicApiUrl = `${environment.apiUrl}/plans`;

  /**
   * Obtiene los planes disponibles, opcionalmente filtrados por rubro/categoría.
   */
  getPlans(category?: string) {
    let params: any = {};
    if (category) params.category = category;
    return firstValueFrom(this.http.get<any[]>(this.publicApiUrl, { params }));
  }

  /**
   * Obtiene la información actual de la suscripción y uso del negocio.
   */
  getSubscription(businessId: string) {
    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/${businessId}/subscription`));
  }

  /**
   * Genera una preferencia de Mercado Pago para un plan específico.
   */
  createCheckout(businessId: string, plan: string, price: number, description: string, email: string) {
    return firstValueFrom(this.http.post<any>(`${this.apiUrl}/${businessId}/subscription/checkout`, {
      plan,
      price,
      description,
      email
    }));
  }

  /**
   * Ejecuta el preflight check para validar si el negocio puede cambiar al plan destino.
   */
  preflight(businessId: string, plan: string) {
    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/${businessId}/subscription/preflight`, {
        params: { plan }
    }));
  }
}
