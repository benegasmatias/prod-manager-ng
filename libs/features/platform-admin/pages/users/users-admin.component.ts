import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { LucideAngularModule, RefreshCw, Check, Slash, UserX, UserCheck, ShieldAlert, Loader2 } from 'lucide-angular';
import { UserProfile, UserStatus } from '@shared/models';

import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="animate-in fade-in duration-700">
      <div class="flex items-center justify-between mb-10">
        <div>
          <h2 class="text-3xl font-black text-white tracking-tight uppercase">Gestión de Usuarios</h2>
          <p class="text-zinc-500 font-bold italic">Administra el acceso global de los usuarios al ecosistema.</p>
        </div>
        <button 
          (click)="loadUsers()" 
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
            <p class="text-rose-500 font-black uppercase text-xs">Error de Conexión</p>
            <p class="text-rose-400/80 text-xs font-bold">{{ error() }}</p>
        </div>
      </div>

      <div class="bg-zinc-900/50 backdrop-blur rounded-[2rem] border border-zinc-800 p-2 overflow-hidden shadow-2xl">
        <table class="w-full text-left">
          <thead>
            <tr class="text-[10px] uppercase font-black text-zinc-600 tracking-widest border-b border-zinc-800">
              <th class="px-8 py-6">Identidad</th>
              <th class="px-8 py-6">Estatus Global</th>
              <th class="px-8 py-6 text-right">Membresía</th>
              <th class="px-8 py-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800/50">
            <!-- Loading Skeletons -->
            <ng-container *ngIf="loading()">
              <tr *ngFor="let i of [1,2,3,4,5]" class="animate-pulse">
                <td colspan="4" class="px-8 py-8">
                  <div class="h-8 bg-zinc-800/50 rounded-xl w-full"></div>
                </td>
              </tr>
            </ng-container>

            <!-- Real Data -->
            <tr *ngIf="!loading() && users().length === 0">
               <td colspan="4" class="px-8 py-20 text-center text-zinc-600 font-bold uppercase tracking-widest text-xs">
                  No se encontraron usuarios registrados
               </td>
            </tr>

            <tr *ngFor="let user of users()" class="hover:bg-zinc-800/30 transition-all group">
              <td class="px-8 py-6">
                <div class="flex flex-col">
                  <span class="text-[13px] font-black text-zinc-100">{{ user.fullName || 'Sin Nombre' }}</span>
                  <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">{{ user.email }}</span>
                </div>
              </td>
              <td class="px-8 py-6">
                <div 
                  [ngClass]="{
                    'bg-amber-500/10 text-amber-500 border-amber-500/20': user.status === 'PENDING',
                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20': user.status === 'ACTIVE',
                    'bg-rose-500/10 text-rose-500 border-rose-500/20': user.status === 'BLOCKED'
                  }"
                  class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black tracking-widest border flex-shrink-0"
                >
                  <div class="h-1 w-1 rounded-full" [ngClass]="{
                    'bg-amber-500': user.status === 'PENDING',
                    'bg-emerald-500': user.status === 'ACTIVE',
                    'bg-rose-500': user.status === 'BLOCKED'
                  }"></div>
                  {{ user.status }}
                </div>
              </td>
               <td class="px-8 py-6 text-right">
                  <span class="text-[10px] font-black text-violet-400/60 uppercase tracking-widest">
                    {{ user.globalRole }}
                  </span>
              </td>
              <td class="px-8 py-6 text-right">
                <div class="flex items-center justify-end gap-2">
                   <button 
                    *ngIf="user.status === 'PENDING'"
                    (click)="approve(user)"
                    class="h-10 px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20"
                  >
                    Aprobar
                  </button>

                   <button 
                    *ngIf="user.status !== 'BLOCKED'"
                    (click)="block(user)"
                    class="h-10 w-10 flex items-center justify-center bg-zinc-800 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-zinc-700"
                    title="Bloquear"
                  >
                    <i-lucide name="slash" class="h-4 w-4"></i-lucide>
                  </button>

                  <button 
                    *ngIf="user.status === 'BLOCKED'"
                    (click)="approve(user)"
                    class="h-10 px-4 bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 rounded-xl hover:bg-emerald-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Habilitar
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
export class UsersAdminComponent implements OnInit {
  private adminService = inject(PlatformAdminService);
  private toast = inject(ToastService);
  
  users = signal<UserProfile[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const data = await this.adminService.getUsers();
      this.users.set(data);
    } catch (e: any) {
      this.error.set(e.message || 'No se pudieron cargar los usuarios');
    } finally {
      this.loading.set(false);
    }
  }

  async approve(user: UserProfile) {
    if (!confirm(`¿Confirmas la activación de ${user.email}?`)) return;
    
    try {
        await this.adminService.approveUser(user.id);
        this.toast.success(`Usuario ${user.email} aprobado con éxito`);
        this.loadUsers();
    } catch (e: any) {
        this.toast.error('Error al aprobar usuario');
    }
  }

  async block(user: UserProfile) {
    if (!confirm(`¿Estás seguro de que quieres BLOQUEAR el acceso a ${user.email}?`)) return;
    
    try {
      await this.adminService.blockUser(user.id);
      this.toast.warning(`Usuario ${user.email} bloqueado correctamente`);
      this.loadUsers();
    } catch (e: any) {
      this.toast.error('Error al bloquear usuario');
    }
  }
}

// Icon registration
LucideAngularModule.pick({ 
    RefreshCw, 
    Check, 
    Slash, 
    UserX, 
    UserCheck, 
    ShieldAlert, 
    Loader2 
});
