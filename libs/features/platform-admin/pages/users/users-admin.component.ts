import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { LucideAngularModule } from 'lucide-angular';
import { UserProfile } from '@shared/models';

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-10">
        <div>
          <h2 class="text-3xl font-black text-white tracking-tight">Gestión de Usuarios</h2>
          <p class="text-zinc-500 font-bold">Administra el acceso global de los usuarios al sistema.</p>
        </div>
        <button (click)="loadUsers()" class="p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-all text-zinc-300">
           <i-lucide name="refresh-cw" class="h-5 w-5"></i-lucide>
        </button>
      </div>

      <div class="bg-zinc-900/50 backdrop-blur rounded-3xl border border-zinc-800 p-2 overflow-hidden shadow-2xl">
        <table class="w-full text-left">
          <thead>
            <tr class="text-[10px] uppercase font-black text-zinc-600 tracking-widest border-b border-zinc-800">
              <th class="px-6 py-5">Usuario</th>
              <th class="px-6 py-5">Estatus</th>
              <th class="px-6 py-5">Rol Global</th>
              <th class="px-6 py-5">Registrado</th>
              <th class="px-6 py-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800">
            <tr *ngFor="let user of users()" class="hover:bg-zinc-800/30 transition-all group">
              <td class="px-6 py-5">
                <div class="flex flex-col">
                  <span class="text-sm font-black text-zinc-100">{{ user.fullName || user.email }}</span>
                  <span class="text-xs font-bold text-zinc-500">{{ user.email }}</span>
                </div>
              </td>
              <td class="px-6 py-5">
                <span 
                  [ngClass]="{
                    'bg-amber-500/10 text-amber-500 border-amber-500/20': user.status === 'PENDING',
                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20': user.status === 'ACTIVE',
                    'bg-rose-500/10 text-rose-500 border-rose-500/20': user.status === 'BLOCKED'
                  }"
                  class="px-3 py-1 rounded-full text-[10px] font-black tracking-widest border"
                >
                  {{ user.status }}
                </span>
              </td>
               <td class="px-6 py-5">
                  <span class="text-xs font-black text-violet-400 opacity-60 group-hover:opacity-100 transition-all">
                    {{ user.globalRole }}
                  </span>
              </td>
               <td class="px-6 py-5">
                  <span class="text-xs font-bold text-zinc-500">
                    {{ user.createdAt | date:'shortDate' }}
                  </span>
              </td>
              <td class="px-6 py-5 text-right">
                <div class="flex items-center justify-end gap-2">
                   <button 
                    *ngIf="user.status === 'PENDING'"
                    (click)="approve(user.id)"
                    class="h-9 w-9 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 flex items-center justify-center transition-all shadow-lg shadow-emerald-900/10"
                    title="Aprobar"
                  >
                    <i-lucide name="check" class="h-4 w-4"></i-lucide>
                  </button>

                   <button 
                    *ngIf="user.status !== 'BLOCKED'"
                    (click)="block(user.id)"
                    class="h-9 w-9 border border-rose-900/50 bg-rose-950/20 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all"
                    title="Bloquear"
                  >
                    <i-lucide name="slash" class="h-4 w-4"></i-lucide>
                  </button>
                  
                  <span *ngIf="user.status === 'ACTIVE'" class="text-[10px] font-black text-emerald-500">APROBADO</span>
                </div>
              </td>
            </tr>
            <tr *ngIf="users().length === 0">
               <td colspan="5" class="px-6 py-10 text-center text-zinc-600 font-bold uppercase tracking-widest text-xs">
                  Cargando usuarios...
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
  users = signal<any[]>([]);

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    const data = await this.adminService.getUsers();
    this.users.set(data);
  }

  async approve(id: string) {
    await this.adminService.approveUser(id);
    this.loadUsers();
  }

  async block(id: string) {
    if (confirm('¿Seguro quieres bloquear este usuario?')) {
      await this.adminService.blockUser(id);
      this.loadUsers();
    }
  }
}
