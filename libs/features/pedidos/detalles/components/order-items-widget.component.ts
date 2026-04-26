import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Tag, Package, Info, AlertCircle, Cog, User, Monitor } from 'lucide-angular';
import { ItemPedido } from '@shared/models';
import { StatusBadgeComponent } from '@shared/ui/badges/status-badge.component';

@Component({
  selector: 'app-order-items-widget',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="space-y-6 animate-in fade-in duration-700">
      @for (item of items(); track item.id) {
        <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-text/5 border border-zinc-100 dark:border-zinc-800 transition-all hover:scale-[1.01] duration-500 group">
          <!-- Image Section -->
          <div class="relative h-64 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
             <img [src]="item.referenceImages?.[0]?.path || item.referenceImages?.[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'" 
                  class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
             
             <!-- Overlay Badge -->
             <div class="absolute top-6 left-6">
                <span class="px-4 py-1.5 bg-black/60 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-[0.3em] rounded-full border border-white/20 italic">
                   {{ item.status || 'EDICIÓN LIMITADA' }}
                </span>
             </div>
             
             <!-- Gradient Overlay -->
             <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>

          <!-- Content Section -->
          <div class="p-8 space-y-6">
             <div class="space-y-2">
                <h3 class="text-2xl font-black text-text tracking-tighter uppercase leading-tight italic">{{ item.name || item.nombreProducto }}</h3>
                <p class="text-xs text-text-muted/60 font-bold uppercase tracking-tight italic line-clamp-2">
                  {{ item.description || item.descripcion || 'Impresión Giclée sobre bastidor de madera maciza.' }}
                </p>
             </div>

             <!-- Info Row -->
             <div class="flex items-center justify-between pt-6 border-t border-border/5">
                <div class="space-y-1">
                   <p class="text-[8px] font-black uppercase tracking-[0.4em] text-text-muted/30 italic leading-none">Volumen</p>
                   <p class="text-sm font-black text-text uppercase tracking-widest">{{ item.qty || item.cantidad || 1 }} UN.</p>
                </div>
                <div class="text-right space-y-1">
                   <p class="text-[8px] font-black uppercase tracking-[0.4em] text-text-muted/30 italic leading-none">Presupuesto</p>
                   <p class="text-xl font-black text-primary tracking-tighter tabular-nums leading-none">
                     {{ ((item.price || item.unitPrice || item.precioUnitario || 0) * (item.qty || item.cantidad || 1)) | currency:'':'symbol':'1.0-0' }}
                   </p>
                </div>
             </div>

             <!-- STL and Technical Access -->
             @if (item.stlUrl) {
                <div class="pt-6">
                   <a [href]="item.stlUrl" target="_blank" class="w-full h-12 rounded-2xl bg-zinc-900 text-white text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary transition-all active:scale-95 italic">
                      <lucide-angular [img]="icons.Monitor" class="h-4 w-4"></lucide-angular>
                      Acceder Archivo STL
                   </a>
                </div>
             }
          </div>
        </div>
      }
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
