import { Rubro, FeatureCode, UserRole, BusinessFeatureConfig, RolePermissionsConfig } from '../models';

/**
 * Feature mapping per Business Type (Rubro).
 * This ensures no hardcoded "if businessType === IMPRESION_3D" in components.
 */
export const BUSINESS_FEATURES: Record<Rubro, BusinessFeatureConfig> = {
  IMPRESION_3D: {
    features: ['DASHBOARD', 'CLIENTS', 'ORDERS', 'MATERIALS', 'STOCK', 'CALENDAR', 'MACHINERY', 'TEAM', 'REPORTS', 'SETTINGS'],
    defaultPath: '/dashboard'
  },
  METALURGICA: {
    features: ['DASHBOARD', 'CLIENTS', 'VISITS', 'QUOTES', 'ORDERS', 'ORDERS_PRODUCTION', 'STOCK', 'MACHINERY', 'TEAM', 'REPORTS', 'SETTINGS'],
    defaultPath: '/dashboard'
  },
  CARPINTERIA: {
    features: ['DASHBOARD', 'CLIENTS', 'QUOTES', 'ORDERS', 'ORDERS_PRODUCTION', 'STOCK', 'TEAM', 'REPORTS', 'SETTINGS'],
    defaultPath: '/dashboard'
  },
  GENERICO: {
    features: ['DASHBOARD', 'CLIENTS', 'ORDERS', 'ORDERS_PRODUCTION', 'STOCK', 'REPORTS', 'SETTINGS'],
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
    ORDERS_PRODUCTION: ['VIEW', 'MANAGE'],
    CALENDAR: ['VIEW', 'MANAGE'],
    MATERIALS: ['VIEW', 'MANAGE'],
    MACHINERY: ['VIEW', 'MANAGE'],
    TEAM: ['VIEW', 'MANAGE']
  },
  BUSINESS_ADMIN: {
    DASHBOARD: ['VIEW'],
    CLIENTS: ['VIEW', 'CREATE', 'EDIT'],
    ORDERS: ['VIEW', 'CREATE', 'EDIT'],
    STOCK: ['VIEW', 'EDIT'],
    SETTINGS: ['VIEW'],
    REPORTS: ['VIEW'],
    ORDERS_PRODUCTION: ['VIEW', 'EDIT'],
    CALENDAR: ['VIEW', 'EDIT'],
    TEAM: ['VIEW', 'MANAGE']
  },
  OPERATOR: {
    DASHBOARD: ['VIEW'],
    ORDERS: ['VIEW', 'EDIT'],
    ORDERS_PRODUCTION: ['VIEW', 'EDIT'],
    CALENDAR: ['VIEW', 'EDIT'],
    STOCK: ['VIEW']
  },
  SALES: {
    DASHBOARD: ['VIEW'],
    CLIENTS: ['VIEW', 'CREATE'],
    QUOTES: ['VIEW', 'CREATE'],
    ORDERS: ['VIEW', 'CREATE'],
    CALENDAR: ['VIEW', 'EDIT'],
    REPORTS: ['VIEW']
  },
  VIEWER: {
    DASHBOARD: ['VIEW'],
    ORDERS: ['VIEW'],
    STOCK: ['VIEW'],
    CALENDAR: ['VIEW'],
  }
};
