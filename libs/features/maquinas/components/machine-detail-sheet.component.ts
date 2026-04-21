import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Machine } from '@shared/models';
import { LucideAngularModule, X, Edit2, Trash2, Package, Calendar } from 'lucide-angular';
import { SessionService } from '@core/session/session.service';
import { cn } from '@shared/utils/cn';
import { CalibrationsListComponent } from './calibrations-list.component';

@Component({
  selector: 'app-machine-detail-sheet',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CalibrationsListComponent],
  template: `
    <div class="fixed inset-0 z-[9999] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div (click)="onClose.emit()" class="absolute inset-0"></div>
      <div class="relative w-full max-w-lg h-screen bg-white dark:bg-zinc-950 shadow-[-20px_0_50px_-15px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-500 flex flex-col border-l border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <!-- Sheet Header with safety padding -->
        <div class="pt-10 pb-8 px-8 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/30 dark:bg-zinc-900/10 flex items-center justify-between">
          <div class="space-y-1.5 text-left">
            <h2 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Gestión de {{ config().labels.maquinas.slice(0, -1) || 'Unidad' }}</h2>
            <p class="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80">{{ machine?.name || 'Cargando...' }}</p>
          </div>
          <div class="flex gap-2">
            <button
              (click)="machine && onEdit.emit(machine)"
              class="h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
            >
              <lucide-angular [img]="icons.Edit2" class="h-4 w-4"></lucide-angular>
            </button>
            <button
              (click)="machine && onDelete.emit(machine.id)"
              class="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white transition-all shadow-sm flex items-center justify-center border border-orange-100 dark:border-orange-900/30"
            >
              <lucide-angular [img]="icons.Trash2" class="h-4 w-4"></lucide-angular>
            </button>
            <div class="w-px h-8 bg-zinc-100 dark:bg-zinc-800 mx-1"></div>
            <button (click)="onClose.emit()" class="h-10 w-10 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <lucide-angular [img]="icons.X" class="h-5 w-5"></lucide-angular>
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-white dark:bg-zinc-950">
          @if (loading) {
            <div class="h-full flex flex-col items-center justify-center space-y-4">
              <div class="h-10 w-10 border-4 border-zinc-100 border-t-primary rounded-full animate-spin"></div>
              <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Sincronizando datos...</p>
            </div>
          } @else if (machine) {
            <section class="space-y-6">
              <div class="flex items-center gap-2 mb-2">
                <div class="h-1 w-4 rounded-full bg-primary/30"></div>
                <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Especificaciones Técnicas</h3>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="p-5 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/60 text-left transition-colors hover:bg-white dark:hover:bg-zinc-900">
                  <p class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">Estado</p>
                  <div class="flex items-center gap-2.5">
                    <div [class]="cn('h-2 w-2 rounded-full', getStatusColor(machine.status))"></div>
                    <p class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ getStatusText(machine.status) }}</p>
                  </div>
                </div>
                <div class="p-5 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/60 text-left transition-colors hover:bg-white dark:hover:bg-zinc-900">
                  <p class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">Modelo</p>
                  <p class="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{{ machine.model || 'N/A' }}</p>
                </div>
                
                @if (config().features.hasNozzle) {
                  <div class="p-5 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/60 text-left transition-colors hover:bg-white dark:hover:bg-zinc-900">
                    <p class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">Punch / Nozzle</p>
                    <p class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ machine.nozzle || '0.4mm' }}</p>
                  </div>
                }
                @if (config().features.hasMaxFilaments) {
                  <div class="p-5 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/60 text-left transition-colors hover:bg-white dark:hover:bg-zinc-900">
                    <p class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">Capacidad</p>
                    <p class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ machine.maxFilaments || 1 }} Rollos</p>
                  </div>
                }
              </div>
            </section>

            <section>
              <app-calibrations-list [machineId]="machine.id"></app-calibrations-list>
            </section>

            <section class="space-y-6">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div class="h-1 w-4 rounded-full bg-primary/30"></div>
                  <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Historial Reciente</h3>
                </div>
                <span class="text-[9px] font-black text-zinc-400 border border-zinc-100 dark:border-zinc-800 px-2.5 py-1 rounded-full">ÚLTIMOS 5 TRABAJOS</span>
              </div>

              <div class="space-y-4">
                @if (machine.productionJobs && machine.productionJobs.length > 0) {
                  @for (job of machine.productionJobs; track job.id) {
                    <div class="group p-6 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-l-4" [class.border-l-primary]="job.status !== 'DONE'">
                      <div class="flex justify-between items-start">
                        <div class="space-y-1.5 text-left">
                          <p class="text-[10px] font-black text-primary uppercase tracking-[0.2em]">#{{ job.order?.code || job.orderId.slice(0, 8) }}</p>
                          <p class="text-base font-bold text-zinc-900 dark:text-zinc-50">{{ job.order?.clientName || 'Cliente No Registrado' }}</p>
                        </div>
                        <div [class]="cn(
                          'text-[10px] font-bold uppercase px-3 py-1.5 rounded-xl border',
                          job.status === 'DONE' 
                            ? 'bg-emerald-50/50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                            : 'bg-blue-50/50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30'
                        )">
                          {{ job.status === 'DONE' ? 'Terminado' : 'En Proceso' }}
                        </div>
                      </div>

                      <div class="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-100 dark:border-zinc-800/50 transition-colors text-left group-hover:bg-white dark:group-hover:bg-zinc-900">
                        <div class="h-10 w-10 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-center shrink-0">
                          <lucide-angular [img]="icons.Package" class="h-5 w-5 text-zinc-400"></lucide-angular>
                        </div>
                        <div class="min-w-0">
                          <p class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Producto / Ítem</p>
                          <p class="text-sm font-bold text-zinc-700 dark:text-zinc-200 truncate pr-2">
                             {{ job.orderItem?.name || 'Producción General' }}
                          </p>
                        </div>
                      </div>

                      <div class="flex justify-between items-center pt-1 px-1">
                        <div class="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                          <lucide-angular [img]="icons.Calendar" class="h-4 w-4 opacity-50"></lucide-angular>
                          <span>{{ job.createdAt | date:'dd MMM, yyyy' }}</span>
                        </div>
                        <div class="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black rounded-xl tracking-widest uppercase">
                          {{ job.totalUnits || 1 }} UNIDADES
                        </div>
                      </div>
                    </div>
                  }
                } @else {
                  <div class="py-20 text-center border-2 border-dashed rounded-[3rem] border-zinc-100 dark:border-zinc-800 bg-zinc-50/10 flex flex-col items-center justify-center gap-4">
                      <lucide-angular [img]="icons.Package" class="h-8 w-8 text-zinc-200 dark:text-zinc-800"></lucide-angular>
                      <p class="text-xs text-zinc-400 font-bold uppercase tracking-[0.2em]">Historial Vacío</p>
                      <p class="text-[11px] text-zinc-500 max-w-[200px] mx-auto text-center font-medium opacity-60 italic">No se registran trabajos previos en esta unidad operativa.</p>
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
