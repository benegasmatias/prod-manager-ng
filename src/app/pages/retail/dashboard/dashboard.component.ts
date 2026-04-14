import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RetailService } from '@core/retail/retail.service';
import { RetailProduct } from '@shared/models/retail/retail.models';
import { LucideAngularModule, LayoutDashboard, Wallet, ShoppingCart, TrendingUp, AlertCircle, Banknote } from 'lucide-angular';

@Component({
  selector: 'app-retail-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="p-6 space-y-8 bg-gray-50 min-h-screen">
        <header>
            <h1 class="text-3xl font-black text-gray-900 tracking-tight">RESUMEN OPERATIVO</h1>
            <p class="text-gray-500">Kiosco y Ventas Rápidas - Día de hoy</p>
        </header>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Caja Actual -->
            <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div class="bg-indigo-50 p-4 rounded-2xl text-indigo-600">
                    <lucide-icon [name]="'Wallet'" class="w-8 h-8"></lucide-icon>
                </div>
                <div>
                    <p class="text-sm text-gray-400 font-bold uppercase tracking-wider">Caja Actual</p>
                    <h3 class="text-2xl font-black text-gray-900">{{ summary()?.drawer?.currentBalance || 0 | currency:'ARS' }}</h3>
                </div>
            </div>

            <!-- Ventas Hoy -->
            <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div class="bg-green-50 p-4 rounded-2xl text-green-600">
                    <lucide-icon [name]="'TrendingUp'" class="w-8 h-8"></lucide-icon>
                </div>
                <div>
                    <p class="text-sm text-gray-400 font-bold uppercase tracking-wider">Ventas Hoy</p>
                    <h3 class="text-2xl font-black text-gray-900">{{ summary()?.sales?.totalAmount || 0 | currency:'ARS' }}</h3>
                </div>
            </div>

            <!-- Cantidad Ventas -->
            <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div class="bg-blue-50 p-4 rounded-2xl text-blue-600">
                    <lucide-icon [name]="'ShoppingCart'" class="w-8 h-8"></lucide-icon>
                </div>
                <div>
                    <p class="text-sm text-gray-400 font-bold uppercase tracking-wider">Operaciones</p>
                    <h3 class="text-2xl font-black text-gray-900">{{ summary()?.sales?.count || 0 }}</h3>
                </div>
            </div>

            <!-- Ticket Promedio -->
            <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div class="bg-orange-50 p-4 rounded-2xl text-orange-600">
                    <lucide-icon [name]="'Banknote'" class="w-8 h-8"></lucide-icon>
                </div>
                <div>
                    <p class="text-sm text-gray-400 font-bold uppercase tracking-wider">Promedio</p>
                    <h3 class="text-2xl font-black text-gray-900">{{ summary()?.sales?.averageTicket || 0 | currency:'ARS' }}</h3>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Top Productos -->
            <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div class="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h2 class="text-xl font-bold flex items-center gap-2">
                        <lucide-icon [name]="'TrendingUp'" class="w-5 h-5 text-indigo-500"></lucide-icon>
                        Más Vendidos
                    </h2>
                </div>
                <div class="p-0">
                    @for (prod of topProducts(); track prod.name) {
                        <div class="flex items-center justify-between p-4 hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
                            <div>
                                <p class="font-bold text-gray-900">{{ prod.name }}</p>
                                <p class="text-xs text-gray-400">{{ prod.quantity }} unidades vendidas</p>
                            </div>
                            <div class="text-right">
                                <p class="font-black text-indigo-600">{{ prod.revenue | currency:'ARS' }}</p>
                            </div>
                        </div>
                    } @empty {
                         <div class="p-12 text-center text-gray-400">Sin ventas registradas</div>
                    }
                </div>
            </div>

            <!-- Alertas de Stock -->
            <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div class="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h2 class="text-xl font-bold flex items-center gap-2">
                        <lucide-icon [name]="'AlertCircle'" class="w-5 h-5 text-red-500"></lucide-icon>
                        Alertas de Stock
                    </h2>
                    <span class="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold">{{ lowStock().length }} artículos</span>
                </div>
                <div class="p-0 max-h-[400px] overflow-y-auto">
                    @for (prod of lowStock(); track prod.id) {
                        <div class="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
                            <p class="font-bold text-gray-900">{{ prod.name }}</p>
                            <span class="bg-red-100 text-red-700 px-3 py-1 rounded-lg font-black text-sm">
                                {{ prod.stock }} {{ prod.stock === 1 ? 'unidad' : 'unidades' }}
                            </span>
                        </div>
                    } @empty {
                        <div class="p-12 text-center text-green-500 font-bold">Stock saludable</div>
                    }
                </div>
            </div>
        </div>

        <!-- Resumen de Caja Detallado -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="p-6 bg-gray-900 text-white">
                <h2 class="text-xl font-bold">Detalle de Caja del Día</h2>
            </div>
            <div class="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="space-y-4">
                    <div class="flex justify-between border-b pb-2">
                        <span class="text-gray-500">Saldo Inicial</span>
                        <span class="font-bold">{{ summary()?.drawer?.openingBalance | currency:'ARS' }}</span>
                    </div>
                    <div class="flex justify-between border-b pb-2">
                        <span class="text-gray-500">Ingresos x Venta</span>
                        <span class="font-bold text-green-600">+ {{ summary()?.drawer?.totalSalesIncome | currency:'ARS' }}</span>
                    </div>
                </div>
                <div class="space-y-4">
                    <div class="flex justify-between border-b pb-2">
                        <span class="text-gray-500">Ingresos Manuales</span>
                        <span class="font-bold text-blue-600">+ {{ summary()?.drawer?.manualIncome | currency:'ARS' }}</span>
                    </div>
                    <div class="flex justify-between border-b pb-2">
                        <span class="text-gray-500">Egresos Manuales</span>
                        <span class="font-bold text-red-600">- {{ summary()?.drawer?.manualExpenses | currency:'ARS' }}</span>
                    </div>
                </div>
                <div class="bg-indigo-50 p-6 rounded-2xl flex flex-col justify-center text-center">
                    <p class="text-indigo-400 text-sm font-bold uppercase">Balance Total</p>
                    <p class="text-3xl font-black text-indigo-700">{{ summary()?.drawer?.currentBalance | currency:'ARS' }}</p>
                </div>
            </div>
        </div>
    </div>
  `
})
export class RetailDashboardComponent implements OnInit {
  private retailService = inject(RetailService);

  summary = signal<any>(null);
  topProducts = signal<any[]>([]);
  lowStock = signal<RetailProduct[]>([]);
  loading = signal(true);

  async ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
        const [summary, top, low] = await Promise.all([
            this.retailService.getDailySummary(),
            this.retailService.getTopProducts(10),
            this.retailService.getLowStock(5)
        ]);

        this.summary.set(summary);
        this.topProducts.set(top);
        this.lowStock.set(low);
    } catch (error) {
        console.error('Error loading dashboard data', error);
    } finally {
        this.loading.set(false);
    }
  }
}
