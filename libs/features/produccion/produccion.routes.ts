import { Routes } from '@angular/router';

export const PRODUCCION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./produccion.component').then(m => m.ProduccionBoardComponent)
  }
];
