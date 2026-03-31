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
    LIST: '/printers/list',
    ONE: (id: string) => `/printers/${id}`,
    CREATE: '/printers',
    UPDATE: (id: string) => `/printers/${id}`,
    REMOVE: (id: string) => `/printers/${id}`,
    ASSIGN: (id: string) => `/printers/${id}/assign`,
    RELEASE: (id: string) => `/printers/${id}/release`
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
    ME: '/users/me',
    SET_DEFAULT_BUSINESS: '/users/set-default-business'
  },
  NOTIFICATIONS: {
    LIST: (businessId?: string) => `/notifications${businessId ? `?businessId=${businessId}` : ''}`,
    READ: (id: string) => `/notifications/${id}/read`,
    READ_ALL: '/notifications/read-all',
    REMOVE: (id: string) => `/notifications/${id}`,
    REMOVE_ALL: '/notifications/all'
  }
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
