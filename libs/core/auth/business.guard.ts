import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SessionService } from '../session/session.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

/**
 * Guard that ensures a business is selected before accessing protected features.
 * Redirects to onboarding if no businesses exist.
 * Redirects to selector if multiple businesses exist but none are active.
 */
export const businessGuard: CanActivateFn = (route, state) => {
  const session = inject(SessionService);
  const router = inject(Router);

  // If session is already initialized, check directly
  if (session.isInitialized()) {
    console.log('[BusinessGuard] Initialized, checking state...');
    return checkBusinessState(session, router);
  }

  // Otherwise, wait for initialization
  console.log('[BusinessGuard] Waiting for initialization...');
  return toObservable(session.isInitialized).pipe(
    filter(initialized => initialized),
    take(1),
    map(() => checkBusinessState(session, router))
  );
};

function checkBusinessState(session: SessionService, router: Router) {
  const businesses = session.negocios();
  const activeNegocio = session.activeNegocio();
  const activeId = session.activeId();
  const user = session.user();

  console.log('[BusinessGuard] State:', { businesses: businesses.length, activeId });

  // 1. No businesses -> Onboarding
  if (businesses.length === 0) {
    console.log('[BusinessGuard] No businesses, redirecting to select-business');
    return router.createUrlTree(['/select-business']);
  }

  // 2. Expiration / Suspension Check
  if (activeNegocio && user?.globalRole !== 'SUPER_ADMIN') {
    const isSuspended = activeNegocio.status === 'SUSPENDED';
    let isExpired = false;

    if (activeNegocio.subscriptionExpiresAt) {
      const now = new Date();
      const expiry = new Date(activeNegocio.subscriptionExpiresAt);
      isExpired = expiry < now;
    }

    if (isSuspended || isExpired) {
      console.log('[BusinessGuard] Business is suspended or expired, redirecting');
      return router.createUrlTree(['/subscription-expired']);
    }
  }

  // 3. Active business selected -> Proceed
  if (activeId) {
    console.log('[BusinessGuard] Business active, proceed');
    return true;
  }

  // 4. More than one business but none selected -> Selector
  if (businesses.length > 1) {
    console.log('[BusinessGuard] Multiple businesses, no active, redirecting to select-business');
    return router.createUrlTree(['/select-business']);
  }

  return true;
}
