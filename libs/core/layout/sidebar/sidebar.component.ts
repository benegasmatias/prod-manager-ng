import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Wrench,
  Cpu,
  BarChart3,
  Settings,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Box,
  Printer,
  FileText,
  Cog,
  Grid,
  ClipboardList,
  Hammer,
  Trees,
  Clock,
  HardHat,
  PackageSearch,
  Activity,
  UserCog,
  Database,
  Zap,
  Pin,
  PinOff,
  User
} from 'lucide-angular';
import { LayoutService } from '../layout.service';
import { SessionService } from '../../session/session.service';
import { AccessControlService } from '../../auth/access-control.service';
import { MenuGroupMetadata } from '../../../shared/models/access-control';
import { SidebarSkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    SidebarSkeletonComponent,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  layoutService = inject(LayoutService);
  sessionService = inject(SessionService);
  accessService = inject(AccessControlService);

  readonly icons = {
    LayoutDashboard, ShoppingCart, Users, Wrench, Cpu, BarChart3, Settings,
    Package, Layers, Box, Printer, FileText, Cog, Grid, ClipboardList,
    Hammer, Trees, Clock, HardHat, PackageSearch, Activity, UserCog, Database, Zap,
    ChevronLeft, ChevronRight, Pin, PinOff, User
  };

  /**
   * Computed list of visible menu groups based on business features and user permissions.
   */
  readonly sidebarMenu = computed(() => {
    const rawGroups: MenuGroupMetadata[] = [
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
          { label: 'Cola de Impresión', href: '/impresion', icon: Printer, requiredFeature: 'MACHINERY' },
          { label: 'Producción', href: '/produccion', icon: Activity, requiredFeature: 'ORDERS' },
          { label: 'Inventario', href: '/stock', icon: Grid, requiredFeature: 'STOCK' },
        ]
      },
      {
        title: 'Mi Taller',
        items: [
          { label: 'Maquinaria', href: '/maquinas', icon: Wrench, requiredFeature: 'MACHINERY' },
          { label: 'Materiales', href: '/materiales', icon: Package, requiredFeature: 'MATERIALS' },
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

    return rawGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item => this.accessService.canViewMenuItem(item))
      }))
      .filter(group => group.items.length > 0);
  });
}
