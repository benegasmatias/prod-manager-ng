import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-waiting-room',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
      <div class="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-zinc-100">
        <div class="mb-8 flex justify-center">
          <div class="h-20 w-20 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 animate-pulse">
            <i-lucide name="shield-check" class="h-10 w-10"></i-lucide>
          </div>
        </div>
        
        <h1 class="text-2xl font-black text-zinc-900 mb-4 tracking-tight">Su cuenta está bajo revisión</h1>
        
        <p class="text-zinc-500 font-medium mb-8 leading-relaxed">
          ¡Gracias por unirte a ProdManager! Un administrador revisará tu perfil en breve para habilitar tu acceso a la plataforma.
        </p>

        <div class="bg-zinc-50 rounded-2xl p-6 mb-8 text-left border border-zinc-100">
          <div class="flex items-start gap-4 mb-4">
            <div class="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
               <i-lucide name="check" class="h-3 w-3"></i-lucide>
            </div>
            <p class="text-sm font-semibold text-zinc-700">Registro completado exitosamente</p>
          </div>
          <div class="flex items-start gap-4">
            <div class="h-6 w-6 rounded-full bg-violet-600 text-white flex items-center justify-center flex-shrink-0 animate-spin">
               <i-lucide name="clock" class="h-3 w-3"></i-lucide>
            </div>
            <p class="text-sm font-semibold text-zinc-700">Esperando aprobación del administrador</p>
          </div>
        </div>

        <div class="flex flex-col gap-3">
           <button 
            (click)="logout()"
            class="w-full py-4 px-6 bg-zinc-900 text-white font-black rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-zinc-200"
          >
            <i-lucide name="log-out" class="h-5 w-5"></i-lucide>
            Cerrar sesión
          </button>
          
          <button 
            (click)="refresh()"
            class="w-full py-4 px-6 bg-white text-zinc-600 font-black rounded-2xl border border-zinc-200 hover:bg-zinc-50 transition-all"
          >
            Actualizar estado
          </button>
        </div>
      </div>
      
      <p class="mt-8 text-zinc-400 text-sm font-medium">
        ¿Necesitas ayuda inmediata? 
        <a href="mailto:shelter.solutionsdigital@gmail.com" class="text-violet-600 hover:underline">Contactar soporte</a>
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

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }

  refresh() {
    window.location.reload();
  }
}
