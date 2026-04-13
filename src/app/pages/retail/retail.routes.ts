import { Routes } from '@angular/router';

export const RETAIL_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'caja',
        loadComponent: () => import('./caja/caja.component').then(m => m.RetailCajaComponent)
      },
      {
        path: 'productos',
        loadComponent: () => import('./productos/productos.component').then(m => m.RetailProductsComponent)
      },
      {
        path: 'venta',
        loadComponent: () => import('./venta/venta.component').then(m => m.RetailVentaComponent)
      },
      { path: '', redirectTo: 'venta', pathMatch: 'full' }
    ]
  }
];
