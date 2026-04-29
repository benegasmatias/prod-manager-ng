export const PEDIDOS_LABELS = {
  TITLE: 'Seguimiento de Pedidos',
  SUBTITLE: 'Administraci├│n de flujos de trabajo, ├│rdenes de clientes y estados de entrega en tiempo real.',
  CATEGORY: 'Gesti├│n Comercial',
  ACTIONS: {
    NEW_ORDER: 'REGISTRAR PEDIDO'
  },
  ACTIVE_SECTION: 'Pedidos en Producci├│n',
  COMMERCIAL_SECTION: 'Preventas / Visitas / Presupuestos',
  COMMERCIAL_SUBTITLE: 'Gesti├│n comercial y relevamientos t├®cnicos',
  HISTORY_SECTION: 'Historial de Pedidos',
  HISTORY_SUBTITLE: 'Entregados / Anulados',
  EMPTY_ACTIVE: 'Sin pedidos activos',
  EMPTY_HISTORY: 'Sin registros en el historial',
  STATS: {
    SALES_VOLUME: 'Volumen de Ventas',
    PENDING_COLLECTION: 'Pendiente de Cobro',
    ACTIVE_ORDERS: 'Pedidos Activos',
    IN_PROGRESS: 'En Curso'
  },
  FILTERS: {
    CLIENT_PLACEHOLDER: 'Cliente / Referencia'
  }
} as const;

import {
  Wallet, Package, Clock, Calendar, Box,
  ExternalLink, Plus, TrendingUp, Search,
  List, LayoutGrid, X, SlidersHorizontal
} from 'lucide-angular';

export const PEDIDOS_ICONS = {
  SEARCH: Search,
  WALLET: Wallet,
  PACKAGE: Package,
  CLOCK: Clock,
  CALENDAR: Calendar,
  BOX: Box,
  EXTERNAL_LINK: ExternalLink,
  PLUS: Plus,
  TRENDING: TrendingUp,
  LIST: List,
  LAYOUT_GRID: LayoutGrid,
  X: X,
  FILTERS: SlidersHorizontal
} as const;
