import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const session = authService.session();
  const token = session?.access_token;

  let request = req;
  
  if (token) {
    request = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expiado o inválido. 
        // Importante: No forzar logout si ya estamos en la página de login para evitar bucles.
        if (!router.url.includes('/login')) {
          authService.logout().then(() => {
            router.navigate(['/login']);
          });
        }
      }
      return throwError(() => error);
    })
  );
};
