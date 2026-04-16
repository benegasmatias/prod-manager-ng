import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Machine } from '@shared/models';
import { LucideAngularModule, Cpu, Settings, Activity, PlayCircle, AlertTriangle, Check, MoreHorizontal } from 'lucide-angular';
import { cn } from '@shared/utils/cn';
import { SessionService } from '@core/session/session.service';

@Component({
  selector: 'app-machine-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div [class]="cn(
      'group relative overflow-hidden bg-white dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/50 rounded-[2.5rem] p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-slide-up',
      machine.status === 'MAINTENANCE' && 'opacity-75 grayscale-[0.3]'
    )">
      <div class="flex items-start justify-between mb-6">
        <div class="space-y-1.5 text-left">
          <div class="flex items-center gap-2">
            <div [class]="cn('h-1.5 w-1.5 rounded-full', getStatusColor(machine.status))"></div>
            <span [class]="cn('text-[10px] font-bold uppercase tracking-wider', getStatusClass(machine.status))">
              {{ getStatusText(machine.status) }}
            </span>
          </div>
          <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{{ machine.name }}</h3>
        </div>
        <div class="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors">
          <lucide-angular [img]="icons.Cpu" class="h-5 w-5"></lucide-angular>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/10 border border-zinc-100 dark:border-zinc-800/50">
          <div class="flex items-center gap-2.5">
            <div class="p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
              <lucide-angular [img]="icons.Settings" class="h-3.5 w-3.5 text-zinc-400"></lucide-angular>
            </div>
            <span class="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-tight">{{ machine.model || 'N/A' }}</span>
          </div>
          <lucide-angular [img]="icons.Activity" class="h-3.5 w-3.5 text-zinc-300"></lucide-angular>
        </div>

        <div class="min-h-[50px] flex flex-col justify-center px-1 text-left">
          @if (machine.status === 'WORKING') {
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                <lucide-angular [img]="icons.PlayCircle" class="h-4 w-4 text-emerald-500"></lucide-angular>
                <span>Trabajo en curso</span>
              </div>
              <p class="text-[11px] text-zinc-500 font-medium ml-6 truncate">{{ machine.currentJobId || 'Monitorizando carga...' }}</p>
            </div>
          } @else if (machine.status === 'MAINTENANCE') {
            <div class="space-y-1.5 text-rose-600 dark:text-rose-400">
              <div class="flex items-center gap-2 text-xs font-semibold">
                <lucide-angular [img]="icons.AlertTriangle" class="h-4 w-4"></lucide-angular>
                <span>Fuera de servicio</span>
              </div>
              <p class="text-[11px] font-medium ml-6 opacity-70 italic">Intervención técnica requerida</p>
            </div>
          } @else {
            <div class="flex items-center gap-3 opacity-60">
              <div class="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
                <lucide-angular [img]="icons.Check" class="h-4 w-4 text-emerald-600 dark:text-emerald-400"></lucide-angular>
              </div>
              <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400 italic">Lista para producción</span>
            </div>
          }
        </div>

        <div class="flex gap-2 pt-2">
          @if (machine.status === 'IDLE') {
            <button
              (click)="onAssign.emit(machine)"
              [disabled]="saving"
              class="flex-1 h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {{ saving ? '...' : 'Asignar Trabajo' }}
            </button>
          } @else {
            <button
              (click)="onRelease.emit(machine)"
              [disabled]="saving"
              class="flex-1 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all disabled:opacity-50"
            >
              {{ saving ? '...' : 'Liberar Unidad' }}
            </button>
          }
          <button
            (click)="onDetail.emit(machine)"
            class="h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all group/btn"
          >
            <lucide-angular [img]="icons.MoreHorizontal" class="h-4 w-4 text-zinc-500 group-hover/btn:text-primary transition-colors"></lucide-angular>
          </button>
        </div>
      </div>
    </div>
  `
})
export class MachineCardComponent {
  @Input({ required: true }) machine!: Machine;
  @Input() saving = false;
  
  @Output() onAssign = new EventEmitter<Machine>();
  @Output() onRelease = new EventEmitter<Machine>();
  @Output() onDetail = new EventEmitter<Machine>();

  private session = inject(SessionService);
  config = this.session.config;
  cn = cn;

  readonly icons = { Cpu, Settings, Activity, PlayCircle, AlertTriangle, Check, MoreHorizontal };

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

  getStatusClass(status: string) {
    switch (status) {
      case 'WORKING': return 'text-amber-600 dark:text-amber-400';
      case 'MAINTENANCE': return 'text-rose-600 dark:text-rose-400';
      default: return 'text-emerald-600 dark:text-emerald-400';
    }
  }
}
