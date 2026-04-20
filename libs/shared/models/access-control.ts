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
  | 'PAYMENTS'
  | 'FINANCES';

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
  | 'BUSINESS_ADMIN'
  | 'SALES'
  | 'OPERATOR'
  | 'VIEWER';

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
  icon: any; 
  requiredGlobalRole?: 'SUPER_ADMIN' | 'USER'; 
  shortcut?: string;
  configKey?: string; 
}

export interface MenuGroupMetadata {
  title: string;
  items: MenuItemMetadata[];
}
