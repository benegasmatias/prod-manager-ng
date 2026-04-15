import { Routes } from '@angular/router';
import { PlatformAdminLayoutComponent } from './layout/platform-admin-layout.component';

export const PLATFORM_ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: PlatformAdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard-admin.component').then(m => m.DashboardAdminComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users-admin.component').then(m => m.UsersAdminComponent)
      },
      {
        path: 'businesses',
        loadComponent: () => import('./pages/businesses/businesses-admin.component').then(m => m.BusinessesAdminComponent)
      },
      {
        path: 'plans',
        loadComponent: () => import('./pages/dashboard/dashboard-admin.component').then(m => m.DashboardAdminComponent) // Placeholder dashboard for now
      }
    ]
  }
];
