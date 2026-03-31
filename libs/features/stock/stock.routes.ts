import { Routes } from '@angular/router';

export const STOCK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./stock.component').then(m => m.StockPageComponent)
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./nuevo/nuevo-stock.component').then(m => m.NuevoStockPageComponent)
  }
];
