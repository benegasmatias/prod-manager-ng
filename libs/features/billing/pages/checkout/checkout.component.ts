import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Check, Zap, X, ShieldCheck, Sparkles, Rocket, Diamond, CreditCard, Apple, ArrowRight, ArrowLeft, Lock } from 'lucide-angular';
import { BillingService } from '@core/api/billing.service';
import { ApiService } from '@core/api/api.service';
import { SessionService } from '@core/session/session.service';
import { ToastService } from '@shared/services/toast.service';
import { ButtonSpinnerComponent } from '@shared/ui/button-spinner/button-spinner.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule, ButtonSpinnerComponent],
  template: `
    <div class="min-h-screen bg-bg p-4 sm:p-12 animate-in fade-in duration-700">
      <div class="max-w-6xl mx-auto">
        
        <!-- Editorial Navbar -->
        <div class="flex items-center justify-between mb-20">
          <button (click)="goBack()" class="flex items-center gap-3 text-text-muted hover:text-text transition-all group">
            <div class="h-10 w-10 rounded-full border border-border flex items-center justify-center group-hover:bg-surface-container shadow-sm transition-all">
              <lucide-angular [img]="icons.ArrowLeft" class="h-5 w-5"></lucide-angular>
            </div>
            <span class="text-[10px] font-black uppercase tracking-[0.2em]">Volver</span>
          </button>
          
          <div class="flex items-center gap-12">
            <div class="hidden md:flex items-center gap-16">
                <div class="flex items-center gap-4">
                    <span class="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shadow-xl shadow-primary/20">1</span>
                    <span class="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Resumen</span>
                </div>
                <div class="flex items-center gap-4">
                    <span class="h-6 w-6 rounded-full bg-surface-container text-text-muted flex items-center justify-center text-[10px] font-bold" [ngClass]="{'!bg-primary !text-white !shadow-xl !shadow-primary/20': step() === 2}">2</span>
                    <span class="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted" [ngClass]="{'!text-primary': step() === 2}">Pago</span>
                </div>
            </div>
            <div class="h-10 w-px bg-border hidden sm:block"></div>
            <div class="text-right">
                <p class="text-[8px] font-black uppercase text-text-muted tracking-[0.25em] mb-1">TOTAL MENSUAL</p>
                <p class="text-2xl font-black text-text tracking-tighter">{{ (plan()?.price | currency:plan()?.currency:'symbol':'1.0-0') || '$0' }}</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          
          <!-- Left Column: The Exhibition -->
          <div class="lg:col-span-7 space-y-20">
            
            @if (step() === 1) {
              <!-- Step 1: Editorial Summary -->
              <div class="space-y-16 animate-in slide-in-from-left-8 duration-700">
                <div class="space-y-6">
                    <div class="inline-flex items-center px-4 py-1.5 bg-primary/10 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-primary">DETALLES DE SELECCIÓN</div>
                    <h1 class="text-6xl sm:text-8xl font-black text-text tracking-tight leading-[0.85] uppercase italic font-display">{{ plan()?.name }}</h1>
                </div>

                <div class="p-10 rounded-[3rem] bg-surface-container-low border border-border/5 flex items-center justify-between group transition-all duration-500 hover:bg-surface-container">
                    <div class="flex items-center gap-8">
                        <div class="h-20 w-20 bg-surface rounded-2xl flex items-center justify-center shadow-xl shadow-primary/5 border border-border/5 group-hover:scale-105 transition-transform">
                            <lucide-angular [img]="icons.Rocket" class="h-10 w-10 text-primary"></lucide-angular>
                        </div>
                        <div>
                            <p class="text-base font-medium text-text-muted mb-2">{{ plan()?.description }}</p>
                            <p class="text-5xl font-black text-text tracking-tighter">{{ (plan()?.price | currency:plan()?.currency:'symbol':'1.0-0') || '$0' }} <span class="text-sm font-bold text-text-muted italic">/ mes</span></p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    @for (feat of plan()?.features || []; track $index) {
                      <div class="p-10 rounded-[2rem] bg-surface-container-low border border-border/5 space-y-6 group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 cursor-default">
                        <div class="h-12 w-12 bg-surface rounded-2xl flex items-center justify-center text-text-muted group-hover:text-primary group-hover:bg-primary/5 transition-all">
                            <lucide-angular [img]="icons.Sparkles" class="h-6 w-6"></lucide-angular>
                        </div>
                        <h4 class="text-sm font-black text-text leading-tight uppercase tracking-widest">{{ feat }}</h4>
                      </div>
                    }
                </div>
              </div>
            } @else {
              <!-- Step 2: Payment Architecture -->
              <div class="space-y-16 animate-in slide-in-from-left-8 duration-700">
                <div class="space-y-8">
                    <h1 class="text-6xl sm:text-8xl font-black text-text tracking-tight leading-[0.85] uppercase italic font-display">Acceso <br> <span class="text-primary">Premium.</span></h1>
                    <p class="text-xl text-text-muted font-medium max-w-md leading-relaxed">Únete al círculo de fabricantes eficientes. Experimenta el control absoluto de tu producción.</p>
                </div>

                <div class="p-10 rounded-[2.5rem] bg-surface-container-low border border-border/5 flex items-center justify-between">
                    <div class="flex items-center gap-6">
                         <div class="flex flex-col">
                            <span class="text-[9px] font-black uppercase text-text-muted tracking-[0.3em] mb-2">ORDEN</span>
                            <span class="text-2xl font-black text-text tracking-tight">{{ plan()?.name }}</span>
                         </div>
                    </div>
                    <div class="text-right">
                        <span class="text-4xl font-black text-primary tracking-tighter">{{ (plan()?.price | currency:plan()?.currency:'symbol':'1.0-0') || '$0' }}</span>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div class="p-8 rounded-[2.5rem] border-2 border-primary bg-surface flex items-center justify-between cursor-pointer shadow-xl shadow-primary/10 transition-all active:scale-95">
                        <div class="flex items-center gap-6">
                             <div class="h-12 w-12 bg-sky-50 dark:bg-sky-500/10 rounded-2xl flex items-center justify-center">
                                <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#009EE3"/>
                                    <path d="M14.5 9.5H9.5V14.5H14.5V9.5Z" fill="white"/>
                                </svg>
                             </div>
                             <span class="text-sm font-black text-text uppercase tracking-widest">Mercado Pago</span>
                        </div>
                        <div class="h-6 w-6 rounded-full border-4 border-primary flex items-center justify-center p-1">
                            <div class="w-full h-full bg-primary rounded-full"></div>
                        </div>
                    </div>

                    <div class="p-8 rounded-[2.5rem] bg-surface-container-low flex items-center justify-between cursor-not-allowed opacity-40 border border-border/5">
                        <div class="flex items-center gap-6">
                             <div class="h-12 w-12 bg-surface rounded-2xl flex items-center justify-center">
                                <lucide-angular [img]="icons.CreditCard" class="h-6 w-6 text-text-muted"></lucide-angular>
                             </div>
                             <span class="text-sm font-black text-text-muted uppercase tracking-widest">Tarjeta</span>
                        </div>
                        <div class="h-6 w-6 rounded-full border-2 border-border"></div>
                    </div>
                </div>
              </div>
            }

          </div>

          <!-- Right Column: The Summary Card -->
          <div class="lg:col-span-5 lg:sticky lg:top-12">
            <div class="bg-surface-container-low rounded-[3rem] shadow-2xl shadow-text/5 overflow-hidden relative group border border-border/5">
                <div class="p-10 md:p-14 pb-0">
                    <h3 class="text-3xl font-black text-text tracking-tighter uppercase italic font-display mb-12">Resumen</h3>
                    
                    <div class="space-y-8">
                        <div class="flex items-center justify-between">
                            <span class="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] italic">Subtotal Plan</span>
                            <span class="text-sm text-text font-black tracking-tight">{{ (plan()?.price | currency:plan()?.currency:'symbol':'1.0-0') || '$0' }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] italic">Setup Profesional</span>
                            <span class="text-emerald-500 font-black uppercase text-[10px] tracking-widest italic">Incluido.</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] italic">Impuestos Locales</span>
                            <span class="text-sm text-text font-black tracking-tight">$0</span>
                        </div>
                    </div>

                    <div class="h-px w-full bg-border/10 my-10"></div>

                    <div class="flex items-center justify-between mb-12">
                        <div>
                             <p class="text-[9px] font-black uppercase text-text-muted tracking-[0.4em] mb-2">TOTAL</p>
                             <p class="text-6xl font-black text-text tracking-tighter tabular-nums">{{ (plan()?.price | currency:plan()?.currency:'symbol':'1.0-0') || '$0' }}</p>
                        </div>
                        <div class="px-5 py-2 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.2em] italic">
                            Mensual
                        </div>
                    </div>

                    <!-- The Signature Primary CTA -->
                    <app-button-spinner
                        [loading]="billingService.loading()"
                        (onClick)="nextStep()"
                        btnClass="w-full py-6 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-black text-xs uppercase tracking-[0.25em] shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 active:scale-[0.98] transition-all group"
                    >
                        <span>{{ step() === 1 ? 'Continuar al Pago' : 'Confirmar & Pagar' }}</span>
                        @if (step() === 1) {
                            <lucide-angular [img]="icons.ArrowRight" class="h-5 w-5 transition-transform group-hover:translate-x-2"></lucide-angular>
                        } @else {
                            <lucide-angular [img]="icons.ShieldCheck" class="h-5 w-5"></lucide-angular>
                        }
                    </app-button-spinner>

                    <p class="mt-8 text-[9px] text-text-muted text-center font-bold px-12 leading-relaxed uppercase tracking-[0.1em] italic opacity-60">
                        Seguridad de grado bancario garantizada. <br> Al confirmar, aceptas nuestros términos.
                    </p>
                </div>

                <!-- Surface Decoration (Tonal Layering) -->
                <div class="mt-16 h-32 bg-surface flex items-center justify-center p-8 opacity-60 border-t border-border/5">
                     <div class="flex items-center gap-4">
                        <lucide-angular [img]="icons.Lock" class="h-4 w-4 text-text-muted"></lucide-angular>
                        <span class="text-[9px] font-black uppercase tracking-[0.3em] text-text-muted">Conexión Encriptada SSL</span>
                     </div>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class CheckoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private session = inject(SessionService);
  billingService = inject(BillingService);

  readonly icons = { ArrowLeft, ArrowRight, Check, Zap, X, ShieldCheck, Sparkles, Rocket, Diamond, CreditCard, Apple, Lock };

  planId = signal<string | null>(null);
  plan = signal<any>(null);
  step = signal<number>(1);

  async ngOnInit() {
    this.planId.set(this.route.snapshot.queryParamMap.get('plan'));
    if (!this.planId()) {
      this.toast.error('No se seleccionó un plan');
      this.router.navigate(['/billing']);
      return;
    }

    await this.loadPlanData();
  }

  async loadPlanData() {
    try {
      // 1. Try fetching with category
      const rubro = this.session.rubro();
      let plans = await this.api.businesses.billing.getPlans(rubro || undefined);
      let found = plans.find((p: any) => p.id === this.planId());

      // 2. Fallback: Try all plans if not found in category
      if (!found) {
        plans = await this.api.businesses.billing.getPlans();
        found = plans.find((p: any) => p.id === this.planId());
      }

      // 3. Last Resort: Check hardcoded catalog
      if (!found) {
        const fallbackCatalog = [
          {
            id: 'free-3d',
            name: 'Free por Siempre',
            price: 8900, // Matching Taller Inicial as in user screenshot
            description: 'Ideal para hobbistas y makers solitarios.',
            currency: 'ARS',
            features: ['30 pedidos / mes', '1 impresora', '1 Usuario', 'Smart Dashboard']
          },
          {
            id: 'pro-3d',
            name: 'Taller Inicial',
            price: 8900,
            description: 'Para pequeños talleres que empiezan a crecer.',
            currency: 'ARS',
            features: ['60 pedidos / mes', '2 impresoras', '2 Usuarios', 'Control de materiales', 'Soporte prioritario']
          },
          {
            id: 'business-3d',
            name: 'Pequeñas Granja Produccion',
            price: 29500,
            description: 'Control total y escalabilidad para fábricas de gran escala.',
            currency: 'ARS',
            features: ['Pedidos ilimitados', '5 impresoras', '5 Usuarios', 'Reportes avanzados', 'Soporte prioritario']
          }
        ];
        found = fallbackCatalog.find(p => p.id === this.planId());
      }
      
      if (found) {
        this.plan.set(found);
      } else {
        this.toast.error('Plan no válido');
        this.router.navigate(['/billing']);
      }
    } catch (e) {
      this.toast.error('Error al cargar datos del plan');
    }
  }

  goBack() {
    if (this.step() === 2) {
      this.step.set(1);
    } else {
      this.router.navigate(['/ajustes']);
    }
  }

  async nextStep() {
    if (this.step() === 1) {
      this.step.set(2);
      window.scrollTo(0, 0);
    } else {
      await this.processPayment();
    }
  }

  async processPayment() {
    const currentPlan = this.plan();
    if (!currentPlan) return;

    try {
      await this.billingService.startCheckout(
        currentPlan.id, 
        currentPlan.price, 
        `Suscripción Plan ${currentPlan.name}`,
        this.session.user()?.email || ''
      );
    } catch (error: any) {
      this.toast.error(error.message || 'Error al iniciar pago');
    }
  }
}
