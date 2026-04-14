import { Injectable, inject, computed } from '@angular/core';
import { AuthService } from './auth.service';
import { SessionService } from '../session/session.service';
import { BUSINESS_FEATURES, ROLE_PERMISSIONS } from '../../shared/config/access-control.config';
import { FeatureCode, PermissionAction, MenuItemMetadata, UserRole } from '../../shared/models/access-control';
import { Rubro } from '../../shared/models/negocio';

@Injectable({
  providedIn: 'root'
})
export class AccessControlService {
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);

  /**
   * Current business type from the session.
   */
  currentRubro = computed(() => this.sessionService.rubro());

  /**
   * Current user role from the active business session.
   * Fallback to OWNER if no business is active or perms are missing (legacy compatibility).
   */
  userRole = computed(() => {
    const activeRole = this.sessionService.activeNegocio()?.userRole as UserRole;
    return activeRole || (this.authService.user()?.user_metadata?.['role'] as UserRole) || 'OWNER';
  });

  /**
   * Check if a feature is enabled for the current business type.
   */
  isFeatureEnabled(feature: FeatureCode): boolean {
    // Universal features that are always enabled for everyone
    if (feature === 'DASHBOARD') return true;

    const rubro = this.currentRubro();
    if (!rubro) return false;
    
    return BUSINESS_FEATURES[rubro].features.includes(feature);
  }

  /**
   * Check if the current user has a specific permission on a feature.
   */
  hasPermission(feature: FeatureCode, action: PermissionAction = 'VIEW'): boolean {
    // Stage 1: Check if the business even has this feature
    if (!this.isFeatureEnabled(feature)) return false;

    // Stage 2: Check User RBAC
    const role = this.userRole();
    const rolePermissions = ROLE_PERMISSIONS[role];
    
    if (!rolePermissions) return false;

    const featurePermissions = rolePermissions[feature];
    if (!featurePermissions) return false;

    // OWNER always has all permissions if the feature exists
    if (role === 'OWNER') return true;

    return featurePermissions.includes(action) || featurePermissions.includes('MANAGE');
  }

  /**
   * Rule engine for menu item visibility.
   */
  canViewMenuItem(item: MenuItemMetadata): boolean {
    // If no specific requirement, let it be visible (unless it requires a feature that is disabled)
    if (item.requiredFeature && !this.isFeatureEnabled(item.requiredFeature)) {
      return false;
    }

    // New Capability-Based Modular Gating
    if (item.requiredCapability && !this.sessionService.hasCapability(item.requiredCapability)) {
      return false;
    }

    if (item.requiredPermission && item.requiredFeature) {
      return this.hasPermission(item.requiredFeature, item.requiredPermission);
    }

    // Default to VIEW permission if only feature is required
    if (item.requiredFeature) {
      return this.hasPermission(item.requiredFeature, 'VIEW');
    }

    return true;
  }
}
