import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AccessControlService } from './access-control.service';
import { FeatureCode, PermissionAction } from '../../shared/models/access-control';

/**
 * Guard to prevent access to features not supported by the business 
 * or not allowed for the user role.
 * 
 * Usage in routes:
 * {
 *   path: 'pedidos',
 *   component: OrdersComponent,
 *   canActivate: [featureGuard('ORDERS', 'VIEW')]
 * }
 */
export const featureGuard = (feature: FeatureCode, permission: PermissionAction = 'VIEW'): CanActivateFn => {
  return (route: ActivatedRouteSnapshot) => {
    const accessService = inject(AccessControlService);
    const router = inject(Router);

    if (accessService.hasPermission(feature, permission)) {
      return true;
    }

    // Redirect to dashboard if no access
    return router.parseUrl('/dashboard');
  };
};
