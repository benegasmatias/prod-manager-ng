import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guard for protected routes. 
 * Redirects to login if the user is not authenticated.
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if session exists (using signal is fast, but let's be sure with getSession if it's currently loading)
  if (authService.loading()) {
    // Wait for session check to complete
    const { data: { session } } = await authService.getSession();
    if (session) return true;
  }

  if (authService.user()) {
    return true;
  }

  // Redirect to login with current URL as returnUrl
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/**
 * Guard for public routes (login, register).
 * Redirects to dashboard if the user is already authenticated.
 */
export const publicGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.loading()) {
    const { data: { session } } = await authService.getSession();
    if (session) return router.createUrlTree(['/dashboard']);
  }

  if (authService.user()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
