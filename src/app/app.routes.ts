import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@core/layout';
import { authGuard, publicGuard } from '../../libs/core/auth/auth.guard';
import { businessGuard } from '../../libs/core/auth/business.guard';
import { capabilityGuard, userStatusGuard, superAdminGuard } from '../../libs/core';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'admin',
    canMatch: [superAdminGuard],
    loadChildren: () => import('../../libs/features/platform-admin/platform-admin.routes').then(m => m.PLATFORM_ADMIN_ROUTES)
  },
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./pages/auth/callback.component').then(m => m.AuthCallbackComponent)
  },
  {
    path: 'onboarding',
    canActivate: [authGuard, userStatusGuard],
    loadComponent: () => import('../../libs/features/auth/pages/onboarding/onboarding.component').then(m => m.OnboardingComponent)
  },
  {
    path: 'invitaciones/aceptar',
    canActivate: [authGuard],
    loadComponent: () => import('../../libs/features/auth/pages/invitacion-aceptar/invitacion-aceptar.component').then(m => m.InvitacionAceptarComponent)
  },
  {
    path: 'select-business',
    canActivate: [authGuard],
    loadComponent: () => import('../../libs/features/auth/pages/select-business/select-business.component').then(m => m.SelectBusinessComponent)
  },
  {
    path: 'waiting-room',
    loadComponent: () => import('../../libs/features/auth/pages/waiting-room/waiting-room.component').then(m => m.WaitingRoomComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard, userStatusGuard, businessGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'pedidos',
        loadComponent: () => import('../../libs/features/pedidos/pedidos.component').then(m => m.PedidosPageComponent)
      },
      {
        path: 'pedidos/kanban',
        loadComponent: () => import('../../libs/features/pedidos/kanban.component').then(m => m.PedidosKanbanComponent)
      },
      {
        path: 'pedidos/nuevo',
        loadComponent: () => import('../../libs/features/pedidos/nuevo/nuevo-pedido.component').then(m => m.NuevoPedidoPageComponent)
      },
      {
        path: 'pedidos/:id',
        loadComponent: () => import('../../libs/features/pedidos/detalles/pedido-detalle.component').then(m => m.PedidoDetalleComponent)
      },
      {
        path: 'pedidos/editar/:id',
        loadComponent: () => import('../../libs/features/pedidos/editar/editar-pedido.component').then(m => m.EditarPedidoPageComponent)
      },
      {
        path: 'clientes',
        loadChildren: () => import('../../libs/features/clientes/clientes.routes').then(m => m.CLIENTES_ROUTES)
      },
      {
        path: 'stock',
        loadChildren: () => import('../../libs/features/stock/stock.routes').then(m => m.STOCK_ROUTES)
      },
      {
        path: 'materiales',
        loadChildren: () => import('@features/materiales/materiales.routes').then(m => m.MATERIALES_ROUTES)
      },
      {
        path: 'produccion',
        loadChildren: () => import('../../libs/features/produccion/produccion.routes').then(m => m.PRODUCCION_ROUTES)
      },
      {
        path: 'maquinas',
        loadChildren: () => import('@features/maquinas/maquinas.routes').then(m => m.MAQUINAS_ROUTES)
      },
      {
        path: 'personal',
        loadChildren: () => import('@features/personal/personal.routes').then(m => m.PERSONAL_ROUTES)
      },
      {
        path: 'reportes',
        loadChildren: () => import('@features/reportes/reportes.routes').then(m => m.REPORTES_ROUTES)
      },
      {
        path: 'ajustes',
        loadChildren: () => import('../../libs/features/ajustes/ajustes.routes').then(m => m.AJUSTES_ROUTES)
      },
      {
        path: 'kiosco',
        loadChildren: () => import('./pages/retail/retail.routes').then(m => m.RETAIL_ROUTES)
      },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];
