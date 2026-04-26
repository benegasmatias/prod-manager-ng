import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, ShieldAlert, CreditCard, Mail, LogOut, ArrowRight, Sparkles } from 'lucide-angular';
import { SessionService } from '@core/session/session.service';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-subscription-expired',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Background Decorations -->
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none opacity-50"></div>
      <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none opacity-30"></div>
      
      <div class="max-w-xl w-full relative z-10">
        <!-- Main Card -->
        <div class="bg-zinc-900/50 backdrop-blur-2xl border border-zinc-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl text-center space-y-8 animate-in fade-in zoom-in duration-700">
          
          <!-- Icon Header -->
          <div class="flex justify-center">
            <div class="h-20 w-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 relative group">
              <lucide-angular [img]="icons.ShieldAlert" class="h-10 w-10 group-hover:scale-110 transition-transform duration-500"></lucide-angular>
              <div class="absolute inset-0 bg-rose-500 blur-2xl opacity-20 animate-pulse"></div>
            </div>
          </div>

          <!-- Text content -->
          <div class="space-y-3">
            <h1 class="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic">Membresía Vencida</h1>
            <p class="text-zinc-400 font-bold leading-relaxed">
              El periodo de suscripción de <span class="text-primary">{{ businessName() }}</span> ha finalizado. 
              Para continuar gestionando tus pedidos y producción, es necesario renovar tu plan.
            </p>
          </div>

          <!-- Feature Recap (What they are missing) -->
          <div class="grid grid-cols-2 gap-3 py-6 border-y border-zinc-800/50">
             <div class="flex items-center gap-3 px-4 py-3 bg-zinc-800/30 rounded-2xl border border-zinc-800">
                <lucide-angular [img]="icons.Sparkles" class="h-4 w-4 text-primary"></lucide-angular>
                <span class="text-[10px] font-black uppercase text-zinc-300 tracking-wider">Control Total</span>
             </div>
             <div class="flex items-center gap-3 px-4 py-3 bg-zinc-800/30 rounded-2xl border border-zinc-800 text-left">
                <lucide-angular [img]="icons.CreditCard" class="h-4 w-4 text-emerald-500"></lucide-angular>
                <span class="text-[10px] font-black uppercase text-zinc-300 tracking-wider">Facturación</span>
             </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-4 pt-4">
             <button 
              class="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 hover:bg-primary/90 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
              (click)="contactSales()"
             >
                <lucide-angular [img]="icons.CreditCard" class="h-4 w-4"></lucide-angular>
                Contactar Ventas
                <lucide-angular [img]="icons.ArrowRight" class="h-4 w-4 group-hover:translate-x-1 transition-transform"></lucide-angular>
             </button>

             <div class="grid grid-cols-2 gap-3">
               <button 
                class="py-4 bg-zinc-800 text-zinc-400 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-all flex items-center justify-center gap-2"
                (click)="logout()"
               >
                  <lucide-angular [img]="icons.LogOut" class="h-3.5 w-3.5"></lucide-angular>
                  Cerrar Sesión
               </button>
               
               <button 
                class="py-4 bg-zinc-800 text-zinc-400 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-all flex items-center justify-center gap-2"
                (click)="changeBusiness()"
               >
                  Cambiar Negocio
               </button>
             </div>
          </div>

          <p class="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            ¿Tenés dudas? escribinos a <a href="mailto:soporte@prodmanager.com.ar" class="text-primary hover:underline">Soporte técnico</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class SubscriptionExpiredComponent {
  private session = inject(SessionService);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly icons = { ShieldAlert, CreditCard, Mail, LogOut, ArrowRight, Sparkles };

  businessName = () => this.session.activeNegocio()?.nombre || 'tu negocio';

  contactSales() {
    window.open('https://wa.me/5492641234567?text=Hola! Mi suscripción en ProdManager venció y quiero renovarla.', '_blank');
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }

  changeBusiness() {
    this.router.navigate(['/select-business']);
  }
}
