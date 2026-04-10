import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams, HttpContext } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Cliente } from '../models/cliente.model';
import { environment } from '../../../src/environments/environment';
import { HTTP_CACHE_CONFIG } from '../cache/cache.context';

export interface PaginatedClientesResponse {
  items: Cliente[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/customers`;

  // Reactive state management using Signals
  private _clientes = signal<Cliente[]>([]);
  public clientes = this._clientes.asReadonly();
  
  private _total = signal<number>(0);
  public total = this._total.asReadonly();
  
  private _loading = signal<boolean>(false);
  public loading = this._loading.asReadonly();

  loadClientes(businessId: string, search: string = '', page: number = 1, limit: number = 10, force = false): void {
    if (!businessId) return;
    
    // Pattern Senior: Solo mostramos loading global si no hay datos previos (Evita parpadeos)
    if (this._clientes().length === 0) {
      this._loading.set(true);
    }

    let params = new HttpParams()
      .set('businessId', businessId)
      .set('page', page.toString())
      .set('limit', limit.toString());
      
    if (search) {
      params = params.set('q', search);
    }

    const context = new HttpContext().set(HTTP_CACHE_CONFIG, {
      enabled: true,
      ttl: 600000, // 10 minutos para clientes (es una lista poco volátil)
      forceRefresh: force
    });

    this.http.get<PaginatedClientesResponse>(this.apiUrl, { params, context }).pipe(
      tap(res => {
        this._clientes.set(res.items || []);
        this._total.set(res.total || 0);
      })
    ).subscribe({
      next: () => this._loading.set(false),
      error: (err) => {
        console.error('Error loading clientes', err);
        this._loading.set(false);
      }
    });
  }

  getById(id: string): Observable<Cliente> {
    const context = new HttpContext().set(HTTP_CACHE_CONFIG, { enabled: true, ttl: 300000 });
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`, { context });
  }

  create(businessId: string, data: Partial<Cliente>): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, { ...data, businessId });
  }

  update(id: string, data: Partial<Cliente>): Observable<Cliente> {
    return this.http.patch<Cliente>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Pure function for stats calculating logic based on current list
  calculateStats(clientes: Cliente[], totalRegistrosServidor: number) {
    // Total is now what the server claims to be the total match, not just what's in this page
    const total = totalRegistrosServidor; 
    
    // WIP: Ideally these are aggregated by the server, but for now we calculate what's visible 
    // or keep them simple since we migrated exactly from frontend logic.
    const vip = clientes.filter(c => (c.totalOrders || 0) > 5).length;
    
    const now = new Date();
    const nuevosMes = clientes.filter(c => {
      if (!c.createdAt) return false;
      const d = new Date(c.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    return { total, vip, nuevosMes };
  }
}
