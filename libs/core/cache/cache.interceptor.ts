import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, tap } from 'rxjs';
import { CacheService } from './cache.service';
import { HTTP_CACHE_CONFIG } from './cache.context';

/**
 * Interceptor de Caché para Angular 21 (Functional Interceptor)
 * Gestiona el almacenamiento de GETs y la invalidación reactiva de mutaciones.
 */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cache = inject(CacheService);

  // --- Lógica de Invalidación Automática (Write-Through) ---
  // Si no es un GET, probablemente estamos mutando datos.
  // Invalidamos el cache de ese recurso para forzar recarga en la siguiente navegación.
  if (req.method !== 'GET') {
    return next(req).pipe(
      tap(event => {
        // Solo invalidamos si la petición fue exitosa (2xx)
        if (event instanceof HttpResponse && event.status >= 200 && event.status < 300) {
          // Extraemos la base de la URL limpia sin parámetros de búsqueda
          const urlBase = req.url.split('?')[0]; 
          cache.invalidateByPrefix(urlBase);
        }
      })
    );
  }

  const config = req.context.get(HTTP_CACHE_CONFIG);

  // Si no está habilitado explícitamente, pasamos de largo
  if (!config.enabled) {
    return next(req);
  }

  const cacheKey = cache.createKey(req.method, req.urlWithParams);
  const cachedResponse = cache.get(cacheKey);

  // Si hay hit y no forzamos refresco, devolvemos el cache instantáneamente
  if (cachedResponse && !config.forceRefresh) {
    return of(cachedResponse);
  }

  // Si no hay cache, procesamos y guardamos el resultado
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        cache.put(cacheKey, event, config.ttl || 300000);
      }
    })
  );
};
