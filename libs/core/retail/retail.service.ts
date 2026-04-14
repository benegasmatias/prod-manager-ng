import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../src/environments/environment';
import { SessionService } from '../session/session.service';
import { 
  CashDrawer, 
  CashMovement, 
  RetailProduct, 
  Sale, 
  CashMovementType, 
  RetailStockMovementType 
} from '@shared/models/retail/retail.models';

@Injectable({
  providedIn: 'root'
})
export class RetailService {
  private http = inject(HttpClient);
  private session = inject(SessionService);
  private readonly apiUrl = environment.apiUrl;

  // State
  currentDrawer = signal<CashDrawer | null>(null);

  async getCurrentDrawer() {
    const businessId = this.session.activeId();
    if (!businessId) return null;
    
    const drawer = await firstValueFrom(
      this.http.get<CashDrawer>(`${this.apiUrl}/retail/drawer/current/${businessId}`)
    );
    this.currentDrawer.set(drawer);
    return drawer;
  }

  async openDrawer(openingBalance: number) {
    const businessId = this.session.activeId();
    const res = await firstValueFrom(
      this.http.post<CashDrawer>(`${this.apiUrl}/retail/drawer/open/${businessId}`, { openingBalance })
    );
    this.currentDrawer.set(res);
    return res;
  }

  async closeDrawer() {
    const businessId = this.session.activeId();
    const res = await firstValueFrom(
      this.http.post<CashDrawer>(`${this.apiUrl}/retail/drawer/close/${businessId}`, {})
    );
    this.currentDrawer.set(null);
    return res;
  }

  async addManualMovement(amount: number, type: CashMovementType, note?: string) {
    const businessId = this.session.activeId();
    return firstValueFrom(
      this.http.post<CashMovement>(`${this.apiUrl}/retail/drawer/movement/${businessId}`, { amount, type, note })
    );
  }

  // Inventory
  async getProducts() {
    const businessId = this.session.activeId();
    return firstValueFrom(
      this.http.get<RetailProduct[]>(`${this.apiUrl}/retail/products/${businessId}`)
    );
  }

  async createProduct(dto: Partial<RetailProduct>) {
    const businessId = this.session.activeId();
    return firstValueFrom(
      this.http.post<RetailProduct>(`${this.apiUrl}/retail/products/${businessId}`, dto)
    );
  }

  async adjustStock(productId: string, amount: number, type: RetailStockMovementType, note?: string) {
    const businessId = this.session.activeId();
    return firstValueFrom(
      this.http.post<any>(`${this.apiUrl}/retail/stock/adjust/${businessId}/${productId}`, { amount, type, note })
    );
  }

  // Sales
  async processSale(items: { productId: string, quantity: number }[], paymentMethod: string = 'CASH') {
    const businessId = this.session.activeId();
    return firstValueFrom(
      this.http.post<Sale>(`${this.apiUrl}/retail/sales/${businessId}`, { items, paymentMethod })
    );
  }

  // Reports
  async getDailySummary(startDate?: string, endDate?: string) {
    const businessId = this.session.activeId();
    let url = `${this.apiUrl}/retail/reports/${businessId}/daily-summary`;
    if (startDate && endDate) url += `?startDate=${startDate}&endDate=${endDate}`;
    
    return firstValueFrom(this.http.get<any>(url));
  }

  async getTopProducts(limit: number = 5) {
    const businessId = this.session.activeId();
    return firstValueFrom(
      this.http.get<any[]>(`${this.apiUrl}/retail/reports/${businessId}/top-products?limit=${limit}`)
    );
  }

  async getLowStock() {
    const businessId = this.session.activeId();
    return firstValueFrom(
      this.http.get<RetailProduct[]>(`${this.apiUrl}/retail/reports/${businessId}/low-stock`)
    );
  }

  async getMovements(drawerId?: string) {
    const businessId = this.session.activeId();
    const url = drawerId 
        ? `${this.apiUrl}/retail/reports/${businessId}/movements?drawerId=${drawerId}`
        : `${this.apiUrl}/retail/reports/${businessId}/movements`;
    return firstValueFrom(this.http.get<any[]>(url));
  }
}
