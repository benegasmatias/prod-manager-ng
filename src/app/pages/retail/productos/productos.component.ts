import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RetailService } from '@core/retail/retail.service';
import { RetailProduct, RetailStockMovementType } from '@shared/models/retail/retail.models';
import { LucideAngularModule, Package, Plus, Search, Layers, Edit2, TrendingUp } from 'lucide-angular';

@Component({
  selector: 'app-retail-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="p-6 space-y-6">
      <header class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <lucide-icon [name]="'Package'" class="w-8 h-8 text-indigo-600"></lucide-icon>
            Catálogo de Artículos
          </h1>
          <p class="text-gray-500">Gestión de productos, precios y niveles de stock.</p>
        </div>
        <button (click)="openCreateModal()" 
                class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-200">
            <lucide-icon [name]="'Plus'" class="w-5 h-5"></lucide-icon>
            NUEVO ARTÍCULO
        </button>
      </header>

      <!-- Barra de Filtros -->
      <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 items-center">
        <div class="flex-1 relative">
            <lucide-icon [name]="'Search'" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"></lucide-icon>
            <input type="text" [(ngModel)]="searchTerm" placeholder="Buscar por nombre o código de barras..." 
                   class="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500">
        </div>
      </div>

      <!-- Tabla de Productos -->
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th class="p-6 text-sm font-semibold text-gray-600">Artículo</th>
              <th class="p-6 text-sm font-semibold text-gray-600">Código/SKU</th>
              <th class="p-6 text-sm font-semibold text-gray-600">Precio Venta</th>
              <th class="p-6 text-sm font-semibold text-gray-600 text-center">Stock Actual</th>
              <th class="p-6 text-sm font-semibold text-gray-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            @for (product of filteredProducts(); track product.id) {
              <tr class="hover:bg-gray-50/50 transition">
                <td class="p-6">
                  <div class="font-bold text-gray-900">{{ product.name }}</div>
                  <div class="text-xs text-gray-400">Costo: {{ product.costPrice | currency:'ARS' }}</div>
                </td>
                <td class="p-6 font-mono text-xs text-gray-500">
                  {{ product.barcode || '-' }} / {{ product.sku || '-' }}
                </td>
                <td class="p-6">
                  <span class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-bold">
                    {{ product.salePrice | currency:'ARS' }}
                  </span>
                </td>
                <td class="p-6 text-center">
                  <div [class]="'inline-flex items-center gap-1 font-bold ' + (product.stock <= 5 ? 'text-red-600' : 'text-green-600')">
                    {{ product.stock }}
                    <span class="text-[10px] uppercase">un.</span>
                  </div>
                </td>
                <td class="p-6 text-right space-x-2">
                  <button (click)="openStockModal(product)" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Ajustar Stock">
                    <lucide-icon [name]="'TrendingUp'" class="w-5 h-5"></lucide-icon>
                  </button>
                  <button (click)="openEditModal(product)" class="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition">
                    <lucide-icon [name]="'Edit2'" class="w-5 h-5"></lucide-icon>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="p-20 text-center text-gray-400">
                  <lucide-icon [name]="'Layers'" class="w-12 h-12 mx-auto mb-4 opacity-20"></lucide-icon>
                  No hay artículos que coincidan con la búsqueda.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Modal Crear/Editar -->
      @if (productModal) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-6">
                <h2 class="text-xl font-bold">Nuevo Artículo</h2>
                <div class="grid grid-cols-2 gap-4">
                    <label class="col-span-2 space-y-1">
                        <span class="text-xs font-bold text-gray-400 uppercase">Nombre del Producto</span>
                        <input type="text" [(ngModel)]="currentProduct.name" class="w-full p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500">
                    </label>
                    <label class="space-y-1">
                        <span class="text-xs font-bold text-gray-400 uppercase">Código de Barras</span>
                        <input type="text" [(ngModel)]="currentProduct.barcode" class="w-full p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500">
                    </label>
                    <label class="space-y-1">
                        <span class="text-xs font-bold text-gray-400 uppercase">SKU Interno</span>
                        <input type="text" [(ngModel)]="currentProduct.sku" class="w-full p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500">
                    </label>
                    <label class="space-y-1">
                        <span class="text-xs font-bold text-gray-400 uppercase">Precio de Venta</span>
                        <input type="number" [(ngModel)]="currentProduct.salePrice" class="w-full p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-600">
                    </label>
                    <label class="space-y-1">
                        <span class="text-xs font-bold text-gray-400 uppercase">Precio de Costo</span>
                        <input type="number" [(ngModel)]="currentProduct.costPrice" class="w-full p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500">
                    </label>
                </div>
                <div class="flex gap-3 pt-4">
                    <button (click)="productModal = false" class="flex-1 p-4 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
                    <button (click)="saveProduct()" class="flex-1 p-4 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition">Guardar</button>
                </div>
            </div>
        </div>
      }

      <!-- Modal Stock Adjustment -->
      @if (stockModal) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6">
                <h2 class="text-xl font-bold">Ajuste de Stock: {{ selectedProductForStock?.name }}</h2>
                <div class="space-y-4">
                    <div class="flex gap-2">
                        <button (click)="stockAction = StockType.INVENTORY_IN" 
                                [class]="'flex-1 p-3 rounded-xl border-2 transition ' + (stockAction === StockType.INVENTORY_IN ? 'border-green-500 bg-green-50 text-green-700 font-bold' : 'border-gray-100 text-gray-400')">
                            ENTRADA
                        </button>
                        <button (click)="stockAction = StockType.INVENTORY_OUT" 
                                [class]="'flex-1 p-3 rounded-xl border-2 transition ' + (stockAction === StockType.INVENTORY_OUT ? 'border-red-500 bg-red-50 text-red-700 font-bold' : 'border-gray-100 text-gray-400')">
                            SALIDA
                        </button>
                    </div>
                    <label class="block">
                        <span class="text-sm font-medium text-gray-600">Cantidad</span>
                        <input type="number" [(ngModel)]="stockAmount" class="w-full mt-1 p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 text-2xl font-bold text-center">
                    </label>
                    <div class="flex gap-3 pt-4">
                        <button (click)="stockModal = false" class="flex-1 p-4 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
                        <button (click)="confirmStockAdjustment()" class="flex-1 p-4 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition">Confirmar</button>
                    </div>
                </div>
            </div>
        </div>
      }
    </div>
  `
})
export class RetailProductsComponent implements OnInit {
  private retailService = inject(RetailService);
  
  readonly StockType = RetailStockMovementType;
  
  products = signal<RetailProduct[]>([]);
  searchTerm = '';
  
  productModal = false;
  currentProduct: Partial<RetailProduct> = { salePrice: 0, costPrice: 0 };

  stockModal = false;
  selectedProductForStock: RetailProduct | null = null;
  stockAmount = 0;
  stockAction: RetailStockMovementType = RetailStockMovementType.INVENTORY_IN;

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts() {
    const list = await this.retailService.getProducts();
    this.products.set(list);
  }

  filteredProducts() {
    return this.products().filter(p => 
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
      p.barcode?.includes(this.searchTerm)
    );
  }

  openCreateModal() {
    this.currentProduct = { salePrice: 0, costPrice: 0 };
    this.productModal = true;
  }

  async saveProduct() {
    await this.retailService.createProduct(this.currentProduct);
    this.productModal = false;
    this.loadProducts();
  }

  openStockModal(product: RetailProduct) {
    this.selectedProductForStock = product;
    this.stockAmount = 0;
    this.stockAction = RetailStockMovementType.INVENTORY_IN;
    this.stockModal = true;
  }

  async confirmStockAdjustment() {
    if (!this.selectedProductForStock) return;
    await this.retailService.adjustStock(this.selectedProductForStock.id, this.stockAmount, this.stockAction, 'Ajuste manual desde catálogo');
    this.stockModal = false;
    this.loadProducts();
  }

  openEditModal(product: RetailProduct) {
    // Implementación futura de edición
  }
}
