import { Routes } from '@angular/router';

export const PRODUCCION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/produccion-layout.component').then(m => m.ProduccionLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'monitor',
        pathMatch: 'full'
      },
      {
        path: 'monitor',
        loadComponent: () => import('./produccion.component').then(m => m.ProduccionBoardComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.ProduccionDashboardComponent)
      },
      {
        path: 'reportes',
        loadComponent: () => import('./reportes/reportes.component').then(m => m.ProduccionReportesComponent)
      }
    ]
  }
];
