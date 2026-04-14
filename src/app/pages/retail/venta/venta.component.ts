import { Component, inject, OnInit, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RetailService } from '@core/retail/retail.service';
import { RetailProduct, SaleItem } from '@shared/models/retail/retail.models';
import { LucideAngularModule, ShoppingCart, Search, Trash2, Plus, Minus, CreditCard, Banknote, CheckCircle2, AlertCircle } from 'lucide-angular';
import { ButtonSpinnerComponent } from '@shared/ui/button-spinner/button-spinner.component';

interface CartItem extends RetailProduct {
  qty: number;
}

@Component({
  selector: 'app-retail-venta',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonSpinnerComponent],
  template: `
    <div class="h-[calc(100vh-120px)] flex gap-6 p-6 overflow-hidden">
      <!-- Sección Izquierda: Búsqueda y Catálogo rápido -->
      <div class="flex-1 flex flex-col space-y-4 min-w-0 font-sans">
        <header>
          <h1 class="text-2xl font-bold flex items-center gap-2">
            <lucide-icon [name]="'ShoppingCart'" class="text-indigo-600"></lucide-icon>
            Punto de Venta
          </h1>
        </header>

        <div class="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <div class="relative">
            <lucide-icon [name]="'Search'" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></lucide-icon>
            <input #searchInput type="text" [(ngModel)]="searchTerm" 
                   (keyup.enter)="onSearchEnter()"
                   placeholder="Escanear código o buscar artículo..." 
                   class="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-lg">
          </div>
        </div>

        <div class="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pr-2">
            @for (product of filteredProducts(); track product.id) {
                <button (click)="addToCart(product)" 
                        [disabled]="product.stock <= 0"
                        class="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition text-left space-y-2 group disabled:opacity-50 disabled:grayscale">
                    <div class="text-indigo-600 font-bold group-hover:scale-105 transition-transform origin-left">
                        {{ product.salePrice | currency:'ARS' }}
                    </div>
                    <div class="font-bold text-gray-900 line-clamp-2 leading-tight h-10">{{ product.name }}</div>
                    <div class="flex justify-between items-center text-[10px] uppercase font-bold text-gray-400">
                        <span>STOCK: {{ product.stock }}</span>
                        @if (product.barcode) {
                            <span class="bg-gray-100 px-2 py-0.5 rounded">{{ product.barcode }}</span>
                        }
                    </div>
                </button>
            }
        </div>
      </div>

      <!-- Sección Derecha: Carrito y Checkout -->
      <div class="w-[400px] flex flex-col bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden">
        <div class="p-6 bg-indigo-600 text-white">
            <h2 class="font-bold flex justify-between items-center text-lg">
                Resumen de Venta
                <span class="bg-indigo-500 px-3 py-1 rounded-full text-xs">{{ cartCount() }} ítems</span>
            </h2>
        </div>

        <!-- Lista de Carrito -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
            @for (item of cart(); track item.id) {
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl group animate-in slide-in-from-right duration-300">
                    <div class="flex-1">
                        <div class="font-bold text-sm text-gray-900">{{ item.name }}</div>
                        <div class="text-xs text-indigo-600 font-bold">{{ item.salePrice | currency:'ARS' }}</div>
                    </div>
                    <div class="flex items-center gap-2 bg-white px-2 py-1 rounded-xl shadow-sm border border-gray-100">
                        <button (click)="updateQty(item, -1)" class="p-1 hover:bg-gray-100 rounded text-gray-400"><lucide-icon [name]="'Minus'" class="w-4 h-4"></lucide-icon></button>
                        <span class="font-bold min-w-[2ch] text-center">{{ item.qty }}</span>
                        <button (click)="updateQty(item, 1)" class="p-1 hover:bg-gray-100 rounded text-gray-400"><lucide-icon [name]="'Plus'" class="w-4 h-4"></lucide-icon></button>
                    </div>
                    <button (click)="removeFromCart(item)" class="p-2 text-red-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                        <lucide-icon [name]="'Trash2'" class="w-5 h-5"></lucide-icon>
                    </button>
                </div>
            } @empty {
                <div class="h-full flex flex-col items-center justify-center text-center p-10 space-y-4 opacity-30">
                    <lucide-icon [name]="'ShoppingCart'" class="w-16 h-16"></lucide-icon>
                    <p class="font-bold">El carrito está vacío</p>
                </div>
            }
        </div>

        <!-- Totales y Pago -->
        <div class="p-6 border-t border-gray-100 space-y-4 bg-gray-50/50">
            <div class="flex justify-between items-end">
                <span class="text-gray-500 font-medium">TOTAL A PAGAR</span>
                <span class="text-4xl font-black text-indigo-600 tracking-tight">{{ total() | currency:'ARS' }}</span>
            </div>

            <div class="grid grid-cols-2 gap-2">
                <button (click)="paymentMethod = 'CASH'" 
                        [class]="'flex flex-col items-center p-3 rounded-2xl border-2 transition ' + (paymentMethod === 'CASH' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-400 hover:border-gray-300')">
                    <lucide-icon [name]="'Banknote'" class="w-6 h-6 mb-1"></lucide-icon>
                    <span class="text-[10px] font-bold">EFECTIVO</span>
                </button>
                <button (click)="paymentMethod = 'CARD'" 
                        [class]="'flex flex-col items-center p-3 rounded-2xl border-2 transition ' + (paymentMethod === 'CARD' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-400 hover:border-gray-300')">
                    <lucide-icon [name]="'CreditCard'" class="w-6 h-6 mb-1"></lucide-icon>
                    <span class="text-[10px] font-bold">TARJETA / MP</span>
                </button>
            </div>

            <app-button-spinner
                    [loading]="loading()"
                    [disabled]="cart().length === 0"
                    [btnClass]="'w-full py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-3 transition shadow-xl ' + (cart().length === 0 ? 'bg-gray-200 text-gray-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-200')"
                    [loadingText]="'PROCESANDO...'"
                    (onClick)="finalizeSale()">
                <lucide-icon [name]="'ShoppingCart'" class="w-6 h-6"></lucide-icon>
                FINALIZAR VENTA
            </app-button-spinner>
        </div>
      </div>

      <!-- Feedback Modals -->
      @if (successModal) {
        <div class="fixed inset-0 bg-indigo-600/90 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300 p-4">
            <div class="text-white text-center space-y-6">
                <lucide-icon [name]="'CheckCircle2'" class="w-24 h-24 mx-auto animate-bounce"></lucide-icon>
                <h2 class="text-4xl font-black">¡VENTA EXITOSA!</h2>
                <button (click)="resetCart()" class="bg-white text-indigo-600 px-12 py-4 rounded-full font-black text-lg hover:bg-indigo-50 transition shadow-2xl">
                    CONTINUAR
                </button>
            </div>
        </div>
      }

      @if (errorMsg) {
        <div class="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300 z-50">
            <lucide-icon [name]="'AlertCircle'"></lucide-icon>
            <span class="font-bold underline uppercase text-sm">Error:</span>
            <span class="font-medium">{{ errorMsg }}</span>
            <button (click)="errorMsg = null" class="ml-4 p-1 hover:bg-white/10 rounded-full transition">✕</button>
        </div>
      }
    </div>
  `
})
export class RetailVentaComponent implements OnInit, AfterViewInit {
  private retailService = inject(RetailService);
  
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  
  allProducts = signal<RetailProduct[]>([]);
  searchTerm = '';
  
  cart = signal<CartItem[]>([]);
  paymentMethod: 'CASH' | 'CARD' = 'CASH';
  loading = signal(false);
  successModal = false;
  errorMsg: string | null = null;

  total = computed(() => this.cart().reduce((sum, item) => sum + (item.salePrice * item.qty), 0));
  cartCount = computed(() => this.cart().reduce((sum, item) => sum + item.qty, 0));

  ngOnInit() {
    this.loadCatalog();
    this.retailService.getCurrentDrawer();
  }

  ngAfterViewInit() {
    this.focusSearch();
  }

  focusSearch() {
    setTimeout(() => this.searchInput.nativeElement.focus(), 100);
  }

  async loadCatalog() {
    const list = await this.retailService.getProducts();
    this.allProducts.set(list);
  }

  filteredProducts() {
    return this.allProducts().filter(p => 
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
      p.barcode?.includes(this.searchTerm)
    );
  }

  addToCart(product: RetailProduct) {
    const existing = this.cart().find(i => i.id === product.id);
    if (existing) {
        this.updateQty(existing, 1);
    } else {
        this.cart.update(c => [...c, { ...product, qty: 1 }]);
    }
  }

  updateQty(item: CartItem, delta: number) {
    const newQty = item.qty + delta;
    if (newQty <= 0) {
        this.removeFromCart(item);
        return;
    }
    if (newQty > item.stock) {
        this.errorMsg = `Stock insuficiente para ${item.name}`;
        return;
    }
    this.cart.update(c => c.map(i => i.id === item.id ? { ...i, qty: newQty } : i));
  }

  removeFromCart(item: CartItem) {
    this.cart.update(c => c.filter(i => i.id !== item.id));
  }

  async finalizeSale() {
    this.loading.set(true);
    try {
        const items = this.cart().map(i => ({ productId: i.id, quantity: i.qty }));
        await this.retailService.processSale(items, this.paymentMethod);
        this.successModal = true;
        await this.loadCatalog(); // Refresh stocks
    } catch (err: any) {
        this.errorMsg = err.error?.message || 'Error al procesar la venta';
    } finally {
        this.loading.set(false);
    }
  }

  resetCart() {
    this.cart.set([]);
    this.successModal = false;
    this.searchTerm = '';
    this.focusSearch();
  }

  onSearchEnter() {
    const results = this.filteredProducts();
    if (results.length === 1 && results[0].stock > 0) {
        this.addToCart(results[0]);
        this.searchTerm = '';
    }
  }
}
