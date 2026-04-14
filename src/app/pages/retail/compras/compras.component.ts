import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RetailService } from '@core/retail/retail.service';
import { Supplier, RetailProduct, Purchase } from '@shared/models/retail/retail.models';
import { LucideAngularModule, ShoppingBag, Plus, Search, Trash2, Calendar, User, Truck, Receipt } from 'lucide-angular';
import { ButtonSpinnerComponent } from '@shared/ui/button-spinner/button-spinner.component';

@Component({
  selector: 'app-retail-compras',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonSpinnerComponent],
  template: `
    <div class="p-6 space-y-6">
      <header class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <lucide-icon [name]="'ShoppingBag'" class="w-8 h-8 text-indigo-600"></lucide-icon>
            Compras y Reposición
          </h1>
          <p class="text-gray-500">Ingreso de mercadería y control de costos.</p>
        </div>
        <button (click)="openNewPurchase()" 
                class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-100">
          <lucide-icon [name]="'Plus'" class="w-5 h-5"></lucide-icon>
          REGISTRAR COMPRA
        </button>
      </header>

      <!-- Lista de Compras -->
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table class="w-full text-left">
              <thead class="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest">
                  <tr>
                      <th class="px-6 py-4">Fecha</th>
                      <th class="px-6 py-4">Proveedor</th>
                      <th class="px-6 py-4">Items</th>
                      <th class="px-6 py-4 text-right">Total</th>
                  </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                  @for (p of purchases(); track p.id) {
                      <tr class="hover:bg-gray-50/50 transition cursor-pointer" (click)="viewDetail(p)">
                          <td class="px-6 py-4">
                              <div class="font-bold text-gray-900">{{ p.createdAt | date:'dd/MM/yyyy' }}</div>
                              <div class="text-[10px] text-gray-400">{{ p.createdAt | date:'HH:mm' }} hs</div>
                          </td>
                          <td class="px-6 py-4">
                              <div class="flex items-center gap-2">
                                  <lucide-icon [name]="'Truck'" class="w-4 h-4 text-gray-400"></lucide-icon>
                                  <span class="font-medium">{{ p.supplier?.name }}</span>
                              </div>
                          </td>
                          <td class="px-6 py-4">
                              <span class="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600">
                                  {{ p.items?.length }} SKU
                              </span>
                          </td>
                          <td class="px-6 py-4 text-right font-black text-indigo-600">
                              {{ p.totalAmount | currency:'ARS' }}
                          </td>
                      </tr>
                  } @empty {
                       <tr>
                          <td colspan="4" class="px-6 py-20 text-center text-gray-400 italic">No hay compras registradas</td>
                      </tr>
                  }
              </tbody>
          </table>
      </div>

      <!-- Modal Nueva Compra -->
      @if (showModal) {
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div class="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div class="p-6 bg-indigo-600 text-white flex justify-between items-center">
                      <h2 class="text-xl font-bold flex items-center gap-2">
                          <lucide-icon [name]="'Plus'" class="w-6 h-6"></lucide-icon>
                          Registrar Nueva Compra
                      </h2>
                      <button (click)="showModal = false" class="hover:bg-white/20 p-2 rounded-full transition">✕</button>
                  </div>

                  <div class="flex-1 overflow-y-auto p-8 space-y-8">
                      <!-- Cabecera de Compra -->
                      <div class="grid grid-cols-2 gap-6">
                           <label class="block">
                                <span class="text-xs font-black text-gray-400 uppercase tracking-widest">Proveedor</span>
                                <select [(ngModel)]="selectedSupplierId" class="w-full mt-2 p-4 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Seleccionar proveedor...</option>
                                    @for (s of activeSuppliers(); track s.id) {
                                        <option [value]="s.id">{{ s.name }}</option>
                                    }
                                </select>
                           </label>
                           
                           <div class="flex flex-col justify-end">
                                <div class="relative">
                                    <lucide-icon [name]="'Search'" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"></lucide-icon>
                                    <input type="text" 
                                           [(ngModel)]="productSearch" 
                                           (input)="searchProducts()"
                                           placeholder="Buscar producto por nombre o código..." 
                                           class="w-full p-4 pl-12 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-indigo-500">
                                    
                                    @if (searchResults().length > 0) {
                                        <div class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden z-10 transition animate-in fade-in slide-in-from-top-2">
                                            @for (p of searchResults(); track p.id) {
                                                <button (click)="addItem(p)" class="w-full text-left p-4 hover:bg-indigo-50 flex justify-between items-center border-b border-gray-50 last:border-0">
                                                    <div>
                                                        <p class="font-bold text-gray-900">{{ p.name }}</p>
                                                        <p class="text-xs text-gray-400">Barcode: {{ p.barcode || 'N/A' }} | Stock: {{ p.stock }}</p>
                                                    </div>
                                                    <div class="text-right">
                                                        <p class="text-xs font-black text-indigo-600 uppercase">Costo: {{ p.costPrice | currency:'ARS' }}</p>
                                                    </div>
                                                </button>
                                            }
                                        </div>
                                    }
                                </div>
                           </div>
                      </div>

                      <!-- Tabla de Ítems -->
                      <div class="space-y-4">
                          <h3 class="font-black text-gray-400 text-xs uppercase tracking-widest">Productos a Ingresar</h3>
                          @for (item of newPurchaseItems; track item.productId; let i = $index) {
                              <div class="bg-gray-50 p-4 rounded-2xl flex items-center gap-6 animate-in slide-in-from-left-4 duration-300">
                                  <div class="flex-1">
                                      <p class="font-bold">{{ item.productName }}</p>
                                      <p class="text-xs text-gray-400">ID: {{ item.productId.split('-')[0] }}</p>
                                  </div>
                                  
                                  <div class="w-32">
                                      <span class="text-[10px] font-black uppercase text-gray-400">Cantidad</span>
                                      <input type="number" [(ngModel)]="item.quantity" (change)="validateItem(item)" class="w-full bg-white p-2 rounded-xl text-center font-bold border-0 focus:ring-2 focus:ring-indigo-500">
                                  </div>

                                  <div class="w-40">
                                      <span class="text-[10px] font-black uppercase text-gray-400">Precio Costo</span>
                                      <input type="number" [(ngModel)]="item.costPrice" (change)="validateItem(item)" class="w-full bg-white p-2 rounded-xl text-center font-bold border-0 focus:ring-2 focus:ring-indigo-500">
                                  </div>

                                  <div class="w-40 text-right">
                                      <span class="text-[10px] font-black uppercase text-gray-400">Subtotal</span>
                                      <p class="font-black text-gray-900">{{ item.quantity * item.costPrice | currency:'ARS' }}</p>
                                  </div>

                                  <button (click)="removeItem(i)" class="text-red-400 hover:text-red-600 p-2">
                                      <lucide-icon [name]="'Trash2'" class="w-5 h-5"></lucide-icon>
                                  </button>
                              </div>
                          } @empty {
                              <div class="py-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                                  Agrega productos buscando arriba para iniciar la compra
                              </div>
                          }
                      </div>
                  </div>

                  <!-- Footer -->
                  <div class="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                      <div>
                          <p class="text-xs font-black text-gray-400 uppercase tracking-widest">Total Comprobante</p>
                          <p class="text-4xl font-black text-gray-900">{{ purchaseTotal() | currency:'ARS' }}</p>
                      </div>
                      <div class="flex gap-4">
                          <button (click)="showModal = false" class="px-8 py-4 rounded-2xl font-bold text-gray-600 hover:bg-gray-100 transition">Cancelar</button>
                          <app-button-spinner
                              [loading]="loading()"
                              [disabled]="!canSubmit()"
                              [btnClass]="'px-12 py-4 rounded-2xl font-black bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 disabled:opacity-50'"
                              (onClick)="submitPurchase()"
                              loadingText="PROCESANDO...">
                              <lucide-icon [name]="'Receipt'" class="w-5 h-5 mr-2"></lucide-icon>
                              CONFIRMAR INGRESO
                          </app-button-spinner>
                      </div>
                  </div>
              </div>
          </div>
      }
    </div>
  `
})
export class RetailComprasComponent implements OnInit {
  private retailService = inject(RetailService);

  purchases = signal<Purchase[]>([]);
  activeSuppliers = signal<Supplier[]>([]);
  allProducts = signal<RetailProduct[]>([]);
  loading = signal(false);
  showModal = false;

  // Form state
  selectedSupplierId = '';
  productSearch = '';
  searchResults = signal<RetailProduct[]>([]);
  newPurchaseItems: any[] = [];

  purchaseTotal = computed(() => {
    return this.newPurchaseItems.reduce((acc, item) => acc + (item.quantity * item.costPrice), 0);
  });

  canSubmit = computed(() => {
    return this.selectedSupplierId !== '' && this.newPurchaseItems.length > 0;
  });

  async ngOnInit() {
    this.list();
    this.loadSuppliers();
    this.loadProducts();
  }

  async list() {
    const list = await this.retailService.getPurchases();
    this.purchases.set(list);
  }

  async loadSuppliers() {
    const list = await this.retailService.getSuppliers();
    this.activeSuppliers.set(list.filter(s => s.active));
  }

  async loadProducts() {
    const list = await this.retailService.getProducts();
    this.allProducts.set(list.filter(p => p.active));
  }

  openNewPurchase() {
    this.selectedSupplierId = '';
    this.newPurchaseItems = [];
    this.productSearch = '';
    this.searchResults.set([]);
    this.showModal = true;
  }

  searchProducts() {
    if (this.productSearch.length < 2) {
      this.searchResults.set([]);
      return;
    }
    const q = this.productSearch.toLowerCase();
    this.searchResults.set(
      this.allProducts().filter(p => 
        p.name.toLowerCase().includes(q) || (p.barcode && p.barcode.includes(q))
      ).slice(0, 5)
    );
  }

  addItem(p: RetailProduct) {
    const existing = this.newPurchaseItems.find(i => i.productId === p.id);
    if (!existing) {
      this.newPurchaseItems.push({
        productId: p.id,
        productName: p.name,
        quantity: 1,
        costPrice: p.costPrice || 0
      });
    } else {
      existing.quantity++;
    }
    this.productSearch = '';
    this.searchResults.set([]);
  }

  removeItem(index: number) {
    this.newPurchaseItems.splice(index, 1);
  }

  validateItem(item: any) {
    if (item.quantity < 0.001) item.quantity = 1;
    if (item.costPrice < 0) item.costPrice = 0;
  }

  async submitPurchase() {
    if (!this.canSubmit()) return;

    this.loading.set(true);
    try {
      const dto = {
        supplierId: this.selectedSupplierId,
        items: this.newPurchaseItems.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          costPrice: i.costPrice
        }))
      };

      await this.retailService.registerPurchase(dto);
      this.showModal = false;
      this.list();
      alert('Ingreso de mercadería registrado con éxito. El stock ha sido actualizado.');
    } catch (e: any) {
      alert('Error al registrar la compra: ' + (e.error?.message || 'Error desconocido'));
    } finally {
      this.loading.set(false);
    }
  }

  viewDetail(p: Purchase) {
    // Simple detail logic or alert for now to keep it minimal
    const itemsList = p.items?.map(i => `- ${i.product?.name}: ${i.quantity} u. @ ${i.costPrice}`).join('\n');
    alert(`Detalle de Compra\n\nProveedor: ${p.supplier?.name}\nTotal: ${p.totalAmount}\n\nÍtems:\n${itemsList}`);
  }
}
