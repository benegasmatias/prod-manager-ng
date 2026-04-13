import { DashboardConfig } from '../models/dashboard.config';

export const DASHBOARD_CONFIG: Record<string, DashboardConfig> = {
  IMPRESION_3D: {
    rubro: 'IMPRESION_3D',
    category: 'Control de Producción 3D',
    title: 'Monitor de',
    titleAccent: 'Fábrica',
    description: 'Gestión integral de trabajos, máquinas y cartera de clientes en tiempo real.',
    metrics: [
      { id: 'sales', label: 'Ventas Totales', icon: 'BarChart3', color: 'indigo', dataKey: 'totalSales', unit: '$' },
      { id: 'pending', label: 'Saldo Pendiente', icon: 'Wallet', color: 'rose', dataKey: 'pendingBalance', unit: '$' },
      { id: 'active', label: 'Pedidos Activos', icon: 'LayoutGrid', color: 'primary', dataKey: 'activeOrders' },
      { id: 'production', label: 'En Producción', icon: 'Activity', color: 'emerald', dataKey: 'productionOrders' }
    ],
    quickActions: [
      { label: 'Nuevo Pedido', icon: 'Plus', url: '/pedidos/nuevo', color: 'primary' },
      { label: 'Gestionar Stock', icon: 'Layers', url: '/stock', color: 'zinc' }
    ],
    sections: [
      { title: 'Métricas', type: 'grid', widgetId: 'primary-metrics', fullWidth: true },
      { title: 'Alarmas Operativas', type: 'custom', widgetId: 'alerts-priority' },
      { title: 'Carga de Máquinas', type: 'grid', widgetId: 'secondary-metrics' },
      { title: 'Pedidos Recientes', type: 'list', widgetId: 'recent-orders', fullWidth: true }
    ],
    kpiTitles: {
      totalSales: 'Ventas Totales',
      pendingBalance: 'Saldo Pendiente',
      activeOrders: 'Pedidos Activos',
      productionOrders: 'En Producción'
    },
    statusLabels: {
      PRINTING: 'Produciendo',
      READY: 'Listo',
      PENDING: 'Pendiente',
      DELIVERED: 'Entregado'
    },
    sectionTitles: {
      printers: 'Estado de Máquinas',
      materials: 'Consumo Directo',
      financials: 'Consolidado',
      financialsNeto: 'Carga Neta',
      financialsMonthly: 'Mensual',
      alerts: 'Alertas Prioritarias',
      queue: 'Pedidos Recientes'
    }
  },
  METALURGICA: {
    rubro: 'METALURGICA',
    category: 'Ingeniería y Proyectos',
    title: 'Gestión de',
    titleAccent: 'Obras',
    description: 'Control de taller, presupuestos y planificación de instalaciones externas.',
    metrics: [
      { id: 'sales', label: 'Facturación', icon: 'BarChart3', color: 'indigo', dataKey: 'totalSales', unit: '$' },
      { id: 'pending', label: 'Saldos Obra', icon: 'Wallet', color: 'rose', dataKey: 'pendingBalance', unit: '$' },
      { id: 'active', label: 'Proyectos Activos', icon: 'LayoutGrid', color: 'primary', dataKey: 'activeOrders' }
    ],
    quickActions: [
      { label: 'Nuevo Proyecto', icon: 'Plus', url: '/pedidos/nuevo', color: 'primary' },
      { label: 'Planificar Carga', icon: 'Calendar', url: '/personal/visitas', color: 'zinc' }
    ],
    sections: [
      { title: 'Resumen Ejecutivo', type: 'custom', widgetId: 'hero-summary', fullWidth: true },
      { title: 'Métricas Principales', type: 'grid', widgetId: 'primary-metrics', fullWidth: true },
      { title: 'Pedidos Recientes', type: 'list', widgetId: 'recent-orders', fullWidth: true }
    ],
    statusLabels: {
      APPROVED: 'Aprobado',
      PENDING: 'Presupuestando',
      PRODUCTION: 'En Taller',
      INSTALLATION: 'En Obra',
      DELIVERED: 'Entregado'
    }
  },
  RETAIL_KIOSCO: {
    rubro: 'GENERICO',
    category: 'Punto de Venta / Kiosco',
    title: 'Monitor de',
    titleAccent: 'Caja',
    description: 'Control de ventas rápidas, stock de mostrador y movimientos de efectivo.',
    metrics: [
      { id: 'sales', label: 'Caja del Día', icon: 'Wallet', color: 'emerald', dataKey: 'totalSales', unit: '$' },
      { id: 'pending', label: 'Cuentas Corrientes', icon: 'Users', color: 'rose', dataKey: 'pendingBalance', unit: '$' },
      { id: 'active', label: 'Ventas Realizadas', icon: 'ShoppingCart', color: 'indigo', dataKey: 'activeOrders' }
    ],
    quickActions: [
      { label: 'Nueva Venta', icon: 'Plus', url: '/pedidos/nuevo', color: 'primary' },
      { label: 'Abrir Caja', icon: 'Unlock', url: '#', color: 'emerald' }
    ],
    sections: [
      { title: 'Resumen Diario', type: 'grid', widgetId: 'primary-metrics', fullWidth: true },
      { title: 'Ventas Recientes', type: 'list', widgetId: 'recent-orders', fullWidth: true }
    ],
    statusLabels: {
      PENDING: 'Por Cobrar',
      DONE: 'Cobrado',
      CANCELLED: 'Anulado'
    }
  }
};

export const DEFAULT_DASHBOARD: DashboardConfig = {
  rubro: 'GENERICO',
  category: 'Sistema de Gestión',
  title: 'Dashboard de',
  titleAccent: 'Control',
  description: 'Vista general del estado operativo de su negocio.',
  metrics: [
    { id: 'ventas', label: 'Ventas Totales', icon: 'BarChart3', color: 'primary', dataKey: 'totalSales', unit: '$' },
    { id: 'pedidos', label: 'Pedidos Pendientes', icon: 'Clock', color: 'orange', dataKey: 'pendingOrders' }
  ],
  quickActions: [
    { label: 'Nuevo Pedido', icon: 'Plus', url: '/pedidos/nuevo' }
  ],
  sections: [
    { title: 'Métricas', type: 'grid', widgetId: 'primary-metrics', fullWidth: true },
    { title: 'Actividad Reciente', type: 'list', widgetId: 'recent-orders', fullWidth: true }
  ],
  sectionTitles: {}
};
