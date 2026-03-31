import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Machine } from '@shared/models';
import { LucideAngularModule, X, Edit2, Trash2, Package, Calendar } from 'lucide-angular';
import { SessionService } from '@core/session/session.service';
import { cn } from '@shared/utils/cn';

@Component({
  selector: 'app-machine-detail-sheet',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div (click)="onClose.emit()" class="absolute inset-0"></div>
      <div class="relative w-full max-w-md h-full bg-white dark:bg-zinc-950 shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
        <div class="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div class="space-y-1 text-left">
            <h2 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Gestión de {{ config().labels.maquinas.slice(0, -1) || 'Unidad' }}</h2>
            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{{ machine?.name || 'Cargando...' }}</p>
          </div>
          <div class="flex gap-2">
            <button
              (click)="onEdit.emit(machine!)"
              class="h-9 w-9 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-primary transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <lucide-angular [img]="icons.Edit2" class="h-4 w-4"></lucide-angular>
            </button>
            <button
              (click)="onDelete.emit(machine!.id)"
              class="h-9 w-9 rounded-xl border border-rose-100 text-rose-500 bg-rose-50/50 hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center justify-center"
            >
              <lucide-angular [img]="icons.Trash2" class="h-4 w-4"></lucide-angular>
            </button>
            <button (click)="onClose.emit()" class="h-9 w-9 rounded-xl text-zinc-400 hover:text-zinc-600 flex items-center justify-center">
              <lucide-angular [img]="icons.X" class="h-5 w-5"></lucide-angular>
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          @if (loading) {
            <div class="h-full flex flex-col items-center justify-center space-y-4">
              <div class="h-10 w-10 border-4 border-zinc-100 border-t-primary rounded-full animate-spin"></div>
              <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Sincronizando...</p>
            </div>
          } @else if (machine) {
            <section class="space-y-5">
              <h3 class="text-[11px] font-bold uppercase tracking-wider text-zinc-400 pl-1 text-left">Especificaciones</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 text-left">
                  <p class="text-[10px] text-zinc-400 font-bold uppercase mb-1">Estado Operativo</p>
                  <div class="flex items-center gap-2">
                    <div [class]="cn('h-2 w-2 rounded-full', getStatusColor(machine.status))"></div>
                    <p class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ getStatusText(machine.status) }}</p>
                  </div>
                </div>
                <div class="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 text-left">
                  <p class="text-[10px] text-zinc-400 font-bold uppercase mb-1">Modelo / Marca</p>
                  <p class="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{{ machine.model || 'N/A' }}</p>
                </div>
                
                @if (config().features.hasNozzle) {
                  <div class="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 text-left">
                    <p class="text-[10px] text-zinc-400 font-bold uppercase mb-1">Nozzle actual</p>
                    <p class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ machine.nozzle || '0.4mm' }}</p>
                  </div>
                }
                @if (config().features.hasMaxFilaments) {
                  <div class="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 text-left">
                    <p class="text-[10px] text-zinc-400 font-bold uppercase mb-1">Capacidad Max.</p>
                    <p class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ machine.maxFilaments || 1 }} Rollos</p>
                  </div>
                }
              </div>
            </section>

            <section class="space-y-5">
              <div class="flex items-center justify-between">
                <h3 class="text-[11px] font-bold uppercase tracking-wider text-zinc-400 pl-1 text-left line-clamp-1">Historial Reciente</h3>
                <span class="text-[10px] font-bold text-zinc-500 border border-zinc-100 dark:border-zinc-800 px-2 py-0.5 rounded-md whitespace-nowrap">ÚLTIMOS TRABAJOS</span>
              </div>
              <div class="space-y-4">
                @if (machine.productionJobs && machine.productionJobs.length > 0) {
                  @for (job of machine.productionJobs; track job.id) {
                    <div class="group p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 space-y-4 hover:shadow-md transition-all duration-300">
                      <div class="flex justify-between items-start">
                        <div class="space-y-1 text-left">
                          <p class="text-[10px] font-bold text-primary uppercase tracking-tight">#{{ job.order?.code || job.orderId.slice(0, 8) }}</p>
                          <p class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ job.order?.clientName || 'Cliente' }}</p>
                        </div>
                        <div [class]="cn(
                          'text-[9px] font-bold uppercase px-2.5 py-1 rounded-full',
                          job.status === 'DONE' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'bg-blue-50 text-blue-600 dark:bg-blue-950/30'
                        )">
                          {{ job.status === 'DONE' ? 'Terminado' : 'En Curso' }}
                        </div>
                      </div>

                      <div class="flex items-start gap-3 p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/50 group-hover:bg-zinc-50 transition-colors text-left">
                        <div class="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                          <lucide-angular [img]="icons.Package" class="h-4 w-4 text-zinc-400"></lucide-angular>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-[10px] text-zinc-500 font-bold uppercase mb-0.5 whitespace-nowrap">Producto / Ítem</p>
                          <p class="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate leading-relaxed">
                            {{ job.orderItem?.name || 'Item General' }}
                          </p>
                        </div>
                      </div>

                      <div class="flex justify-between items-center pt-2">
                        <div class="flex items-center gap-2 text-[11px] text-zinc-500 font-medium">
                          <lucide-angular [img]="icons.Calendar" class="h-3.5 w-3.5 opacity-60"></lucide-angular>
                          <span>{{ job.createdAt | date:'shortDate' }}</span>
                        </div>
                        <div class="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg shrink-0">
                          {{ job.totalUnits || 1 }} UNID.
                        </div>
                      </div>
                    </div>
                  }
                } @else {
                  <div class="py-12 text-center border-2 border-dashed rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50/10">
                    <p class="text-xs text-zinc-400 italic">No hay registros previos en este activo.</p>
                  </div>
                }
              </div>
            </section>
          }
        </div>
      </div>
    </div>
  `
})
export class MachineDetailSheetComponent {
  @Input() machine: Machine | null = null;
  @Input() loading = false;

  @Output() onClose = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<Machine>();
  @Output() onDelete = new EventEmitter<string>();

  private session = inject(SessionService);
  config = this.session.config;
  cn = cn;

  readonly icons = { X, Edit2, Trash2, Package, Calendar };

  getStatusColor(status: string) {
    switch (status) {
      case 'WORKING': return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
      case 'MAINTENANCE': return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
      default: return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse';
    }
  }

  getStatusText(status: string) {
    return this.config().machineStatusLabels?.[status] || 'Operativa';
  }
}
