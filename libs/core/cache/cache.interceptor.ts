import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { of, tap } from 'rxjs';
import { CacheService } from './cache.service';
import { HTTP_CACHE_CONFIG } from './cache.context';
import { BusinessContextService } from '../session/business-context.service';

/**
 * Interceptor de Caché para Angular 21 (Functional Interceptor)
 * Utiliza BusinessContextService (atómico) para evitar dependencias circulares.
 */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cache = inject(CacheService);
  const injector = inject(Injector);

  /**
   * Obtiene el ID del negocio del contexto atómico. 
   * Usamos Injector para mayor seguridad durante el arranque.
   */
  const getBusinessId = (): string => {
    try {
      const context = injector.get(BusinessContextService);
      return context.activeId() || 'global';
    } catch {
      return 'global';
    }
  };

  // --- Lógica de Invalidación Automática (Write-Through) ---
  if (req.method !== 'GET') {
    return next(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse && event.status >= 200 && event.status < 300) {
          const bId = getBusinessId();
          const urlBase = req.url.split('?')[0]; 
          cache.invalidateByPrefix(`::${bId}::${urlBase}`);
        }
      })
    );
  }

  const config = req.context.get(HTTP_CACHE_CONFIG);
  if (!config.enabled) return next(req);

  const bId = getBusinessId();
  const cacheKey = cache.createKey(req.method, req.urlWithParams, bId);
  const cachedResponse = cache.get(cacheKey);

  if (cachedResponse && !config.forceRefresh) {
    return of(cachedResponse.clone());
  }

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        cache.put(cacheKey, event, config.ttl || 300000);
      }
    })
  );
};
