import { Routes } from '@angular/router';
import { PlatformAdminLayoutComponent } from './layout/platform-admin-layout.component';

export const PLATFORM_ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: PlatformAdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
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
        loadComponent: () => import('./pages/users/users-admin.component').then(m => m.UsersAdminComponent) // Reusing Users as placeholder for now
      }
    ]
  }
];
