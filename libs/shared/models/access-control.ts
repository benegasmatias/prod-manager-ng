import { Rubro } from './negocio';

/**
 * All possible capabilities/modules in the system.
 * This represents the "What" can be done.
 */
export type FeatureCode =
  | 'DASHBOARD'
  | 'CLIENTS'
  | 'ORDERS'
  | 'ORDERS_PRODUCTION'
  | 'VISITS'
  | 'QUOTES'
  | 'PRINT_QUEUE'
  | 'MATERIALS'
  | 'STOCK'
  | 'MACHINERY'
  | 'TEAM'
  | 'REPORTS'
  | 'SETTINGS'
  | 'CALENDAR'
  | 'PAYMENTS';

/**
 * Specific permissions for user authorization.
 * This represents the "Who" can do what.
 */
export type PermissionAction =
  | 'VIEW'
  | 'CREATE'
  | 'EDIT'
  | 'DELETE'
  | 'MANAGE';

/**
 * User roles in the system.
 */
export type UserRole =
  | 'OWNER'
  | 'ADMIN'
  | 'EMPLOYEE'
  | 'SALES';

/**
 * Configuration that links a Business Type (Rubro) to its supported features.
 */
export interface BusinessFeatureConfig {
  features: FeatureCode[];
  defaultPath: string;
}

/**
 * Configuration that links a Role to its permissions per feature.
 */
export type RolePermissionsConfig = Record<UserRole, Partial<Record<FeatureCode, PermissionAction[]>>>;

/**
 * Metadata for menu items to handle conditional rendering.
 */
export interface MenuItemMetadata {
  label: string;
  href: string;
  icon: any; // Type depends on the icon library (e.g., Lucide)
  requiredFeature?: FeatureCode;
  requiredPermission?: PermissionAction;
  shortcut?: string;
  configKey?: string; // Links to business-specific label overrides
}

export interface MenuGroupMetadata {
  title: string;
  items: MenuItemMetadata[];
}
