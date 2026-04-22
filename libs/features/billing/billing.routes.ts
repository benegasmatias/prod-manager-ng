import { Routes } from '@angular/router';

export const BILLING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/pricing/pricing.component').then(m => m.PricingComponent)
  },
  {
    path: 'success',
    loadComponent: () => import('./pages/status/status.component').then(m => m.StatusComponent),
    data: { status: 'success' }
  },
  {
    path: 'failure',
    loadComponent: () => import('./pages/status/status.component').then(m => m.StatusComponent),
    data: { status: 'failure' }
  },
  {
    path: 'pending',
    loadComponent: () => import('./pages/status/status.component').then(m => m.StatusComponent),
    data: { status: 'pending' }
  }
];
