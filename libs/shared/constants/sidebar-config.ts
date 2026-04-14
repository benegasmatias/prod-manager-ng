import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Wrench,
  BarChart3,
  Settings,
  Package,
  Grid,
  Activity,
  UserCog,
  Clock,
  FileText,
  Calendar,
  Wallet,
  Store,
  ShoppingBag,
  Truck
} from 'lucide-angular';
import { MenuGroupMetadata } from '../models/access-control';

/**
 * Centralized Sidebar Configuration per Senior Architectural Plan.
 * This decouples the Layout from the business navigation logic.
 */
export const SIDEBAR_MENU_CONFIG: MenuGroupMetadata[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, requiredFeature: 'DASHBOARD', requiredCapability: 'PRODUCTION' },
    ]
  },
  {
    title: 'Kiosco',
    items: [
      { label: 'Resumen', href: '/kiosco/dashboard', icon: LayoutDashboard, requiredFeature: 'DASHBOARD', requiredCapability: 'RETAIL' },
      { label: 'Venta (POS)', href: '/kiosco/venta', icon: ShoppingCart, requiredFeature: 'ORDERS', requiredCapability: 'RETAIL' },
      { label: 'Caja', href: '/kiosco/caja', icon: Wallet, requiredFeature: 'ORDERS', requiredCapability: 'RETAIL' },
      { label: 'Productos', href: '/kiosco/productos', icon: Store, requiredFeature: 'STOCK', requiredCapability: 'RETAIL' },
      { label: 'Compras', href: '/kiosco/compras', icon: ShoppingBag, requiredFeature: 'STOCK', requiredCapability: 'RETAIL' },
      { label: 'Proveedores', href: '/kiosco/proveedores', icon: Truck, requiredFeature: 'STOCK', requiredCapability: 'RETAIL' },
    ]
  },
  {
    title: 'Comercial',
    items: [
      { label: 'Visitas', href: '/visitas', icon: Clock, requiredFeature: 'VISITS', requiredCapability: 'PRODUCTION' },
      { label: 'Presupuestos', href: '/presupuestos', icon: FileText, requiredFeature: 'QUOTES', requiredCapability: 'PRODUCTION' },
      { label: 'Pedidos', href: '/pedidos', icon: ShoppingCart, requiredFeature: 'ORDERS', requiredCapability: 'PRODUCTION' },
      { label: 'Clientes', href: '/clientes', icon: Users, requiredFeature: 'CLIENTS', requiredCapability: 'PRODUCTION' },
    ]
  },
  {
    title: 'Operaciones',
    items: [
      { 
        label: 'Producción', 
        href: '/produccion', 
        icon: Activity, 
        requiredFeature: 'ORDERS_PRODUCTION',
        requiredCapability: 'PRODUCTION'
      },
      { 
        label: 'Calendario', 
        href: '/produccion/calendario', 
        icon: Calendar, 
        requiredFeature: 'CALENDAR',
        requiredCapability: 'PRODUCTION'
      },
      { 
        label: 'Stock de Producción', 
        href: '/stock', 
        icon: Grid, 
        requiredFeature: 'STOCK',
        requiredCapability: 'PRODUCTION'
      },
    ]
  },
  {
    title: 'Mi Taller',
    items: [
      {
        label: 'Maquinaria', 
        href: '/maquinas',
        icon: Wrench,
        requiredFeature: 'MACHINERY',
        requiredCapability: 'PRODUCTION',
        configKey: 'maquinas'
      },
      {
        label: 'Materiales',
        href: '/materiales',
        icon: Package,
        requiredFeature: 'MATERIALS',
        requiredCapability: 'PRODUCTION',
        configKey: 'materiales'
      },
      { label: 'Equipo', href: '/personal', icon: UserCog, requiredFeature: 'TEAM', requiredCapability: 'PRODUCTION' },
    ]
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Reportes Industriales', href: '/reportes', icon: BarChart3, requiredFeature: 'REPORTS', requiredCapability: 'PRODUCTION' },
      { label: 'Configuración', href: '/ajustes', icon: Settings, requiredFeature: 'SETTINGS' },
    ]
  }
];
