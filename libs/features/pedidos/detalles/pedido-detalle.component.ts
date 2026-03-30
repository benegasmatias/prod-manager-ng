import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PedidosApiService } from '../../../core/api/pedidos.api.service';
import { Pedido } from '@shared/models';
import { LucideAngularModule, ArrowLeft, Package, User, Calendar, Clock, DollarSign, Wallet, CheckCircle, Info, Tag } from 'lucide-angular';
import { getStatusLabel, getStatusStyles } from '@shared/utils';

@Component({
  selector: 'app-pedido-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-[#fafbfc] dark:bg-zinc-950 p-6 md:p-10 space-y-8">
      <!-- Header / Nav -->
      <div class="flex items-center justify-between">
        <a routerLink="/pedidos" class="flex items-center gap-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors group">
          <lucide-angular [img]="ArrowLeft" class="h-4 w-4 transition-transform group-hover:-translate-x-1"></lucide-angular>
          <span class="text-xs font-black uppercase tracking-widest">Volver al listado</span>
        </a>
      </div>

      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-20 space-y-4">
          <div class="h-12 w-12 rounded-2xl border-4 border-primary/20 border-t-primary animate-spin"></div>
          <p class="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse">Consultando Expediente...</p>
        </div>
      } @else if (pedido()) {
        @let p = pedido()!;
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Columna Izquierda: Info Principal y Productos -->
          <div class="lg:col-span-2 space-y-8">
            <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-8 shadow-sm">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div class="space-y-4">
                  <div class="flex items-center gap-3">
                    <span class="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <lucide-angular [img]="Package" class="h-5 w-5"></lucide-angular>
                    </span>
                    <h1 class="text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">
                      Pedido #{{ p.code }}
                    </h1>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <span [class]="'text-[10px] font-black uppercase tracking-tight rounded-full px-4 py-1.5 border shadow-sm ' + getStatusStyles(p.status)">
                      {{ getStatusLabel(p.status) }}
                    </span>
                    <span class="text-[10px] font-black uppercase tracking-tight rounded-full px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                      {{ p.type === 'CUSTOMER' ? 'ORDEN CLIENTE' : 'ORDEN STOCK' }}
                    </span>
                  </div>
                </div>
                
                <div class="flex items-center gap-4 text-right">
                  <div class="space-y-1">
                    <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Creado el</p>
                    <p class="text-sm font-black text-zinc-900 dark:text-zinc-100">
                      {{ p.fechaCreacion | date:'dd / MM / yyyy' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Listado de Productos -->
              <div class="space-y-6">
                <div class="flex items-center gap-3 px-2">
                   <lucide-angular [img]="Tag" class="h-4 w-4 text-zinc-300"></lucide-angular>
                   <h3 class="text-xs font-black uppercase tracking-widest text-zinc-400">Items de la Orden</h3>
                   <div class="h-px flex-1 bg-zinc-100 dark:bg-zinc-800"></div>
                </div>

                <div class="space-y-3">
                  @for (item of p.items; track item.id) {
                    <div class="p-6 rounded-3xl bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between group transition-all hover:border-primary/20">
                      <div class="flex items-center gap-4">
                        <div class="h-12 w-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-400">
                           <lucide-angular [img]="Package" class="h-5 w-5"></lucide-angular>
                        </div>
                        <div class="space-y-1">
                           <p class="font-black text-zinc-900 dark:text-zinc-50 truncate max-w-[200px] md:max-w-md">{{ item.nombreProducto }}</p>
                           <p class="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                             Cantidad: {{ item.cantidad }} u. | P.U: {{ item.precioUnitario | currency:'ARS' }}
                           </p>
                        </div>
                      </div>
                      <div class="text-right">
                        <p class="text-lg font-black text-zinc-900 dark:text-zinc-50">
                          {{ (item.precioUnitario * item.cantidad) | currency:'ARS' }}
                        </p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Notas Section -->
            @if (p.notes) {
              <div class="bg-indigo-50/30 dark:bg-zinc-900 rounded-[2.5rem] border border-indigo-100/50 dark:border-zinc-800 p-8">
                 <div class="flex items-center gap-3 mb-4">
                    <lucide-angular [img]="Info" class="h-4 w-4 text-primary"></lucide-angular>
                    <h3 class="text-[10px] font-black uppercase tracking-widest text-primary">Observaciones Generales</h3>
                 </div>
                 <p class="text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">{{ p.notes }}</p>
              </div>
            }
          </div>

          <!-- Columna Derecha: Resumen Financiero y Cliente -->
          <div class="space-y-8">
             <!-- Cliente -->
             <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-8 shadow-sm">
                <div class="flex items-center gap-4 mb-6">
                   <div class="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                      <lucide-angular [img]="User" class="h-6 w-6"></lucide-angular>
                   </div>
                   <div class="space-y-0.5">
                      <h4 class="text-xs font-black uppercase text-zinc-400 tracking-widest">Solicitante</h4>
                      <p class="font-black text-zinc-900 dark:text-zinc-50">{{ p.clientName || 'Sin Cliente' }}</p>
                   </div>
                </div>
                
                @if (p.responsableGeneral) {
                  <div class="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                     <div class="flex items-center gap-3">
                        <div class="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                          {{ p.responsableGeneral.firstName[0] }}
                        </div>
                        <div class="space-y-0.5">
                          <h4 class="text-[8px] font-black uppercase text-zinc-400 tracking-widest">Responsable Asignado</h4>
                          <p class="text-xs font-black text-zinc-700 dark:text-zinc-300">{{ p.responsableGeneral.firstName }} {{ p.responsableGeneral.lastName || '' }}</p>
                        </div>
                     </div>
                  </div>
                }
             </div>

             <!-- Financiero -->
             <div class="bg-zinc-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                <div class="absolute -top-10 -right-10 h-40 w-40 bg-primary/20 rounded-full blur-3xl transition-all group-hover:scale-150 duration-700"></div>
                
                <div class="relative z-10 space-y-8">
                   <div class="space-y-1">
                      <span class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Total Presupuestado</span>
                      <p class="text-4xl font-black tabular-nums flex items-baseline gap-1">
                        <small class="text-xl">$</small>
                        {{ (p.totalPrice || 0) | number:'1.2-2' }}
                      </p>
                   </div>

                   <div class="space-y-4 pt-8 border-t border-white/5">
                      <div class="flex items-center justify-between">
                         <div class="flex items-center gap-2">
                            <span class="h-6 w-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                               <lucide-angular [img]="CheckCircle" class="h-3 w-3"></lucide-angular>
                            </span>
                            <span class="text-[10px] font-bold uppercase tracking-widest text-white/50">Pagado</span>
                         </div>
                         <p class="text-sm font-black text-emerald-400">
                           {{ (Number(p.totalSenias || 0) + Number(p.totalPayments || 0)) | currency:'ARS' }}
                         </p>
                      </div>

                      <div class="flex items-center justify-between">
                         <div class="flex items-center gap-2">
                            <span class="h-6 w-6 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                               <lucide-angular [img]="Clock" class="h-3 w-3"></lucide-angular>
                            </span>
                            <span class="text-[10px] font-bold uppercase tracking-widest text-white/50">Pendiente</span>
                         </div>
                         <p class="text-lg font-black text-rose-400">
                           {{ (Number(p.totalPrice || 0) - (Number(p.totalSenias || 0) + Number(p.totalPayments || 0))) | currency:'ARS' }}
                         </p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      } @else {
        <div class="flex flex-col items-center justify-center py-20 text-center space-y-6">
           <div class="h-20 w-20 rounded-[2.5rem] bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-800 flex items-center justify-center text-rose-500">
             <lucide-angular [img]="Info" class="h-10 w-10"></lucide-angular>
           </div>
           <div>
             <h2 class="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">No se encontró el expediente</h2>
             <p class="text-zinc-400 text-sm mt-2">La orden que buscas no existe o no tienes permisos para verla.</p>
           </div>
           <button routerLink="/pedidos" class="h-12 px-8 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all">
             Volver a Pedidos
           </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PedidoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(PedidosApiService);
  
  pedido = signal<Pedido | null>(null);
  loading = signal(true);
  
  readonly ArrowLeft = ArrowLeft;
  readonly Package = Package;
  readonly User = User;
  readonly Calendar = Calendar;
  readonly Clock = Clock;
  readonly DollarSign = DollarSign;
  readonly Wallet = Wallet;
  readonly CheckCircle = CheckCircle;
  readonly Info = Info;
  readonly Tag = Tag;

  Number = Number;

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }

    try {
      // Usaremos getListing con ID si es que hay un endpoint, o findOne
      // Revisando PedidosApiService... no hay findOne? lo agregaremos si falta.
      const res = await this.api.findOne(id);
      this.pedido.set(res);
    } catch (error) {
      console.error('Error fetching order detail:', error);
    } finally {
      this.loading.set(false);
    }
  }

  getStatusLabel(status: string) {
    return getStatusLabel(status);
  }

  getStatusStyles(status: string) {
    return getStatusStyles(status);
  }
}
