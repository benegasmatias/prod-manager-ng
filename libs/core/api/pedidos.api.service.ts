import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Pedido, PedidosResponse, PedidoSummary, Employee } from '@shared/models';
import { API_ENDPOINTS } from '@shared/config/api-endpoints.config';

export interface ListingParams {
  businessId: string;
  status?: string;
  statuses?: string;
  excludeStatuses?: string;
  type?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  startDate?: string | Date;
  endDate?: string | Date;
  responsableId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PedidosApiService {
  private http = inject(HttpClient);

  /**
   * Obtiene el listado de pedidos para un negocio con filtros opcionales.
   */
  async getListing(params: ListingParams, context?: any): Promise<PedidosResponse> {
    let httpParams = new HttpParams()
      .set('businessId', params.businessId)
      .set('page', (params.page || 1).toString())
      .set('pageSize', (params.pageSize || 50).toString());

    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.statuses) httpParams = httpParams.set('statuses', params.statuses);
    if (params.excludeStatuses) httpParams = httpParams.set('excludeStatuses', params.excludeStatuses);
    if (params.type) httpParams = httpParams.set('type', params.type);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate.toString());
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate.toString());
      if (params.responsableId) httpParams = httpParams.set('responsableId', params.responsableId);
  
      return firstValueFrom(this.http.get<PedidosResponse>(API_ENDPOINTS.ORDERS.LISTING, { params: httpParams, context }));
    }
  
    /**
     * Obtiene el resumen de pedidos (totales, saldos, etc) para el dashboard.
     */
    async getSummary(businessId: string, context?: any): Promise<PedidoSummary> {
      const params = new HttpParams().set('businessId', businessId);
      return firstValueFrom(this.http.get<PedidoSummary>(API_ENDPOINTS.ORDERS.SUMMARY, { params, context }));
    }
  
    async getEmployees(businessId: string, activeOnly = true, context?: any): Promise<Employee[]> {
      const params = new HttpParams()
        .set('businessId', businessId)
        .set('active', activeOnly.toString());
      
      return firstValueFrom(this.http.get<Employee[]>(API_ENDPOINTS.EMPLOYEES.LIST, { params, context }));
    }
  
    /**
     * Obtiene un pedido por su ID.
     */
    async findOne(id: string, context?: any): Promise<Pedido> {
      return firstValueFrom(this.http.get<Pedido>(API_ENDPOINTS.ORDERS.ONE(id), { context }));
    }

    /**
     * Crea un nuevo pedido.
     */
    async create(data: Partial<Pedido>): Promise<Pedido> {
      return firstValueFrom(this.http.post<Pedido>(API_ENDPOINTS.ORDERS.ROOT, data));
    }
  
    /**
     * Actualiza un pedido existente.
     */
    async update(id: string, data: Partial<Pedido>): Promise<Pedido> {
      return firstValueFrom(this.http.patch<Pedido>(API_ENDPOINTS.ORDERS.STATUS(id), data));
    }
  
    /**
     * Registra un pago para un pedido.
     */
    async addPayment(orderId: string, payment: { businessId?: string; amount: number; method: string; note?: string }): Promise<Pedido> {
      return firstValueFrom(this.http.post<Pedido>(API_ENDPOINTS.ORDERS.PAYMENTS(orderId), payment));
    }

   /**
    * Reporta un fallo en un pedido (específicamente Impresión 3D o general).
    */
   async reportFailure(orderId: string, data: { 
     businessId?: string;
     reason: string; 
     action?: 'REDO' | 'DISCARD' | 'KEEP'; 
     targetStatus?: string;
     wastedGrams?: number;
     moveToReprint?: boolean;
   }): Promise<Pedido> {
     const payload = {
       ...data,
       wastedGrams: data.wastedGrams || 0,
       moveToReprint: data.moveToReprint || (data.action === 'REDO' && data.targetStatus === 'REPRINT_PENDING')
     };
     return firstValueFrom(this.http.post<Pedido>(API_ENDPOINTS.ORDERS.REPORT_FAILURE(orderId), payload));
   }
}
