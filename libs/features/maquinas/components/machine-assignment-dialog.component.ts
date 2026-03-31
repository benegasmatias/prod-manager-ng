import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pedido, Material } from '@shared/models';
import { LucideAngularModule, X, ChevronDown, Package, Plus } from 'lucide-angular';
import { SessionService } from '@core/session/session.service';


@Component({
  selector: 'app-machine-assignment-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden m-4 slide-in-from-bottom-4 animate-in duration-300">
        <div class="p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10 text-left relative">
          <div class="flex items-baseline justify-between mb-1">
            <h2 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Asignar Producción</h2>
            <button (click)="onCancel.emit()" class="text-zinc-400 hover:text-zinc-600 transition-colors">
              <lucide-angular [img]="icons.X" class="h-5 w-5"></lucide-angular>
            </button>
          </div>
          <p class="text-xs text-zinc-500 font-medium">Selecciona el material y el pedido para iniciar el proceso.</p>
        </div>

        <div class="p-8 space-y-8">
          @if (config().features.hasMaterials) {
            <div class="space-y-3">
              <label class="text-[11px] font-bold uppercase tracking-wider text-zinc-400 pl-1 text-left block">Seleccionar Material / Insumo</label>
              @if (availableMaterials.length > 0) {
                <div class="relative group">
                  <select
                    [(ngModel)]="selectedMaterialId"
                    class="w-full h-11 rounded-xl border border-zinc-200 bg-zinc-50/50 dark:bg-zinc-950/50 px-4 text-sm font-semibold dark:border-zinc-800 shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                  >
                    @for (m of availableMaterials; track m.id) {
                      <option [value]="m.id">
                        {{ m.name }} ({{ m.remainingWeightGrams }} {{ m.unit }} disponibles)
                      </option>
                    }
                  </select>
                  <lucide-angular [img]="icons.ChevronDown" class="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none transition-colors group-hover:text-zinc-500"></lucide-angular>
                </div>
              } @else {
                <div class="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-left">
                  <div class="flex items-center gap-2 text-amber-800 dark:text-amber-400 mb-1">
                    <lucide-angular [img]="icons.Package" class="h-4 w-4"></lucide-angular>
                    <p class="text-xs font-bold">Sin materiales registrados</p>
                  </div>
                  <p class="text-xs text-amber-700/70 dark:text-amber-500/70 leading-relaxed">
                    No tienes stock cargado. Se asignará el trabajo sin descontar insumos automáticamente.
                  </p>
                </div>
              }
            </div>
          }

          <div class="space-y-4">
            <label class="text-[11px] font-bold uppercase tracking-wider text-zinc-400 pl-1 text-left block">Seleccionar Pedido Pendiente</label>
            <div class="max-h-[280px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              @if (loadingOrders) {
                <div class="py-12 flex flex-col items-center justify-center gap-2">
                  <div class="h-6 w-6 border-2 border-zinc-100 border-t-primary rounded-full animate-spin"></div>
                  <p class="text-[10px] font-bold text-zinc-400 uppercase">Consultando pedidos...</p>
                </div>
              } @else if (pendingOrders.length > 0) {
                @for (order of pendingOrders; track order.id) {
                  <div
                    (click)="onAssign.emit({ orderId: order.id, materialId: selectedMaterialId })"
                    class="group relative flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <div class="flex flex-col text-left">
                      <div class="flex items-center gap-2">
                        <p class="font-bold text-sm text-zinc-900 dark:text-zinc-100">{{ order.clientName }}</p>
                        <span class="text-[10px] font-bold text-primary group-hover:translate-x-1 transition-transform">#{{ order.code || order.id.slice(0, 8) }}</span>
                      </div>
                      <p class="text-[11px] text-zinc-500 font-medium">Items: {{ order.items.length || 0 }}</p>
                    </div>
                    <div class="h-8 w-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <lucide-angular [img]="icons.Plus" class="h-4 w-4"></lucide-angular>
                    </div>
                  </div>
                }
              } @else {
                <div class="py-12 text-center space-y-2">
                  <p class="text-sm font-semibold text-zinc-400">Todo al día</p>
                  <p class="text-xs text-zinc-500 italic">No hay pedidos pendientes para asignar.</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MachineAssignmentDialogComponent {
  @Input() pendingOrders: Pedido[] = [];
  @Input() availableMaterials: Material[] = [];
  @Input() loadingOrders = false;

  @Output() onAssign = new EventEmitter<{ orderId: string; materialId: string }>();
  @Output() onCancel = new EventEmitter<void>();

  selectedMaterialId = '';

  private session = inject(SessionService);
  config = this.session.config;
  readonly icons = { X, ChevronDown, Package, Plus };
}
