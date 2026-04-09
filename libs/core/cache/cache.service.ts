import { Injectable, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { SessionService } from '../session/session.service';

interface CacheEntry {
  response: HttpResponse<unknown>;
  expiry: number;
}

@Injectable({ providedIn: 'root' })
export class CacheService {
  private session = inject(SessionService);
  private cache = new Map<string, CacheEntry>();
  private readonly MAX_ITEMS = 100; // Límite para evitar memory leaks

  /**
   * Genera una clave robusta para multi-tenant
   * Formato: [METODO]::BUSINESS_ID::full_url_con_params
   */
  createKey(method: string, url: string): string {
    const businessId = this.session.activeId() || 'global';
    return `[${method}]::${businessId}::${url}`;
  }

  get(key: string): HttpResponse<unknown> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Estrategia LRU: Reordenar el Map moviendo el item al final (más reciente)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.response;
  }

  put(key: string, response: HttpResponse<unknown>, ttl: number): void {
    // Si llegamos al límite, eliminamos el primero (FIFO en el Map es el LRU si reordenamos en cada get)
    if (this.cache.size >= this.MAX_ITEMS) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      response,
      expiry: Date.now() + ttl
    });
  }

  /**
   * Invalida todas las entradas que contengan la URL base del recurso.
   * Útil para limpiar la lista desactualizada tras un POST/PUT/DELETE
   */
  invalidateByPrefix(urlPart: string): void {
    const businessId = this.session.activeId() || 'global';
    const pattern = `::${businessId}::${urlPart}`;
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  invalidateBusinessCache(businessId?: string): void {
    const bId = businessId || this.session.activeId();
    const prefix = `::${bId}::`;
    for (const key of this.cache.keys()) {
      if (key.includes(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  clearAll(): void {
    this.cache.clear();
  }
}
