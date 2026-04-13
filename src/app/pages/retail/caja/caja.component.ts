import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RetailService } from '@core/retail/retail.service';
import { CashDrawerStatus, CashMovementType } from '@shared/models/retail/retail.models';
import { LucideAngularModule, Wallet, Plus, Minus, Lock, Unlock, History } from 'lucide-angular';

@Component({
  selector: 'app-retail-caja',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      <header class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <lucide-icon [name]="'Wallet'" class="w-8 h-8 text-indigo-600"></lucide-icon>
            Gestión de Caja
          </h1>
          <p class="text-gray-500">Control de apertura, cierre y movimientos manuales.</p>
        </div>
      </header>

      <!-- Estado de la Caja -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <span class="text-sm font-medium text-gray-500 uppercase tracking-wider">Estado Actual</span>
          <div class="flex items-center gap-2">
            <div [class]="'w-3 h-3 rounded-full ' + (drawer()?.status === 'OPEN' ? 'bg-green-500 animate-pulse' : 'bg-red-500')"></div>
            <span class="text-lg font-semibold">{{ drawer()?.status === 'OPEN' ? 'Caja Abierta' : 'Caja Cerrada' }}</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <span class="text-sm font-medium text-gray-500 uppercase tracking-wider">Balance en Caja</span>
          <div class="text-2xl font-bold text-indigo-600">
            {{ (drawer()?.currentBalance || 0) | currency:'ARS':'symbol':'1.2-2' }}
          </div>
        </div>

        <div class="flex items-center">
            @if (drawer()?.status !== 'OPEN') {
                <button (click)="openDrawerModal = true" 
                        [disabled]="loading()"
                        class="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                    <lucide-icon [name]="'Unlock'" class="w-5 h-5"></lucide-icon>
                    ABRIR CAJA
                </button>
            } @else {
                <button (click)="closeDrawer()" 
                        [disabled]="loading()"
                        class="w-full bg-red-600 text-white p-4 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-red-200">
                    <lucide-icon [name]="'Lock'" class="w-5 h-5"></lucide-icon>
                    CERRAR CAJA
                </button>
            }
        </div>
      </div>

      <!-- Acciones de Movimiento -->
      @if (drawer()?.status === 'OPEN') {
        <div class="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button (click)="prepareMovement('MANUAL_IN')" 
                    class="bg-white p-4 rounded-xl border border-gray-200 hover:border-green-500 hover:text-green-600 transition flex items-center gap-3">
                <div class="p-2 bg-green-50 rounded-lg text-green-600">
                    <lucide-icon [name]="'Plus'"></lucide-icon>
                </div>
                <div class="text-left">
                    <div class="font-bold">Ingreso Manual</div>
                    <div class="text-xs text-gray-500">Carga de cambio, vueltos, etc.</div>
                </div>
            </button>

            <button (click)="prepareMovement('MANUAL_OUT')" 
                    class="bg-white p-4 rounded-xl border border-gray-200 hover:border-red-500 hover:text-red-600 transition flex items-center gap-3">
                <div class="p-2 bg-red-50 rounded-lg text-red-600">
                    <lucide-icon [name]="'Minus'"></lucide-icon>
                </div>
                <div class="text-left">
                    <div class="font-bold">Retiro Manual</div>
                    <div class="text-xs text-gray-500">Pago proveedores, retiro de seguridad.</div>
                </div>
            </button>
        </div>
      }

      <!-- Modales -->
      @if (openDrawerModal) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6">
                <h2 class="text-xl font-bold">Apertura de Caja</h2>
                <div class="space-y-4">
                    <label class="block">
                        <span class="text-sm font-medium text-gray-600">Monto Inicial (Efectivo)</span>
                        <input type="number" [(ngModel)]="openingBalance" class="w-full mt-1 p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 text-2xl font-bold">
                    </label>
                    <div class="flex gap-3 pt-4">
                        <button (click)="openDrawerModal = false" class="flex-1 p-4 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
                        <button (click)="confirmOpenDrawer()" class="flex-1 p-4 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition">Confirmar</button>
                    </div>
                </div>
            </div>
        </div>
      }

      @if (movementModal) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6">
                <h2 class="text-xl font-bold">{{ selectedType === 'MANUAL_IN' ? 'Ingreso Efectivo' : 'Retiro Efectivo' }}</h2>
                <div class="space-y-4">
                    <label class="block">
                        <span class="text-sm font-medium text-gray-600">Monto</span>
                        <input type="number" [(ngModel)]="movementAmount" class="w-full mt-1 p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 text-2xl font-bold">
                    </label>
                    <label class="block">
                        <span class="text-sm font-medium text-gray-600">Nota / Motivo</span>
                        <input type="text" [(ngModel)]="movementNote" placeholder="Ej: Pago de luz, Carga de cambio" class="w-full mt-1 p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500">
                    </label>
                    <div class="flex gap-3 pt-4">
                        <button (click)="movementModal = false" class="flex-1 p-4 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
                        <button (click)="confirmMovement()" class="flex-1 p-4 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition">Procesar</button>
                    </div>
                </div>
            </div>
        </div>
      }
    </div>
  `
})
export class RetailCajaComponent implements OnInit {
  private retailService = inject(RetailService);
  
  drawer = this.retailService.currentDrawer;
  loading = signal(false);
  
  openDrawerModal = false;
  openingBalance = 0;

  movementModal = false;
  movementAmount = 0;
  movementNote = '';
  selectedType: CashMovementType = CashMovementType.MANUAL_IN;

  ngOnInit() {
    this.retailService.getCurrentDrawer();
  }

  async confirmOpenDrawer() {
    this.loading.set(true);
    try {
        await this.retailService.openDrawer(this.openingBalance);
        this.openDrawerModal = false;
        this.openingBalance = 0;
    } finally {
        this.loading.set(false);
    }
  }

  async closeDrawer() {
    if (confirm('¿Está seguro que desea cerrar la caja hoy?')) {
        this.loading.set(true);
        try {
            await this.retailService.closeDrawer();
        } finally {
            this.loading.set(false);
        }
    }
  }

  prepareMovement(type: any) {
    this.selectedType = type;
    this.movementModal = true;
    this.movementAmount = 0;
    this.movementNote = '';
  }

  async confirmMovement() {
    await this.retailService.addManualMovement(this.movementAmount, this.selectedType, this.movementNote);
    await this.retailService.getCurrentDrawer(); // Refresh balance
    this.movementModal = false;
  }
}
