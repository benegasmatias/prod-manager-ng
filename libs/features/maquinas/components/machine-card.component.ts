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
      'group relative overflow-hidden bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] border border-border/5 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 animate-slide-up',
      (machine.status === 'MAINTENANCE' || machine.blockedByQuota) && 'opacity-90'
    )">
      <!-- Blocked Overlay Editorial -->
      @if (machine.blockedByQuota) {
        <div class="absolute inset-0 z-20 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
           <div class="h-16 w-16 rounded-[2rem] bg-rose-500 text-white flex items-center justify-center shadow-2xl mb-6 shadow-rose-500/20">
             <lucide-angular [img]="icons.Lock" class="h-8 w-8"></lucide-angular>
           </div>
           <h4 class="text-rose-600 font-black uppercase tracking-[0.3em] text-[10px] mb-2 font-display">Unidad Bloqueada</h4>
           <button routerLink="/ajustes" class="h-12 px-8 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
             UPGRADE NOW
           </button>
        </div>
      }

      <!-- Top Row: Brand & Chart -->
      <div class="flex justify-between items-start mb-6">
        <span class="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] italic">
          {{ machine.brand || 'BAMBU LAB' }}
        </span>
        <div class="text-primary/10">
          <lucide-angular [img]="icons.Activity" class="h-8 w-8"></lucide-angular>
        </div>
      </div>

      <!-- Main Info: Model Name -->
      <div class="space-y-4 mb-10">
        <h3 class="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase font-display leading-tight">
          {{ machine.name }}
        </h3>
        
        <!-- Status Indicator -->
        <div class="flex items-center gap-3">
          @if (machine.status === 'MAINTENANCE') {
             <lucide-angular [img]="icons.AlertTriangle" class="h-4 w-4 text-rose-500"></lucide-angular>
             <span class="text-[9px] font-black text-rose-500 uppercase tracking-widest">Fuera de servicio</span>
          } @else {
             <div [class]="cn('h-2.5 w-2.5 rounded-full shadow-lg', getStatusColor(machine.status))"></div>
             <span [class]="cn('text-[9px] font-black uppercase tracking-widest', getStatusClass(machine.status))">
               {{ getStatusText(machine.status) }}
             </span>
          }
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex items-center gap-4">
        <!-- Technical Tag -->
        <div class="h-14 px-6 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 flex flex-col items-center justify-center border border-border/5">
           <lucide-angular [img]="icons.Settings" class="h-3 w-3 text-zinc-300 mb-1"></lucide-angular>
           <span class="text-[7px] font-black text-zinc-400 uppercase tracking-widest leading-none">
             CHIP {{ machine.model?.slice(0,4) || 'V4.2' }}
           </span>
        </div>

        <!-- Main Button -->
        @if (machine.status === 'IDLE') {
          <button
            (click)="onAssign.emit(machine)"
            [disabled]="saving"
            class="flex-1 h-14 rounded-[1.8rem] bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            Asignar Trabajo
          </button>
        } @else {
          <button
            (click)="onRelease.emit(machine)"
            [disabled]="saving"
            class="flex-1 h-14 rounded-[1.8rem] bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            Liberar Unidad
          </button>
        }
      </div>

      <!-- Background Accent -->
      <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
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
