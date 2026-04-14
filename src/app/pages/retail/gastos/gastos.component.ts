import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RetailService } from '@core/retail/retail.service';
import { RetailExpense, RetailExpenseCategory } from '@shared/models/retail/retail.models';
import { LucideAngularModule, Wallet, Plus, Receipt, AlertCircle, CheckCircle2 } from 'lucide-angular';
import { ButtonSpinnerComponent } from '@shared/ui/button-spinner/button-spinner.component';

@Component({
  selector: 'app-retail-gastos',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonSpinnerComponent],
  template: `
    <div class="p-6 space-y-6 max-w-6xl mx-auto">
      <header class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <lucide-icon [name]="'Receipt'" class="w-8 h-8 text-rose-600"></lucide-icon>
            Gastos Operativos
          </h1>
          <p class="text-gray-500 text-sm">Registro de salidas de dinero no relacionadas con mercadería.</p>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Formulario de Registro -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div class="p-6 bg-rose-600 text-white font-bold flex items-center gap-2">
                <lucide-icon [name]="'Plus'" class="w-5 h-5"></lucide-icon>
                REGISTRAR GASTO
            </div>
            
            <div class="p-6 space-y-4">
                @if (!currentDrawer()) {
                    <div class="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 text-amber-700 text-sm">
                        <lucide-icon [name]="'AlertCircle'" class="w-5 h-5 shrink-0"></lucide-icon>
                        <p>Debe <b>abrir caja</b> antes de poder registrar un gasto operativo.</p>
                    </div>
                }

                <label class="block space-y-1">
                    <span class="text-xs font-bold text-gray-400 uppercase">Monto</span>
                    <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                        <input type="number" [(ngModel)]="form.amount" 
                               [disabled]="!currentDrawer()"
                               class="w-full pl-8 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-rose-500 text-2xl font-black text-rose-600">
                    </div>
                </label>

                <label class="block space-y-1">
                    <span class="text-xs font-bold text-gray-400 uppercase">Categoría</span>
                    <select [(ngModel)]="form.category" 
                            [disabled]="!currentDrawer()"
                            class="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-rose-500 font-medium">
                        <option value="RENT">Alquiler</option>
                        <option value="UTILITIES">Servicios (Luz/Agua/Internet)</option>
                        <option value="TAXES">Impuestos / Tasas</option>
                        <option value="CLEANING">Limpieza e Insumos</option>
                        <option value="OTHER">Otros Varios</option>
                    </select>
                </label>

                <label class="block space-y-1">
                    <span class="text-xs font-bold text-gray-400 uppercase">Nota / Motivo</span>
                    <textarea [(ngModel)]="form.note" 
                              [disabled]="!currentDrawer()"
                              rows="3"
                              placeholder="Ej: Pago de internet Fibertel..."
                              class="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-rose-500 resize-none"></textarea>
                </label>

                <app-button-spinner
                    [loading]="loading()"
                    [disabled]="!currentDrawer() || !form.amount || form.amount <= 0"
                    [btnClass]="'w-full py-5 rounded-2xl font-black text-white transition ' + (currentDrawer() && form.amount > 0 ? 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200' : 'bg-gray-200 cursor-not-allowed')"
                    (onClick)="saveExpense()"
                    loadingText="PROCESANDO...">
                    REGISTRAR SALIDA
                </app-button-spinner>
            </div>
          </div>
        </div>

        <!-- Listado Reciente -->
        <div class="lg:col-span-2 space-y-4">
            <h3 class="font-bold text-gray-400 text-xs uppercase tracking-widest pl-2">Gastos Recientes</h3>
            
            <div class="space-y-3">
                @for (expense of expenses(); track expense.id) {
                    <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition group">
                        <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                            <lucide-icon [name]="'Receipt'" class="w-6 h-6"></lucide-icon>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-start">
                                <span class="font-bold text-gray-900">{{ categoryLabels[expense.category] }}</span>
                                <span class="text-xl font-black text-rose-600">{{ expense.amount | currency:'ARS' }}</span>
                            </div>
                            <div class="text-sm text-gray-500 line-clamp-1">{{ expense.note || 'Sin descripción' }}</div>
                            <div class="text-[10px] text-gray-400 uppercase mt-1 font-medium">{{ expense.createdAt | date:'short' }}</div>
                        </div>
                    </div>
                } @empty {
                    <div class="bg-gray-50 rounded-[32px] p-12 text-center border-2 border-dashed border-gray-100 space-y-4">
                        <lucide-icon [name]="'Receipt'" class="w-16 h-16 mx-auto text-gray-200"></lucide-icon>
                        <p class="text-gray-400 font-medium">No se han registrado gastos aún.</p>
                    </div>
                }
            </div>
        </div>
      </div>
    </div>
  `
})
export class RetailGastosComponent implements OnInit {
  private retailService = inject(RetailService);

  expenses = signal<RetailExpense[]>([]);
  loading = signal(false);
  currentDrawer = this.retailService.currentDrawer;

  form = {
    amount: 0,
    category: 'OTHER' as RetailExpenseCategory,
    note: ''
  };

  categoryLabels: Record<RetailExpenseCategory, string> = {
    RENT: 'Alquiler',
    UTILITIES: 'Servicios',
    TAXES: 'Impuestos',
    CLEANING: 'Limpieza',
    OTHER: 'Otros Varios'
  };

  ngOnInit() {
    this.loadExpenses();
    this.retailService.getCurrentDrawer();
  }

  async loadExpenses() {
    try {
      const list = await this.retailService.getExpenses();
      this.expenses.set(list);
    } catch (err) {
      console.error('Error loading expenses', err);
    }
  }

  async saveExpense() {
    if (!this.form.amount || this.form.amount <= 0) return;
    
    this.loading.set(true);
    try {
        await this.retailService.registerExpense(this.form);
        // Reset form
        this.form = { amount: 0, category: 'OTHER', note: '' };
        // Refresh data
        await this.loadExpenses();
        await this.retailService.getCurrentDrawer(); // Update balance
    } catch (err) {
        console.error('Error saving expense', err);
    } finally {
        this.loading.set(false);
    }
  }
}
