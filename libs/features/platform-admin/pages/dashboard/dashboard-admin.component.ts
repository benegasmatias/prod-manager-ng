import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { LucideAngularModule, Users, Building2, AlertCircle, CheckCircle2, LayoutDashboard, Loader2, ArrowUpRight } from 'lucide-angular';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div class="flex items-center justify-between mb-10">
        <div>
          <h2 class="text-3xl font-black text-white tracking-tight uppercase">Dashboard Administrativo</h2>
          <p class="text-zinc-500 font-bold italic">Estatus global del ecosistema ProdManager.</p>
        </div>
        <div class="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <div class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Sincronizado en Tiempo Real
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <ng-container *ngIf="!loading(); else skeletons">
          <!-- Users Box -->
          <div class="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-xl group hover:border-violet-500/50 transition-all duration-500">
            <div class="flex items-center justify-between mb-6">
                <div class="h-12 w-12 bg-violet-600/10 rounded-2xl flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white text-violet-500 transition-all">
                    <i-lucide name="users" class="h-6 w-6"></i-lucide>
                </div>
                <span class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Global</span>
            </div>
            <span class="text-4xl font-black text-white tabular-nums">{{ stats()?.users?.total || 0 }}</span>
            <div class="flex items-center justify-between mt-2">
                <span class="text-[11px] font-bold text-zinc-500 uppercase tracking-tighter">Usuarios Totales</span>
                <span class="text-[10px] font-black text-emerald-500">+{{ stats()?.users?.active || 0 }} activos</span>
            </div>
          </div>

          <!-- Pending Users -->
          <div class="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-xl group hover:border-amber-500/50 transition-all duration-500">
            <div class="flex items-center justify-between mb-6">
                <div class="h-12 w-12 bg-amber-500/10 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white text-amber-500 transition-all">
                    <i-lucide name="alert-circle" class="h-6 w-6"></i-lucide>
                </div>
                <span class="text-[10px] font-black text-amber-500/50 uppercase tracking-widest">Acción Requerida</span>
            </div>
            <span class="text-4xl font-black text-white tabular-nums">{{ stats()?.users?.pending || 0 }}</span>
            <div class="flex items-center justify-between mt-2">
                <span class="text-[11px] font-bold text-zinc-500 uppercase tracking-tighter">Esperando Aprobación</span>
                <i-lucide name="arrow-up-right" class="h-3 w-3 text-amber-500"></i-lucide>
            </div>
          </div>

          <!-- Businesses -->
          <div class="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-xl group hover:border-blue-500/50 transition-all duration-500">
            <div class="flex items-center justify-between mb-6">
                <div class="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white text-blue-500 transition-all">
                    <i-lucide name="building-2" class="h-6 w-6"></i-lucide>
                </div>
                <span class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tenants</span>
            </div>
            <span class="text-4xl font-black text-white tabular-nums">{{ stats()?.businesses?.total || 0 }}</span>
            <div class="flex items-center justify-between mt-2">
                <span class="text-[11px] font-bold text-zinc-500 uppercase tracking-tighter">Negocios Registrados</span>
                <span class="text-[10px] font-black text-blue-500">{{ stats()?.businesses?.active || 0 }} activos</span>
            </div>
          </div>

          <!-- Crisis Management / Suspended -->
          <div class="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-xl group hover:border-rose-500/50 transition-all duration-500">
            <div class="flex items-center justify-between mb-6">
                <div class="h-12 w-12 bg-rose-500/10 rounded-2xl flex items-center justify-center group-hover:bg-rose-50 group-hover:text-rose-600 text-rose-500 transition-all">
                    <i-lucide name="check-circle-2" class="h-6 w-6"></i-lucide>
                </div>
                <span class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Salud</span>
            </div>
            <span class="text-4xl font-black text-white tabular-nums">{{ stats()?.businesses?.suspended || 0 }}</span>
            <div class="flex items-center justify-between mt-2">
                <span class="text-[11px] font-bold text-zinc-500 uppercase tracking-tighter">Negocios Suspendidos</span>
                <span class="text-[10px] font-black text-rose-500">Check logs</span>
            </div>
          </div>
        </ng-container>

        <ng-template #skeletons>
            <div *ngFor="let i of [1,2,3,4]" class="h-48 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] animate-pulse"></div>
        </ng-template>
      </div>

      <!-- Quick Actions / Mini Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 p-10 bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] backdrop-blur relative overflow-hidden group">
            <div class="relative z-10">
                <h3 class="text-xl font-black text-white uppercase mb-2">Bienvenido, Administrador</h3>
                <p class="text-zinc-500 font-bold max-w-md">Has realizado cambios en el ecosistema recientemente. Revisa los logs de auditoría para asegurar la integridad de las operaciones.</p>
                <div class="flex gap-4 mt-8">
                    <button class="px-6 py-3 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all">Ver Usuarios Pendientes</button>
                    <button class="px-6 py-3 bg-zinc-800 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest border border-zinc-700 hover:bg-zinc-700 transition-all">Reporte de Auditoría</button>
                </div>
            </div>
            <!-- Decorative gradient -->
            <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-violet-600/10 blur-[100px] rounded-full group-hover:bg-violet-600/20 transition-all duration-700"></div>
        </div>

        <div class="p-8 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[2.5rem] text-white shadow-2xl shadow-violet-900/20 relative overflow-hidden group">
            <div class="relative z-10">
                <span class="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 block">Premium Status</span>
                <h3 class="text-2xl font-black mb-4">Planes & Facturación</h3>
                <p class="text-white/80 font-bold mb-8 text-sm leading-relaxed">Configura los límites de los planes y las capacidades por rubro.</p>
                <div class="h-1 dark:bg-black/20 bg-white/20 rounded-full mb-6">
                    <div class="h-full bg-white rounded-full" style="width: 85%"></div>
                </div>
                <button class="w-full py-4 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all">Gestionar Catálogo</button>
            </div>
            <!-- Decorative icon -->
            <i-lucide name="layout-dashboard" class="absolute -top-10 -right-10 h-40 w-40 text-white/5 rotate-12 group-hover:rotate-0 transition-all duration-700"></i-lucide>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class DashboardAdminComponent implements OnInit {
  private adminService = inject(PlatformAdminService);
  
  stats = signal<any>(null);
  loading = signal<boolean>(true);

  async ngOnInit() {
    try {
      this.loading.set(true);
      const data = await this.adminService.getStats();
      this.stats.set(data);
    } catch (e) {
      console.error('Error loading stats', e);
    } finally {
      this.loading.set(false);
    }
  }
}

// Register icons
LucideAngularModule.pick({
    Users, 
    Building2, 
    AlertCircle, 
    CheckCircle2, 
    LayoutDashboard, 
    Loader2,
    ArrowUpRight
});
