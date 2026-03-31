import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@core/layout';
import { authGuard, publicGuard } from '../../libs/core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
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
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
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
        path: 'maquinas',
        loadChildren: () => import('@features/maquinas/maquinas.routes').then(m => m.MAQUINAS_ROUTES)
      },
      {
        path: 'personal',
        loadChildren: () => import('@features/personal/personal.routes').then(m => m.PERSONAL_ROUTES)
      },
      { path: '**', redirectTo: 'dashboard' }

      // Resto de páginas protegidas...
    ]
  },
];
