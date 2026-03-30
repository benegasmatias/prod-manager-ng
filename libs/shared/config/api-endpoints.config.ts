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
    LIST: '/employees'
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
  }
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
