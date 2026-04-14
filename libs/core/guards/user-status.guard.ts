import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SessionService } from '../session/session.service';

/**
 * Guard to redirect PENDING users to the waiting room.
 */
export const userStatusGuard: CanActivateFn = async (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  // Ensure session is initialized
  await sessionService.waitUntilInitialized();

  const user = sessionService.user();
  
  if (!user) {
    return router.createUrlTree(['/login']);
  }

  if (user.status === 'BLOCKED') {
    return router.createUrlTree(['/login'], { queryParams: { error: 'ACCOUNT_BLOCKED' } });
  }

  if (user.status === 'PENDING') {
    // If user is pending, they can only access the waiting-room
    if (state.url === '/waiting-room') {
      return true;
    }
    return router.createUrlTree(['/waiting-room']);
  }

  // If user is active and trying to go to waiting-room, redirect to dashboard
  if (user.status === 'ACTIVE' && state.url === '/waiting-room') {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};

/**
 * Super Admin Guard (canMatch) to prevent non-admins from hitting the platform admin bundle.
 */
export const superAdminGuard: CanActivateFn = async (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  await sessionService.waitUntilInitialized();

  const user = sessionService.user();
  
  if (user?.globalRole === 'SUPER_ADMIN') {
    return true;
  }

  // Technically canMatch will just move to the next route or 404/redirect if it fails.
  // We'll return false here to satisfy the protection requirement.
  return false;
};
