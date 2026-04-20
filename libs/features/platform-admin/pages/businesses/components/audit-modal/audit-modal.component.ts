import { Component, OnInit, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformAdminService } from '../../../../services/platform-admin.service';
import { LucideAngularModule, ShieldAlert, CheckCircle, RefreshCw, Loader2, PlayCircle, Hammer, X } from 'lucide-angular';
import { ToastService } from '../../../../../../shared/services/toast.service';

@Component({
  selector: 'app-audit-capabilities-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" (click)="close.emit()"></div>
      
      <div class="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <!-- Header -->
        <div class="flex items-center justify-between p-8 border-b border-zinc-900 bg-zinc-900/20">
          <div>
            <h3 class="text-xl font-black text-white uppercase tracking-tight">Auditoría de Capacidades</h3>
            <p class="text-zinc-500 text-xs font-bold italic">Sincroniza funciones faltantes sin afectar personalizaciones.</p>
          </div>
          <button (click)="close.emit()" class="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 transition-all">
            <lucide-angular [img]="icons.X" class="h-5 w-5"></lucide-angular>
          </button>
        </div>

        <div class="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <!-- Loading State -->
          <div *ngIf="loading()" class="flex flex-col items-center justify-center py-20 gap-4">
            <lucide-angular [img]="icons.Loader2" class="h-10 w-10 text-primary animate-spin"></lucide-angular>
            <p class="text-zinc-500 font-black uppercase text-[10px] tracking-widest italic">Analizando ecosistema...</p>
          </div>

          <!-- Empty State (No issues found) -->
          <div *ngIf="!loading() && auditItems().length === 0" class="flex flex-col items-center justify-center py-20 gap-4">
            <div class="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <lucide-angular [img]="icons.CheckCircle" class="h-8 w-8 text-emerald-500"></lucide-angular>
            </div>
            <p class="text-zinc-400 font-bold uppercase text-xs">¡Ecosistema alineado! No se encontraron desvíos.</p>
          </div>

          <!-- Audit Table -->
          <table *ngIf="!loading() && auditItems().length > 0" class="w-full text-left">
            <thead>
              <tr class="text-[10px] uppercase font-black text-zinc-600 tracking-widest border-b border-zinc-900">
                <th class="py-4">Negocio</th>
                <th class="py-4">Rubro</th>
                <th class="py-4">Faltantes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-900/50">
              <tr *ngFor="let item of auditItems()" class="group">
                <td class="py-4">
                   <div class="flex flex-col">
                     <span class="text-xs font-black text-zinc-100">{{ item.name }}</span>
                     <span class="text-[10px] text-zinc-500 font-bold">{{ item.businessId.substring(0,8) }}</span>
                   </div>
                </td>
                <td class="py-4">
                   <span class="text-[10px] font-black uppercase text-zinc-500 italic">{{ item.category }}</span>
                </td>
                <td class="py-4">
                   <div class="flex flex-wrap gap-1">
                      <span *ngFor="let cap of item.missing" class="text-[9px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black">
                        {{ cap }}
                      </span>
                   </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Dry Run Results -->
          <div *ngIf="lastRepairs().length > 0" class="mt-8 p-6 bg-violet-500/5 rounded-3xl border border-violet-500/10">
             <h4 class="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-4">Última Accion: {{ isDryRun() ? 'Simulación (Dry Run)' : 'Reparación Ejecutada' }}</h4>
             <div class="space-y-2">
                <div *ngFor="let rep of lastRepairs()" class="flex items-center justify-between text-[11px]">
                   <span class="text-zinc-400 font-bold">{{ rep.name }}</span>
                   <span class="text-emerald-500 font-black uppercase">+{{ rep.added.length }} Caps</span>
                </div>
             </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-8 border-t border-zinc-900 bg-zinc-900/20 flex items-center justify-between gap-4">
          <div class="flex items-center gap-2">
             <lucide-angular [img]="icons.ShieldAlert" class="h-4 w-4 text-zinc-500"></lucide-angular>
             <span class="text-[10px] font-bold text-zinc-500 uppercase italic leading-none">Las personalizaciones se mantienen intactas.</span>
          </div>

          <div class="flex gap-4">
            <button 
              (click)="runRepair(true)" 
              [disabled]="loading() || isProcessing() || auditItems().length === 0"
              class="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-zinc-300 rounded-2xl hover:bg-zinc-700 transition-all text-xs font-black uppercase tracking-widest disabled:opacity-50"
            >
              <lucide-angular [img]="isProcessing() ? icons.Loader2 : icons.PlayCircle" [class.animate-spin]="isProcessing()" class="h-4 w-4"></lucide-angular>
              Simular
            </button>
            <button 
              (click)="runRepair(false)"
              [disabled]="loading() || isProcessing() || auditItems().length === 0"
              class="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl hover:bg-primary-hover transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              <lucide-angular [img]="isProcessing() ? icons.Loader2 : icons.Hammer" [class.animate-spin]="isProcessing()" class="h-4 w-4"></lucide-angular>
              Reparar Todo
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
  `]
})
export class AuditCapabilitiesModalComponent implements OnInit {
  private adminService = inject(PlatformAdminService);
  private toast = inject(ToastService);

  readonly close = output<void>();
  readonly updated = output<void>();

  readonly icons = { ShieldAlert, CheckCircle, RefreshCw, Loader2, PlayCircle, Hammer, X };

  auditItems = signal<any[]>([]);
  lastRepairs = signal<any[]>([]);
  loading = signal<boolean>(true);
  isProcessing = signal<boolean>(false);
  isDryRun = signal<boolean>(true);

  constructor() {
    LucideAngularModule.pick(this.icons);
  }

  ngOnInit() {
    this.loadAudit();
  }

  async loadAudit() {
    try {
      this.loading.set(true);
      const data = await this.adminService.auditCapabilities();
      this.auditItems.set(data);
    } catch (e: any) {
      this.toast.error('Error al ejecutar auditoría');
    } finally {
      this.loading.set(false);
    }
  }

  async runRepair(dryRun: boolean) {
    try {
      this.isProcessing.set(true);
      this.isDryRun.set(dryRun);
      const res: any = await this.adminService.repairCapabilities(undefined, dryRun);
      
      this.lastRepairs.set(res.repairs || []);
      
      if (dryRun) {
        this.toast.info(`Simulación completa: ${res.repairsCount || 0} negocios se verían afectados.`);
      } else {
        this.toast.success(`Reparación masiva completa: ${res.repairsCount || 0} negocios sincronizados.`);
        this.loadAudit();
        this.updated.emit();
      }
    } catch (e: any) {
      this.toast.error('Error durante la reparación');
    } finally {
      this.isProcessing.set(false);
    }
  }
}
