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
   * Prioritizes granular capabilities stored in the DB over static rubric mappings.
   */
  isFeatureEnabled(feature: FeatureCode): boolean {
    // Universal features that are always enabled for everyone
    if (feature === 'DASHBOARD' || feature === 'SETTINGS') return true;

    // Capability Mapping (Internal fallback if not explicitly defined in MenuItem)
    const FEATURE_CAPS: Record<string, string[]> = {
      CLIENTS: ['SALES_MANAGEMENT', 'SALES_BASIC'],
      ORDERS: ['SALES_MANAGEMENT', 'SALES_BASIC', 'INVENTORY_RETAIL'],
      ORDERS_PRODUCTION: ['PRODUCTION_MANAGEMENT'],
      VISITS: ['VISITS_MANAGEMENT'],
      QUOTES: ['SALES_QUOTES', 'SALES_MANAGEMENT'],
      PRINT_QUEUE: ['PRODUCTION_MACHINES'],
      MATERIALS: ['INVENTORY_RAW'],
      STOCK: ['INVENTORY_RAW', 'INVENTORY_RETAIL'],
      MACHINERY: ['PRODUCTION_MACHINES'],
      TEAM: ['SALES_BASIC'], 
      REPORTS: ['SALES_MANAGEMENT', 'PRODUCTION_MANAGEMENT', 'FINANCIAL_BASIC'],
      CALENDAR: ['PRODUCTION_MANAGEMENT'],
      PAYMENTS: ['SALES_BASIC', 'FINANCIAL_BASIC']
    };

    const requiredCaps = FEATURE_CAPS[feature] || [];
    if (requiredCaps.some(cap => this.sessionService.hasCapability(cap))) {
      return true;
    }

    // Fallback to legacy rubric-based mapping if no capabilities are found (for safety during migration)
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
   * Uses the dynamic config from the backend to determine visibility via href matching.
   */
  canViewMenuItem(item: MenuItemMetadata): boolean {
    const config = this.sessionService.businessConfig();
    
    // 1. Dynamic Path Gating (Root-level filter)
    if (config?.config?.sidebarItems) {
      if (!config.config.sidebarItems.includes(item.href)) {
        return false;
      }
    }

    // 2. Global Role-Based Gating (Platform Level)
    if (item.requiredGlobalRole) {
      if (this.sessionService.user()?.globalRole !== item.requiredGlobalRole) {
        return false;
      }
    }

    return true;
  }
}
