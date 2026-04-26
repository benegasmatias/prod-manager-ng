import { Component, inject, computed, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// ... (rest of lucide imports)
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
  User,
  X,
  Wallet,
  Store,
  Calendar,
  ArrowRight
} from 'lucide-angular';
import { LayoutService } from '../layout.service';
import { SessionService } from '../../session/session.service';
import { AccessControlService } from '../../auth/access-control.service';
import { MenuGroupMetadata } from '../../../shared/models/access-control';
import { SidebarSkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';

import { SIDEBAR_MENU_CONFIG } from '../../../shared/constants/sidebar-config';

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
  router = inject(Router);

  readonly icons = {
    LayoutDashboard, ShoppingCart, Users, Wrench, Cpu, BarChart3, Settings,
    Package, Layers, Box, Printer, FileText, Cog, Grid, ClipboardList,
    Hammer, Trees, Clock, HardHat, PackageSearch, Activity, UserCog, Database, Zap,
    ChevronLeft, ChevronRight, Pin, PinOff, User, X, Wallet, Store, Calendar, ArrowRight
  };

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.layoutService.closeMobileMenu();
    });
  }

  /**
   * Computed list of visible menu groups based on business features and user permissions.
   * Dynamically resolves labels from the business-specific configuration if a configKey is present.
   */
  readonly sidebarMenu = computed(() => {
    return SIDEBAR_MENU_CONFIG
      .map(group => ({
        ...group,
        items: group.items
          .filter(item => this.accessService.canViewMenuItem(item))
          .map(item => ({
            ...item,
            // Override static label with business-specific label from config if available
            label: (item.configKey && this.sessionService.config()?.labels?.[item.configKey]) 
                    || item.label
          }))
      }))
      .filter(group => group.items.length > 0);
  });
}
