import { Rubro, FeatureCode, UserRole, BusinessFeatureConfig, RolePermissionsConfig } from '../models';

/**
 * Feature mapping per Business Type (Rubro).
 * This ensures no hardcoded "if businessType === IMPRESION_3D" in components.
 */
export const BUSINESS_FEATURES: Record<Rubro, BusinessFeatureConfig> = {
  IMPRESION_3D: {
    features: ['DASHBOARD', 'CLIENTS', 'ORDERS', 'MATERIALS', 'STOCK', 'MACHINERY', 'TEAM', 'REPORTS', 'SETTINGS'],
    defaultPath: '/dashboard'
  },
  METALURGICA: {
    features: ['DASHBOARD', 'CLIENTS', 'VISITS', 'QUOTES', 'ORDERS', 'STOCK', 'MACHINERY', 'TEAM', 'REPORTS', 'SETTINGS'],
    defaultPath: '/dashboard'
  },
  CARPINTERIA: {
    features: ['DASHBOARD', 'CLIENTS', 'QUOTES', 'ORDERS', 'STOCK', 'TEAM', 'REPORTS', 'SETTINGS'],
    defaultPath: '/dashboard'
  },
  GENERICO: {
    features: ['DASHBOARD', 'CLIENTS', 'ORDERS', 'STOCK', 'REPORTS', 'SETTINGS'],
    defaultPath: '/dashboard'
  }
};

/**
 * Static permissions per user role.
 * In a more complex scenario, this could come from an API, but keeping it simple for now.
 */
export const ROLE_PERMISSIONS: RolePermissionsConfig = {
  OWNER: {
    DASHBOARD: ['VIEW', 'MANAGE'],
    CLIENTS: ['VIEW', 'MANAGE'],
    ORDERS: ['VIEW', 'MANAGE'],
    PRINT_QUEUE: ['VIEW', 'MANAGE'],
    STOCK: ['VIEW', 'MANAGE'],
    SETTINGS: ['VIEW', 'MANAGE'],
    REPORTS: ['VIEW', 'MANAGE'],
    VISITS: ['VIEW', 'MANAGE'],
    QUOTES: ['VIEW', 'MANAGE'],
    MATERIALS: ['VIEW', 'MANAGE'],
    MACHINERY: ['VIEW', 'MANAGE'],
    TEAM: ['VIEW', 'MANAGE']
  },
  ADMIN: {
    DASHBOARD: ['VIEW'],
    CLIENTS: ['VIEW', 'CREATE', 'EDIT'],
    ORDERS: ['VIEW', 'CREATE', 'EDIT'],
    STOCK: ['VIEW', 'EDIT'],
    SETTINGS: ['VIEW'],
    REPORTS: ['VIEW']
  },
  EMPLOYEE: {
    DASHBOARD: ['VIEW'],
    ORDERS: ['VIEW', 'EDIT'],
    PRINT_QUEUE: ['VIEW', 'EDIT'],
    STOCK: ['VIEW']
  },
  SALES: {
    DASHBOARD: ['VIEW'],
    CLIENTS: ['VIEW', 'CREATE'],
    QUOTES: ['VIEW', 'CREATE'],
    ORDERS: ['VIEW', 'CREATE'],
    REPORTS: ['VIEW']
  }
};
