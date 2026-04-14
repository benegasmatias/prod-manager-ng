import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Tag, Package, Info, AlertCircle, Cog, User, Monitor } from 'lucide-angular';
import { ItemPedido } from '@shared/models';
import { StatusBadgeComponent } from '@shared/ui/badges/status-badge.component';

@Component({
  selector: 'app-order-items-widget',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, StatusBadgeComponent],
  template: `
    <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-8 shadow-sm h-full">
      <div class="flex items-center gap-3 mb-8 px-2">
        <lucide-angular [img]="icons.Tag" class="h-4 w-4 text-zinc-300"></lucide-angular>
        <h3 class="text-xs font-black uppercase tracking-widest text-zinc-400">Especificaciones de la Orden</h3>
        <div class="h-px flex-1 bg-zinc-100 dark:bg-zinc-800"></div>
      </div>

      <div class="space-y-4">
        @for (item of items(); track item.id) {
          <div class="p-6 rounded-[2rem] bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 hover:border-primary/20 transition-all group">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div class="flex items-start gap-4">
                <div class="h-14 w-14 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-400 shadow-sm transition-all group-hover:scale-105 group-hover:ring-1 group-hover:ring-primary/20">
                  <lucide-angular [img]="icons.Package" class="h-6 w-6 text-zinc-300 group-hover:text-primary transition-colors"></lucide-angular>
                </div>
                <div class="space-y-1">
                  <p class="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">{{ item.name || item.nombreProducto }}</p>
                  <div class="flex flex-wrap gap-2 pt-1 items-center">
                    <app-status-badge [status]="item.status"></app-status-badge>
                    <span class="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700 text-zinc-400">
                      Cantidad: {{ item.qty || item.cantidad }} u.
                    </span>
                    @if (item.metadata?.['material']) {
                      <span class="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-primary/5 text-primary rounded-lg border border-primary/10">
                        Doc: {{ item.metadata?.['material'] }}
                      </span>
                    }
                  </div>
                </div>
              </div>
              
              <div class="text-right flex flex-col justify-center">
                <p class="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter">
                  {{ ((item.price || item.unitPrice || item.precioUnitario || 0) * (item.qty || item.cantidad || 1)) | currency:'ARS' }}
                </p>
                <p class="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mt-1">Subtotal Item</p>
              </div>
            </div>

            <!-- BLOQUE DE PRODUCCIÓN (Phase 6.1) -->
            @if (item.job) {
              <div class="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-1000">
                <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-4">
                    <div class="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                       <lucide-angular [img]="icons.Cog" class="h-5 w-5 text-primary"></lucide-angular>
                    </div>
                    <div class="space-y-0.5">
                      <p class="text-[10px] font-black uppercase tracking-widest text-primary/60 leading-none">Etapa Actual</p>
                      <p class="text-xs font-black text-primary uppercase">{{ item.job.currentStage || 'PENDIENTE' }}</p>
                    </div>
                  </div>

                  <div class="flex gap-8">
                    @if (item.job.responsable) {
                      <div class="hidden sm:flex items-center gap-3 pr-8 border-r border-primary/10">
                         <lucide-angular [img]="icons.User" class="h-4 w-4 text-primary/40"></lucide-angular>
                         <div class="text-left">
                           <p class="text-[9px] font-black uppercase tracking-widest text-primary/50 leading-none">Asignado</p>
                           <p class="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">{{ item.job.responsable.firstName }} {{ item.job.responsable.lastName }}</p>
                         </div>
                      </div>
                    }

                    @if (item.job.machine) {
                      <div class="hidden sm:flex items-center gap-3">
                         <lucide-angular [img]="icons.Monitor" class="h-4 w-4 text-primary/40"></lucide-angular>
                         <div class="text-left">
                           <p class="text-[9px] font-black uppercase tracking-widest text-primary/50 leading-none">Máquina / Puesto</p>
                           <p class="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">{{ item.job.machine.name }}</p>
                         </div>
                      </div>
                    }

                    <div class="flex items-center gap-3">
                      <app-status-badge [status]="item.job.status"></app-status-badge>
                    </div>
                  </div>
                </div>
              </div>
            }

            @if (item.descripcion) {
              <div class="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <div class="flex items-center gap-2 mb-2">
                  <lucide-angular [img]="icons.Info" class="h-3 w-3 text-zinc-400"></lucide-angular>
                  <p class="text-[9px] font-black uppercase text-zinc-400 tracking-widest leading-none">Requerimientos Técnicos</p>
                </div>
                <p class="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">{{ item.description || item.descripcion }}</p>
              </div>
            }
          </div>
        } @empty {
          <div class="py-16 text-center space-y-4 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-[2rem] border-2 border-dashed border-zinc-100 dark:border-zinc-800">
            <div class="h-16 w-16 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center mx-auto shadow-sm">
               <lucide-angular [img]="icons.AlertCircle" class="h-6 w-6 text-zinc-200"></lucide-angular>
            </div>
            <p class="text-xs font-black text-zinc-400 uppercase tracking-widest">No hay items registrados en esta orden</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class OrderItemsWidgetComponent {
  items = input.required<ItemPedido[]>();

  icons = {
    Tag, Package, Info, AlertCircle, Cog, User, Monitor
  };
}
