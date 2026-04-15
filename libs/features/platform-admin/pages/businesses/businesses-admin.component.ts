import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { LucideAngularModule, RefreshCw, Play, Pause, AlertTriangle, ShieldAlert, Loader2, Building, DollarSign } from 'lucide-angular';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-businesses-admin',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="animate-in fade-in duration-700">
      <div class="flex items-center justify-between mb-10">
        <div>
          <h2 class="text-3xl font-black text-white tracking-tight uppercase">Ecosistema de Negocios</h2>
          <p class="text-zinc-500 font-bold italic">Controla los tenants activos, suspendidos y su facturación.</p>
        </div>
        <button 
          (click)="loadBusinesses()" 
          [disabled]="loading()"
          class="p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-all text-zinc-300 disabled:opacity-50"
        >
           <i-lucide [name]="loading() ? 'loader-2' : 'refresh-cw'" [class.animate-spin]="loading()" class="h-5 w-5"></i-lucide>
        </button>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl mb-8 flex items-center gap-4">
        <i-lucide name="shield-alert" class="h-6 w-6 text-rose-500"></i-lucide>
        <div>
            <p class="text-rose-500 font-black uppercase text-xs">Error de Servidor</p>
            <p class="text-rose-400/80 text-xs font-bold">{{ error() }}</p>
        </div>
      </div>

       <div class="bg-zinc-900/50 backdrop-blur rounded-[2rem] border border-zinc-800 p-2 overflow-hidden shadow-2xl">
        <table class="w-full text-left">
          <thead>
            <tr class="text-[10px] uppercase font-black text-zinc-600 tracking-widest border-b border-zinc-800">
              <th class="px-8 py-6">Organización / ID</th>
              <th class="px-8 py-6">Estatus</th>
              <th class="px-8 py-6 text-right">Plan Actual</th>
              <th class="px-8 py-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800/50">
            <!-- Loading Skeletons -->
            <ng-container *ngIf="loading()">
              <tr *ngFor="let i of [1,2,3,4]" class="animate-pulse">
                <td colspan="4" class="px-8 py-8 h-24 bg-zinc-800/20"></td>
              </tr>
            </ng-container>

            <!-- Empty State -->
            <tr *ngIf="!loading() && businesses().length === 0">
               <td colspan="4" class="px-8 py-20 text-center text-zinc-600 font-bold uppercase tracking-widest text-xs">
                  No se encontraron organizaciones registradas
               </td>
            </tr>

            <tr *ngFor="let b of businesses()" class="hover:bg-zinc-800/30 transition-all group">
               <td class="px-8 py-6">
                <div class="flex items-center gap-4">
                  <div class="h-10 w-10 bg-zinc-800 rounded-xl flex items-center justify-center font-black text-zinc-300 shadow-inner group-hover:bg-violet-600 group-hover:text-white transition-all">
                    {{ b.name.substring(0, 1) }}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[13px] font-black text-zinc-100">{{ b.name }}</span>
                    <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter italic">{{ b.category }} • {{ b.id.substring(0, 8) }}</span>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <div 
                  [ngClass]="{
                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20': b.status === 'ACTIVE',
                    'bg-rose-500/10 text-rose-500 border-rose-500/20': b.status === 'SUSPENDED' || b.status === 'BLOCKED',
                    'bg-zinc-500/10 text-zinc-500 border-zinc-500/20': b.status === 'DRAFT'
                  }"
                  class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black tracking-widest border"
                >
                  <div class="h-1 w-1 rounded-full" [ngClass]="{
                    'bg-emerald-500': b.status === 'ACTIVE',
                    'bg-rose-500': b.status === 'SUSPENDED' || b.status === 'BLOCKED',
                    'bg-zinc-500': b.status === 'DRAFT'
                  }"></div>
                  {{ b.status }}
                </div>
              </td>
               <td class="px-8 py-6 text-right">
                 <div class="flex flex-col items-end">
                    <span class="text-[11px] font-black text-zinc-100 uppercase">{{ b.planId || 'GRATIS' }}</span>
                    <span class="text-[9px] font-bold text-zinc-500 tracking-tighter">
                      VENCE: {{ b.subscriptionExpiresAt | date:'dd/MM/yyyy' }}
                    </span>
                  </div>
              </td>
               <td class="px-8 py-6 text-right">
                <div class="flex items-center justify-end gap-2">
                   <button 
                    *ngIf="b.status !== 'ACTIVE'"
                    (click)="updateStatus(b, 'ACTIVE')"
                    class="h-10 px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                  >
                    Reactivar
                  </button>

                  <button 
                    (click)="updateStatus(b, 'SUSPENDED')"
                    *ngIf="b.status === 'ACTIVE'"
                    class="h-10 w-10 flex items-center justify-center bg-zinc-800 text-rose-500 border border-zinc-700 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                    title="Suspender Acceso"
                  >
                    <i-lucide name="pause" class="h-4 w-4"></i-lucide>
                  </button>

                  <button 
                    class="h-10 w-10 flex items-center justify-center bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-xl hover:text-white transition-all"
                    title="Configurar Plan"
                  >
                    <i-lucide name="dollar-sign" class="h-4 w-4"></i-lucide>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
       </div>
    </div>
  `
})
export class BusinessesAdminComponent implements OnInit {
  private adminService = inject(PlatformAdminService);
  private toast = inject(ToastService);
  
  businesses = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadBusinesses();
  }

  async loadBusinesses() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const data = await this.adminService.getBusinesses();
      this.businesses.set(data);
    } catch (e: any) {
      this.error.set(e.message || 'Error al conectar con el servidor');
    } finally {
      this.loading.set(false);
    }
  }

  async updateStatus(business: any, newStatus: string) {
    const action = newStatus === 'ACTIVE' ? 'REACTIVAR' : 'SUSPENDER';
    if (!confirm(`¿Estás seguro de que quieres ${action} el negocio "${business.name}"?`)) return;
    
    try {
      await this.adminService.updateBusinessStatus(business.id, newStatus);
      const msg = newStatus === 'ACTIVE' ? 'reactivado' : 'suspendido';
      this.toast.success(`El negocio "${business.name}" fue ${msg} correctamente`);
      this.loadBusinesses();
    } catch (e: any) {
      this.toast.error('Error al actualizar estado del negocio');
    }
  }
}

// Icon registration
LucideAngularModule.pick({ 
    RefreshCw, 
    Play, 
    Pause, 
    AlertTriangle, 
    ShieldAlert, 
    Loader2, 
    Building, 
    DollarSign 
});
