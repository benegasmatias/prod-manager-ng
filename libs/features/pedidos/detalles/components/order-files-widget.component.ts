import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, FileText, Download, ExternalLink } from 'lucide-angular';
import { ItemPedido } from '@shared/models';

@Component({
  selector: 'app-order-files-widget',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-8 shadow-sm h-full">
      <div class="flex items-center gap-3 mb-8 px-2">
        <lucide-angular [img]="icons.FileText" class="h-4 w-4 text-zinc-300"></lucide-angular>
        <h3 class="text-xs font-black uppercase tracking-widest text-zinc-400">Archivos y Planos Técnicos</h3>
        <div class="h-px flex-1 bg-zinc-100 dark:bg-zinc-800"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (item of itemsWithFiles(); track item.id) {
          <div (click)="downloadStatus.emit(item.stlUrl)" class="p-6 rounded-[2rem] border-2 border-dashed border-zinc-50 dark:border-zinc-800 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer flex items-center justify-between group/file relative overflow-hidden">
               <!-- Animated BG -->
               <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover/file:opacity-100 transition-opacity"></div>
               
               <div class="flex items-center gap-4 relative z-10">
                  <div class="h-12 w-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover/file:bg-primary group-hover/file:text-white transition-all shadow-sm">
                    <lucide-angular [img]="icons.Download" class="h-6 w-6"></lucide-angular>
                  </div>
                  <div class="space-y-0.5">
                    <p class="text-xs font-black text-zinc-900 dark:text-white truncate max-w-[150px]">{{ item.name || item.nombreProducto }}</p>
                    <p class="text-[9px] font-black uppercase text-secondary tracking-widest leading-none">Extensión .STL / 3D BINARY</p>
                  </div>
               </div>
               <lucide-angular [img]="icons.ExternalLink" class="h-4 w-4 text-zinc-300 opacity-0 group-hover/file:opacity-100 transition-all group-hover/file:scale-110 relative z-10"></lucide-angular>
            </div>
        } @empty {
          <div class="col-span-full py-16 text-center border-2 border-dashed border-zinc-50 dark:border-zinc-950 rounded-[2.5rem] bg-zinc-50/20">
            <div class="h-12 w-12 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center mx-auto mb-4 text-zinc-200">
               <lucide-angular [img]="icons.FileText" class="h-5 w-5"></lucide-angular>
            </div>
            <p class="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300">No se adjuntaron documentos técnicos a esta orden</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class OrderFilesWidgetComponent {
  items = input.required<ItemPedido[]>();
  downloadStatus = output<string | undefined>();

  itemsWithFiles = computed(() => this.items().filter(it => !!it.stlUrl));

  icons = {
    FileText, Download, ExternalLink
  };
}
