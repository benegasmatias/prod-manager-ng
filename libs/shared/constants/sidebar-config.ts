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
  Calendar
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
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, requiredFeature: 'DASHBOARD' },
    ]
  },
  {
    title: 'Comercial',
    items: [
      { label: 'Visitas', href: '/visitas', icon: Clock, requiredFeature: 'VISITS' },
      { label: 'Presupuestos', href: '/presupuestos', icon: FileText, requiredFeature: 'QUOTES' },
      { label: 'Pedidos', href: '/pedidos', icon: ShoppingCart, requiredFeature: 'ORDERS' },
      { label: 'Clientes', href: '/clientes', icon: Users, requiredFeature: 'CLIENTS' },
    ]
  },
  {
    title: 'Operaciones',
    items: [
      { label: 'Producción', href: '/produccion', icon: Activity, requiredFeature: 'ORDERS_PRODUCTION' },
      { label: 'Calendario', href: '/produccion/calendario', icon: Calendar, requiredFeature: 'ORDERS_PRODUCTION' },
      { label: 'Inventario', href: '/stock', icon: Grid, requiredFeature: 'STOCK' },
    ]
  },
  {
    title: 'Mi Taller',
    items: [
      { 
        label: 'Maquinaria', // Labels can be dynamically overridden in SidebarComponent
        href: '/maquinas', 
        icon: Wrench, 
        requiredFeature: 'MACHINERY',
        configKey: 'maquinas' 
      },
      { 
        label: 'Materiales', 
        href: '/materiales', 
        icon: Package, 
        requiredFeature: 'MATERIALS',
        configKey: 'materiales'
      },
      { label: 'Equipo', href: '/personal', icon: UserCog, requiredFeature: 'TEAM' },
    ]
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Reportes', href: '/reportes', icon: BarChart3, requiredFeature: 'REPORTS' },
      { label: 'Ajustes', href: '/ajustes', icon: Settings, requiredFeature: 'SETTINGS' },
    ]
  }
];
