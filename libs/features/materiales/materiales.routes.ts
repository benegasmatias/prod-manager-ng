import { Routes } from '@angular/router';

export const MATERIALES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./materiales.component').then(m => m.MaterialesPageComponent)
  }
];
