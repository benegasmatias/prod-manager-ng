import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-businesses-admin',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-10">
        <div>
          <h2 class="text-3xl font-black text-white tracking-tight">Ecosistema de Negocios</h2>
          <p class="text-zinc-500 font-bold">Controla los tenants activos, suspendidos y su facturación.</p>
        </div>
        <button (click)="loadBusinesses()" class="p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-all text-zinc-300">
           <i-lucide name="refresh-cw" class="h-5 w-5"></i-lucide>
        </button>
      </div>

       <div class="bg-zinc-900/50 backdrop-blur rounded-3xl border border-zinc-800 p-2 overflow-hidden shadow-2xl">
        <table class="w-full text-left">
          <thead>
            <tr class="text-[10px] uppercase font-black text-zinc-600 tracking-widest border-b border-zinc-800">
              <th class="px-6 py-5">Negocio / Dueño</th>
              <th class="px-6 py-5">Estatus</th>
              <th class="px-6 py-5">Rubro</th>
              <th class="px-6 py-5">Plan / Vencimiento</th>
              <th class="px-6 py-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800">
            <tr *ngFor="let b of businesses()" class="hover:bg-zinc-800/30 transition-all group">
               <td class="px-6 py-5">
                <div class="flex items-center gap-3">
                  <div class="h-8 w-8 bg-zinc-800 rounded-lg flex items-center justify-center font-black text-zinc-100">
                    {{ b.name.substring(0, 1) }}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm font-black text-zinc-100">{{ b.name }}</span>
                    <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">ID: {{ b.id.substring(0, 8) }}...</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-5">
                <span 
                  [ngClass]="{
                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20': b.status === 'ACTIVE',
                    'bg-rose-500/10 text-rose-500 border-rose-500/20': b.status === 'SUSPENDED' || b.status === 'BLOCKED',
                    'bg-zinc-500/10 text-zinc-500 border-zinc-500/20': b.status === 'DRAFT'
                  }"
                  class="px-3 py-1 rounded-full text-[10px] font-black tracking-widest border"
                >
                  {{ b.status }}
                </span>
              </td>
              <td class="px-6 py-5">
                  <span class="text-xs font-black text-violet-400 opacity-60 group-hover:opacity-100 transition-all">
                    {{ b.category }}
                  </span>
              </td>
               <td class="px-6 py-5">
                 <div class="flex flex-col">
                    <span class="text-xs font-black text-zinc-200 capitalize">{{ b.planId || 'Gratis' }}</span>
                    <span class="text-[10px] font-bold text-zinc-500 tracking-tighter">
                      Vence: {{ b.subscriptionExpiresAt | date:'shortDate' }}
                    </span>
                  </div>
              </td>
               <td class="px-6 py-5 text-right">
                <div class="flex items-center justify-end gap-2">
                   <button 
                    *ngIf="b.status === 'SUSPENDED'"
                    (click)="updateStatus(b.id, 'ACTIVE')"
                    class="h-9 w-9 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 flex items-center justify-center transition-all shadow-lg shadow-emerald-900/10"
                    title="Suspender"
                  >
                    <i-lucide name="play" class="h-4 w-4"></i-lucide>
                  </button>

                  <button 
                    (confirm)="updateStatus(b.id, 'SUSPENDED')"
                    *ngIf="b.status === 'ACTIVE'"
                    class="h-9 w-9 bg-zinc-800 text-rose-500 border border-rose-900/50 rounded-xl hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all shadow-lg"
                    title="Suspender"
                  >
                    <i-lucide name="pause" class="h-4 w-4"></i-lucide>
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
  businesses = signal<any[]>([]);

  ngOnInit() {
    this.loadBusinesses();
  }

  async loadBusinesses() {
    const data = await this.adminService.getBusinesses();
    this.businesses.set(data);
  }

  async updateStatus(id: string, status: string) {
    await this.adminService.updateBusinessStatus(id, status);
    this.loadBusinesses();
  }
}
