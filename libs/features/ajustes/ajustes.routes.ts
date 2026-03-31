import { Routes } from '@angular/router';

export const AJUSTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@features/ajustes/ajustes.component').then(m => m.AjustesComponent)
  }
];
