import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-billing-status',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950">
      <div class="max-w-md w-full text-center space-y-8 p-12 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl">
        
        @if (status === 'success') {
          <div class="mx-auto w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 class="text-3xl font-black text-zinc-900 dark:text-white leading-tight">¡Pago Exitoso!</h1>
          <p class="text-zinc-500 dark:text-zinc-400">
            Tu suscripción ha sido actualizada. En unos instantes verás los cambios reflejados en tu panel.
          </p>
        } @else if (status === 'failure') {
          <div class="mx-auto w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 class="text-3xl font-black text-zinc-900 dark:text-white leading-tight">Pago Fallido</h1>
          <p class="text-zinc-500 dark:text-zinc-400">
            No pudimos procesar tu pago. Por favor, intentá nuevamente con otro medio de pago.
          </p>
        } @else {
          <div class="mx-auto w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 class="text-3xl font-black text-zinc-900 dark:text-white leading-tight">Pago Pendiente</h1>
          <p class="text-zinc-500 dark:text-zinc-400">
            Estamos esperando la confirmación de Mercado Pago. Te notificaremos apenas se acredite.
          </p>
        }

        <div class="pt-4">
          <button 
            routerLink="/dashboard" 
            class="w-full py-4 px-8 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold rounded-2xl hover:scale-[1.02] transition-transform shadow-lg"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  `
})
export class StatusComponent implements OnInit {
  private route = inject(ActivatedRoute);
  status: 'success' | 'failure' | 'pending' = 'success';

  ngOnInit() {
    this.status = this.route.snapshot.data['status'] || 'success';
  }
}
