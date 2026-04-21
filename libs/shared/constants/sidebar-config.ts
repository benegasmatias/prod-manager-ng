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
  Truck,
  Receipt,
  ShieldCheck
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
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Resumen', href: '/kiosco/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Ventas',
    items: [
      { label: 'Venta (POS)', href: '/kiosco/venta', icon: ShoppingCart },
      { label: 'Caja', href: '/kiosco/caja', icon: Wallet },
    ]
  },
  {
    title: 'Inventario',
    items: [
      { label: 'Productos', href: '/kiosco/productos', icon: Store },
      { label: 'Compras', href: '/kiosco/compras', icon: ShoppingBag },
      { label: 'Proveedores', href: '/kiosco/proveedores', icon: Truck },
    ]
  },
  {
    title: 'Finanzas',
    items: [
      { label: 'Gastos', href: '/kiosco/gastos', icon: Receipt },
    ]
  },
  {
    title: 'Comercial',
    items: [
      { label: 'Visitas', href: '/visitas', icon: Clock },
      { label: 'Presupuestos', href: '/presupuestos', icon: FileText },
      { label: 'Pedidos', href: '/pedidos', icon: ShoppingCart },
      { label: 'Clientes', href: '/clientes', icon: Users },
    ]
  },
  {
    title: 'Operaciones',
    items: [
      { 
        label: 'Producción', 
        href: '/produccion', 
        icon: Activity
      },
      { 
        label: 'Calendario', 
        href: '/produccion/calendario', 
        icon: Calendar
      },
      { 
        label: 'Inventario', 
        href: '/stock', 
        icon: Grid
      },
    ]
  },
  {
    title: 'Taller',
    items: [
      {
        label: 'Maquinaria', 
        href: '/maquinas',
        icon: Wrench,
        configKey: 'maquinas'
      },
      {
        label: 'Materiales',
        href: '/materiales',
        icon: Package,
        configKey: 'materiales'
      },
    ]
  },
  {
    title: 'Equipo',
    items: [
      { label: 'Equipo', href: '/personal', icon: UserCog },
    ]
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Reportes Industriales', href: '/reportes', icon: BarChart3 },
      { label: 'Configuración', href: '/ajustes', icon: Settings },
    ]
  },
  {
    title: 'Administración',
    items: [
      { label: 'Panel de Plataforma', href: '/admin', icon: ShieldCheck, requiredGlobalRole: 'SUPER_ADMIN' },
    ]
  }
];
