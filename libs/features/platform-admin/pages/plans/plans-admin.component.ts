import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-plans-admin',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="animate-in fade-in duration-700">
      <div class="flex items-center justify-between mb-10">
        <div>
          <h2 class="text-3xl font-black text-white tracking-tight uppercase">Catálogo de Planes</h2>
          <p class="text-zinc-500 font-bold italic">Configura las capacidades y precios de las suscripciones.</p>
        </div>
      </div>

      <div class="p-20 bg-zinc-900/50 border border-zinc-800 rounded-[3rem] text-center flex flex-col items-center justify-center">
          <div class="h-20 w-20 bg-zinc-800 rounded-3xl flex items-center justify-center text-zinc-500 mb-6 border border-zinc-700">
              <i-lucide name="credit-card" class="h-10 w-10"></i-lucide>
          </div>
          <h3 class="text-xl font-black text-white uppercase mb-2">Módulo en Construcción</h3>
          <p class="text-zinc-500 font-bold max-w-sm">Estamos trabajando en la interfaz de gestión de planes para el próximo ciclo de despliegue.</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlansAdminComponent {}
