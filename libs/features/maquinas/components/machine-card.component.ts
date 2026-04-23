import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Machine } from '@shared/models';
import { LucideAngularModule, Cpu, Settings, Activity, PlayCircle, AlertTriangle, Check, MoreHorizontal, Lock } from 'lucide-angular';
import { cn } from '@shared/utils/cn';
import { SessionService } from '@core/session/session.service';

@Component({
  selector: 'app-machine-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div [class]="cn(
      'group relative overflow-hidden bg-surface-container-low/50 border border-border/5 rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-2xl hover:bg-surface-container hover:-translate-y-1 animate-slide-up',
      (machine.status === 'MAINTENANCE' || machine.blockedByQuota) && 'opacity-75 grayscale-[0.3]'
    )">
      <!-- Blocked Overlay Editorial -->
      @if (machine.blockedByQuota) {
        <div class="absolute inset-0 z-10 bg-surface/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
           <div class="h-16 w-16 rounded-[2rem] bg-primary text-white flex items-center justify-center shadow-2xl mb-6 shadow-primary/20">
             <lucide-angular [img]="icons.Lock" class="h-8 w-8"></lucide-angular>
           </div>
           <h4 class="text-text font-black uppercase tracking-[0.3em] text-xs mb-2 font-display">Unidad Bloqueada</h4>
           <p class="text-[10px] text-text-muted font-bold uppercase tracking-widest max-w-[200px] leading-relaxed mb-6">Excede los límites de tu plan actual</p>
           <a routerLink="/ajustes" class="px-6 py-3 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">Upgrade Now</a>
        </div>
      }

      <div class="flex items-start justify-between mb-8">
        <div class="space-y-2 text-left">
          <div class="flex items-center gap-3">
            <div [class]="cn('h-2 w-2 rounded-full shadow-lg', getStatusColor(machine.status))"></div>
            <span [class]="cn('text-[10px] font-black uppercase tracking-[0.2em]', getStatusClass(machine.status))">
              {{ getStatusText(machine.status) }}
            </span>
          </div>
          <h3 class="text-xl font-black text-text tracking-tight font-display leading-none">{{ machine.name }}</h3>
        </div>
        <div class="h-12 w-12 rounded-[1.5rem] bg-surface-container-lowest border border-border/5 flex items-center justify-center text-text-muted group-hover:text-primary transition-all duration-500 shadow-sm">
          <lucide-angular [img]="icons.Cpu" class="h-6 w-6"></lucide-angular>
        </div>
      </div>

      <div class="space-y-6">
        <div class="flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest border border-border/5">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-xl bg-surface-container-low border border-border/5">
              <lucide-angular [img]="icons.Settings" class="h-4 w-4 text-text-muted/60"></lucide-angular>
            </div>
            <span class="text-[11px] font-black text-text-muted uppercase tracking-widest">{{ machine.model || 'N/A' }}</span>
          </div>
          <lucide-angular [img]="icons.Activity" class="h-4 w-4 text-primary/20"></lucide-angular>
        </div>

        <div class="min-h-[60px] flex flex-col justify-center px-1 text-left">
          @if (machine.status === 'WORKING' || machine.currentJobId) {
            <div class="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <div class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-success-container">
                <div class="relative flex h-2.5 w-2.5">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-container/40 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-success-container shadow-sm"></span>
                </div>
                <span>Trabajo en curso</span>
              </div>
              
              <div class="ml-5 space-y-1 min-w-0">
                @if (activeJob) {
                   <div class="flex flex-col">
                     <span class="text-[11px] font-black text-text truncate pr-2 uppercase tracking-tight">
                       #{{ activeJob.order?.code }} — {{ activeJob.order?.clientName || 'Cliente' }}
                     </span>
                     <span class="text-[10px] text-text-muted/60 font-black uppercase tracking-tighter truncate">
                       {{ activeJob.orderItem?.name || 'Ítem en producción' }}
                     </span>
                   </div>
                } @else if (machine.currentJobId) {
                   <p class="text-[10px] text-text-muted font-black tracking-widest truncate uppercase opacity-40">
                     ID: {{ machine.currentJobId.slice(0, 8) }}
                   </p>
                }
              </div>
            </div>
          } @else if (machine.status === 'MAINTENANCE') {
            <div class="space-y-2 text-danger-container">
              <div class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]">
                <lucide-angular [img]="icons.AlertTriangle" class="h-4 w-4"></lucide-angular>
                <span>Fuera de servicio</span>
              </div>
              <p class="text-[10px] font-bold ml-7 opacity-60 uppercase tracking-tighter">Intervención técnica requerida</p>
            </div>
          } @else {
            <div class="flex items-center gap-4 opacity-60 group-hover:opacity-100 transition-opacity">
              <div class="h-10 w-10 rounded-full bg-success-container/5 flex items-center justify-center border border-success-container/10">
                <lucide-angular [img]="icons.Check" class="h-5 w-5 text-success-container"></lucide-angular>
              </div>
              <span class="text-[10px] font-black text-text-muted uppercase tracking-widest italic">Ready for duty</span>
            </div>
          }
        </div>

        <div class="flex gap-3 pt-4">
          @if (machine.status === 'IDLE') {
            <button
              (click)="onAssign.emit(machine)"
              [disabled]="saving"
              class="flex-1 h-12 rounded-2xl bg-primary hover:scale-[1.02] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {{ saving ? '...' : 'Asignar Trabajo' }}
            </button>
          } @else {
            <button
              (click)="onRelease.emit(machine)"
              [disabled]="saving"
              class="flex-1 h-12 rounded-2xl bg-surface-container-lowest border border-border/5 text-text-muted text-[10px] font-black uppercase tracking-widest hover:text-text hover:bg-surface-container transition-all disabled:opacity-50"
            >
              {{ saving ? '...' : 'Liberar Unidad' }}
            </button>
          }
          <button
            (click)="onDetail.emit(machine)"
            class="h-12 w-12 rounded-2xl bg-surface-container-lowest border border-border/5 flex items-center justify-center text-text-muted hover:text-primary transition-all shadow-sm active:scale-95"
          >
            <lucide-angular [img]="icons.MoreHorizontal" class="h-5 w-5"></lucide-angular>
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

  readonly icons = { Cpu, Settings, Activity, PlayCircle, AlertTriangle, Check, MoreHorizontal, Lock };

  get activeJob() {
    return (this.machine.productionJobs || []).find(j => j.status !== 'COMPLETED' && j.status !== 'CANCELLED');
  }

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
