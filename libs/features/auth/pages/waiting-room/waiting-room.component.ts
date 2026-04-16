import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth';
import { LucideAngularModule, ShieldCheck, Check, Clock, LogOut, MessageCircle, Mail } from 'lucide-angular';

@Component({
  selector: 'app-waiting-room',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <!-- Background elements for premium feel -->
      <div class="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full"></div>
      
      <div class="max-w-md w-full bg-white dark:bg-zinc-900 rounded-[3rem] shadow-2xl p-12 border border-zinc-100 dark:border-zinc-800 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        
        <!-- Brand Logo & Icon -->
        <div class="mb-10 flex flex-col items-center gap-4">
          <div class="h-20 w-20 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-700 overflow-hidden">
            <img src="assets/logo.png" alt="ProdManager" class="h-12 w-12 object-contain" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-black uppercase tracking-[0.3em] text-primary">ProdManager</span>
            <div class="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
          </div>
        </div>
        
        <h1 class="text-3xl font-black text-zinc-900 dark:text-zinc-50 mb-3 tracking-tight uppercase leading-none">Cuenta en Revisión</h1>
        
        <p class="text-zinc-500 dark:text-zinc-400 font-medium mb-10 leading-relaxed text-sm">
          Tu perfil está siendo auditado. Pronto habilitaremos tu acceso.
        </p>

        <!-- Status Stepper -->
        <div class="bg-slate-50 dark:bg-zinc-950/50 rounded-[2.5rem] p-8 mb-10 text-left border border-zinc-100 dark:border-zinc-800/50 space-y-8 relative">
          <div class="absolute left-[2.45rem] top-12 bottom-12 w-0.5 bg-zinc-200 dark:bg-zinc-800/50 border-dashed border-l"></div>
          
          <div class="flex items-center gap-5 relative z-10">
            <div class="h-10 w-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
               <lucide-angular [img]="icons.Check" class="h-5 w-5"></lucide-angular>
            </div>
            <div>
              <p class="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1.5">Completo</p>
              <p class="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase letter-spacing-tight">Registro de Usuario</p>
            </div>
          </div>
          
          <div class="flex items-center gap-5 relative z-10">
            <div class="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20 animate-pulse">
               <lucide-angular [img]="icons.Clock" class="h-5 w-5"></lucide-angular>
            </div>
            <div>
              <p class="text-[9px] font-black text-primary uppercase tracking-widest leading-none mb-1.5">En Proceso</p>
              <p class="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase letter-spacing-tight">Validación de Perfil</p>
            </div>
          </div>
        </div>

        <!-- Support Actions -->
        <div class="flex flex-col gap-4 mb-10">
          <button 
            (click)="refresh()"
            class="w-full py-5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-black rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 uppercase text-[11px] tracking-widest"
          >
            Actualizar estado
          </button>

          <div class="grid grid-cols-2 gap-4">
            <a 
              href="https://wa.me/5492645656113?text=Hola!%20Acabo%20de%20registrarme%20en%20ProdManager%20y%20espero%20mi%20aprobación." 
              target="_blank"
              class="py-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-black rounded-2xl hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest"
            >
              <lucide-angular [img]="icons.MessageCircle" class="h-4 w-4"></lucide-angular>
              WhatsApp
            </a>
            <a 
              href="mailto:shelter.solutionsdigital@gmail.com?subject=Solicitud de Aprobación ProdManager" 
              class="py-4 bg-primary/10 text-primary border border-primary/20 font-black rounded-2xl hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest"
            >
              <lucide-angular [img]="icons.Mail" class="h-4 w-4"></lucide-angular>
              Email
            </a>
          </div>
        </div>

        <!-- Session Action -->
        <button 
          (click)="logout()"
          class="w-full py-4 bg-transparent text-zinc-400 font-bold rounded-2xl hover:text-rose-500 transition-all flex items-center justify-center gap-2 uppercase text-[9px] tracking-[0.2em]"
        >
          <lucide-angular [img]="icons.LogOut" class="h-3.5 w-3.5"></lucide-angular>
          Cerrar sesión segura
        </button>
      </div>
      
      <p class="mt-10 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
        © 2024 ProdManager • Industrial Solutions
      </p>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class WaitingRoomComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly icons = { ShieldCheck, Check, Clock, LogOut, MessageCircle, Mail };

  constructor() {
    LucideAngularModule.pick(this.icons);
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }

  refresh() {
    window.location.reload();
  }
}
