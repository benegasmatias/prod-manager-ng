import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../src/environments/environment';

/**
 * Interceptor que añade automáticamente la URL base de la API a todas las peticiones
 * que sean relativas (que empiecen por '/').
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = environment.apiUrl;

  if (req.url.startsWith('/') && !req.url.startsWith('http')) {
    const apiReq = req.clone({
      url: `${apiUrl}${req.url}`
    });
    return next(apiReq);
  }

  return next(req);
};
