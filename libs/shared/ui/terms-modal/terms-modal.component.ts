import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ShieldCheck, Check, Info } from 'lucide-angular';
import { SessionService } from '@core/session/session.service';
import { ApiService } from '@core/api/api.service';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-terms-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div *ngIf="show()" class="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div class="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 border border-zinc-100 dark:border-zinc-800">
        
        <!-- Header -->
        <div class="px-8 pt-10 pb-6 text-center border-b border-zinc-50 dark:border-zinc-800/50">
          <div class="h-16 w-16 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-600 mx-auto mb-6">
            <lucide-angular [img]="icons.ShieldCheck" class="h-8 w-8"></lucide-angular>
          </div>
          <h2 class="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight uppercase leading-none">Términos y Condiciones</h2>
          <p class="text-zinc-500 dark:text-zinc-400 font-medium text-sm mt-3 leading-relaxed px-12">Por favor, revisa y acepta nuestras políticas actualizadas para continuar.</p>
        </div>

        <!-- Content -->
        <div class="p-8 overflow-y-auto max-h-[50vh] text-sm text-zinc-600 dark:text-zinc-400 space-y-6 scrollbar-hide">
          <section>
            <h3 class="font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-widest text-[10px] mb-3">1. Uso de la Plataforma</h3>
            <p>Al acceder a ProdManager, aceptas utilizar la plataforma de manera ética y profesional para la gestión de tus unidades de producción y pedidos. El sistema está diseñado para un uso exclusivamente comercial.</p>
          </section>

          <section class="p-5 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-900/20">
            <div class="flex gap-4">
              <lucide-angular [img]="icons.Info" class="h-5 w-5 text-purple-600 shrink-0"></lucide-angular>
              <div>
                <h3 class="font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-widest text-[10px] mb-2">Cláusula de Planes</h3>
                <p class="text-zinc-700 dark:text-zinc-300 font-bold leading-relaxed">
                  ProdManager se reserva el derecho de modificar las configuraciones, límites y características de los planes de suscripción (incluyendo planes Free, Pro y Enterprise) en cualquier momento para garantizar la sostenibilidad y mejora continua del servicio.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 class="font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-widest text-[10px] mb-3">2. Privacidad y Datos</h3>
            <p>Tus datos están protegidos bajo protocolos de seguridad industrial. No compartimos tu información comercial, secretos de fabricación o bases de datos de clientes con terceros sin tu consentimiento explícito.</p>
          </section>

          <section>
            <h3 class="font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-widest text-[10px] mb-3">3. Responsabilidad</h3>
            <p>El usuario es responsable de la veracidad de los datos ingresados y del uso compartido de sus credenciales de acceso dentro de su organización.</p>
          </section>
        </div>

        <!-- Footer -->
        <div class="p-8 bg-zinc-50 dark:bg-zinc-800/30 flex flex-col gap-4 border-t border-zinc-100 dark:border-zinc-800">
          <label class="flex items-center gap-3 cursor-pointer group">
            <input 
               type="checkbox" 
               [checked]="accepted()" 
               (change)="accepted.set(!accepted())" 
               class="h-5 w-5 rounded border-zinc-300 text-purple-600 focus:ring-purple-600 cursor-pointer" 
            />
            <span class="text-xs font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">He leído y acepto los términos y condiciones.</span>
          </label>
          
          <button 
            [disabled]="!accepted() || loading()"
            (click)="handleAccept()"
            class="w-full h-14 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-black rounded-2xl hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase text-[11px] tracking-widest flex items-center justify-center gap-2"
          >
            <span *ngIf="loading()" class="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Aceptar y Continuar
          </button>
        </div>
      </div>
    </div>
  `
})
export class TermsAndConditionsModalComponent {
  private session = inject(SessionService);
  private api = inject(ApiService);
  private toast = inject(ToastService);

  show = computed(() => this.session.isInitialized() && this.session.user() && !this.session.user()?.termsAccepted);
  accepted = signal(false);
  loading = signal(false);

  readonly icons = { ShieldCheck, Check, Info };

  async handleAccept() {
    if (!this.accepted()) return;
    
    this.loading.set(true);
    try {
      await this.api.users.acceptTerms();
      await this.session.initialize(); // Refetch user profile to update termsAccepted signal
      this.toast.success('¡Términos aceptados!');
    } catch (error) {
      this.toast.error('Error al procesar la aceptación');
    } finally {
      this.loading.set(false);
    }
  }
}
