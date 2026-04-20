export const API_ENDPOINTS = {
  ORDERS: {
    LISTING: '/orders/listing',
    SUMMARY: '/orders/summary',
    STATUS: (id: string) => `/orders/${id}/status`,
    PAYMENTS: (id: string) => `/orders/${id}/payments`,
    REPORT_FAILURE: (id: string) => `/orders/${id}/fail`,
    ONE: (id: string) => `/orders/${id}`,
    ROOT: '/orders'
  },
  EMPLOYEES: {
    LIST: '/employees',
    CREATE: '/employees',
    UPDATE: (id: string) => `/employees/${id}`,
    REMOVE: (id: string) => `/employees/${id}`
  },
  BUSINESSES: {
    LIST: '/businesses',
    TEMPLATES: '/business-templates',
    ONE: (id: string) => `/businesses/${id}`,
    CONFIG: (id: string) => `/businesses/${id}/config`,
    DASHBOARD: (id: string) => `/businesses/${id}/dashboard-summary`
  },
  CUSTOMERS: {
    LIST: '/customers',
    ONE: (id: string) => `/customers/${id}`
  },
  MATERIALS: {
    LIST: '/materials',
    ONE: (id: string) => `/materials/${id}`
  },
  MACHINES: {
    LIST: '/machines',
    ONE: (id: string) => `/machines/${id}`,
    CREATE: '/machines',
    UPDATE: (id: string) => `/machines/${id}`,
    REMOVE: (id: string) => `/machines/${id}`,
    ASSIGN: (id: string) => `/machines/${id}/assign-order`,
    RELEASE: (id: string) => `/machines/${id}/release`
  },
  REPORTS: {
    SUMMARY: '/reports/summary'
  },
  STOCK: {
    LIST: '/stock',
    SALE: '/stock/sale',
    ONE: (id: string) => `/stock/${id}`
  },
  USERS: {
    ME: '/me',
    SET_DEFAULT_BUSINESS: '/me/default-business'
  },
  NOTIFICATIONS: {
    LIST: (businessId?: string) => `/notifications${businessId ? `?businessId=${businessId}` : ''}`,
    READ: (id: string) => `/notifications/${id}/read`,
    READ_ALL: '/notifications/read-all',
    REMOVE: (id: string) => `/notifications/${id}`,
    REMOVE_ALL: '/notifications/all'
  },
  FILES: {
    UPLOAD: '/files/upload',
    DELETE: '/files/delete'
  },
  PRODUCTION: {
    LIST: '/production-jobs',
    ONE: (id: string) => `/production-jobs/${id}`,
    STATUS: (id: string) => `/production-jobs/${id}/status`,
    RESOURCES: (id: string) => `/production-jobs/${id}/resources`,
    PRIORITY: (id: string) => `/production-jobs/${id}/priority`,
    STAGE: (id: string) => `/production-jobs/${id}/stage`,
  }
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
