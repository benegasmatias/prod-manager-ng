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
    <div class="bg-surface-container-low rounded-[3rem] p-10 shadow-2xl shadow-text/5 h-full relative overflow-hidden group">
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>

      <div class="flex items-center gap-6 mb-12 px-2 relative z-10">
        <h3 class="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted/40 italic">Arquitectura de Componentes</h3>
        <div class="h-px flex-1 bg-border/5"></div>
      </div>

      <div class="space-y-4">
        @for (item of items(); track item.id) {
          <div class="p-8 rounded-[2.5rem] bg-surface-container-lowest shadow-2xl shadow-text/5 transition-all duration-700 hover:shadow-text/10 group/item relative z-10">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div class="flex items-start gap-6">
                <div class="h-16 w-16 rounded-[1.5rem] bg-surface flex items-center justify-center text-text-muted/20 shadow-inner transition-all group-hover/item:scale-110 group-hover/item:text-primary">
                  <lucide-angular [img]="icons.Package" class="h-8 w-8 transition-colors"></lucide-angular>
                </div>
                <div class="space-y-2">
                  <p class="text-xl font-black text-text tracking-tighter leading-none uppercase italic">{{ item.name || item.nombreProducto }}</p>
                  <div class="flex flex-wrap gap-4 pt-1 items-center">
                    <app-status-badge [status]="item.status"></app-status-badge>
                    <span class="text-[9px] font-black uppercase tracking-[0.4em] px-4 py-1 bg-surface rounded-full text-text-muted/60 italic">
                      Volumen: {{ item.qty || item.cantidad }} UN.
                    </span>
                    @if (item.metadata?.['material']) {
                      <span class="text-[9px] font-black uppercase tracking-[0.4em] px-4 py-1 bg-primary/5 text-primary rounded-full italic">
                        Matriz: {{ item.metadata?.['material'] }}
                      </span>
                    }
                  </div>
                </div>
              </div>
              
              <div class="text-right flex flex-col justify-center">
                <p class="text-3xl font-black text-text tracking-tighter tabular-nums leading-none">
                  {{ ((item.price || item.unitPrice || item.precioUnitario || 0) * (item.qty || item.cantidad || 1)) | currency:'':'symbol':'1.0-0' }}
                </p>
                <p class="text-[8px] font-black text-text-muted/30 uppercase tracking-[0.4em] leading-none mt-2 italic">Impacto Financiero</p>
              </div>
            </div>

            <!-- OPERATIVE PROTOCOL (Job Details) -->
            @if (item.job) {
              <div class="mt-8 p-6 rounded-[2rem] bg-surface border border-primary/5 animate-in fade-in slide-in-from-top-2 duration-1000">
                <div class="flex items-center justify-between gap-6">
                  <div class="flex items-center gap-6">
                    <div class="h-12 w-12 rounded-[1rem] bg-primary/10 flex items-center justify-center shadow-inner">
                       <lucide-angular [img]="icons.Cog" class="h-6 w-6 text-primary"></lucide-angular>
                    </div>
                    <div class="space-y-1">
                      <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary/40 leading-none italic">Estadio Operativo</p>
                      <p class="text-xs font-black text-primary uppercase tracking-widest">{{ item.job.currentStage || 'PROTOCOLO PENDIENTE' }}</p>
                    </div>
                  </div>

                  <div class="flex gap-10">
                    @if (item.job.responsable) {
                      <div class="hidden sm:flex items-center gap-4 pr-10 border-r border-border/5">
                         <lucide-angular [img]="icons.User" class="h-4 w-4 text-text-muted/20"></lucide-angular>
                         <div class="text-left space-y-1">
                           <p class="text-[8px] font-black uppercase tracking-[0.4em] text-text-muted/40 leading-none italic">Asignado</p>
                           <p class="text-[11px] font-black text-text uppercase tracking-widest">{{ item.job.responsable.firstName }} {{ item.job.responsable.lastName }}</p>
                         </div>
                      </div>
                    }

                    @if (item.job.machine) {
                      <div class="hidden sm:flex items-center gap-4">
                         <lucide-angular [img]="icons.Monitor" class="h-4 w-4 text-text-muted/20"></lucide-angular>
                         <div class="text-left space-y-1">
                           <p class="text-[8px] font-black uppercase tracking-[0.4em] text-text-muted/40 leading-none italic">Puesto / Terminal</p>
                           <p class="text-[11px] font-black text-text uppercase tracking-widest">{{ item.job.machine.name }}</p>
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

            @if (item.referenceImages && item.referenceImages.length > 0) {
              <div class="mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                @for (img of item.referenceImages; track $index) {
                   <div class="h-16 w-16 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden flex-shrink-0 group/img cursor-pointer relative bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <img [src]="img.path || img.url || img" 
                           (error)="handleImageError($event)"
                           class="h-full w-full object-cover transition-transform group-hover/img:scale-110" />
                      <lucide-angular [img]="icons.Package" class="h-6 w-6 text-zinc-200 dark:text-zinc-700 absolute m-auto z-0"></lucide-angular>
                      <div class="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity z-10"></div>
                   </div>
                }
              </div>
            }

            @if (item.descripcion || item.stlUrl) {
              <div class="mt-8 pt-8 border-t border-border/5 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                <div class="flex-1 space-y-3">
                  <div class="flex items-center gap-3">
                    <lucide-angular [img]="icons.Info" class="h-3 w-3 text-text-muted/20"></lucide-angular>
                    <p class="text-[9px] font-black uppercase text-text-muted/40 tracking-[0.4em] leading-none italic">Manifiesto Técnico</p>
                  </div>
                  <p class="text-xs text-text-muted/60 font-bold leading-relaxed uppercase tracking-tight italic">{{ item.description || item.descripcion || 'Sin descripción técnica adicional.' }}</p>
                </div>

                @if (item.stlUrl) {
                  <a [href]="item.stlUrl" target="_blank" class="h-12 px-6 rounded-2xl bg-text text-surface text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-3 hover:scale-105 transition-all active:scale-95 no-underline shadow-2xl shadow-text/10 italic">
                     <lucide-angular [img]="icons.Monitor" class="h-3 w-3"></lucide-angular> Acceder STL
                  </a>
                }
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

  handleImageError(event: any) {
    event.target.style.display = 'none';
  }
}
