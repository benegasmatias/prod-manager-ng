import { Component, OnInit, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CreditCard, RefreshCw, CheckCircle2, ShieldAlert, Sparkles, DollarSign, Plus, Layers, Trash2 } from 'lucide-angular';
import { PlatformAdminService } from '@features/platform-admin/services/platform-admin.service';
import { ToastService } from '@shared/services/toast.service';
import { ButtonSpinnerComponent } from '@shared/ui/button-spinner/button-spinner.component';
import { PlanEditorModalComponent } from './components/plan-editor-modal/plan-editor-modal.component';
import { ConfirmService } from '@shared/ui/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-plans-admin',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule, 
    ButtonSpinnerComponent, 
    PlanEditorModalComponent
  ],
  template: `
    <div class="animate-in fade-in duration-700">
      <!-- Header -->
      <div class="flex items-center justify-between mb-10">
        <div>
          <h2 class="text-3xl font-black text-white tracking-tight uppercase">Catálogo de Planes</h2>
          <p class="text-zinc-500 font-bold italic">Configura las capacidades por rubro e industria.</p>
        </div>
        <div class="flex items-center gap-3">
          <app-button-spinner
            (onClick)="loadPlans()" 
            [loading]="loading()"
            btnClass="p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-all text-zinc-300"
          >
             <lucide-angular [img]="icons.RefreshCw" class="h-5 w-5"></lucide-angular>
          </app-button-spinner>
          
          <button 
            (click)="openEditor({})"
            class="px-6 py-3 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-all outline-none"
          >
            <lucide-angular [img]="icons.Plus" class="h-4 w-4"></lucide-angular>
            Nuevo Plan
          </button>
        </div>
      </div>

      <!-- Category Filter Tabs -->
      <div class="flex items-center gap-2 mb-10 overflow-x-auto pb-2 custom-scrollbar">
         <button 
          (click)="onCategoryChange(null)"
          [ngClass]="{'bg-zinc-100 text-black': selectedCategory() === null, 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:bg-zinc-800': selectedCategory() !== null}"
          class="px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shrink-0"
         >
            Todos
         </button>
         @for (cat of categories; track cat.id) {
          <button 
            (click)="onCategoryChange(cat.id)"
            [ngClass]="{'bg-zinc-100 text-black': selectedCategory() === cat.id, 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:bg-zinc-800': selectedCategory() !== cat.id}"
            class="px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shrink-0"
           >
              {{ cat.label }}
           </button>
         }
      </div>

      <!-- Plans Grid Groups -->
      <div class="space-y-16">
        @for (group of groupedPlans() | keyvalue; track group.key) {
          <div class="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div class="flex items-center gap-4">
                <div class="h-10 w-10 bg-zinc-800/50 rounded-xl flex items-center justify-center text-primary border border-zinc-800">
                   <lucide-angular [img]="icons.Layers" class="h-5 w-5"></lucide-angular>
                </div>
                <h3 class="text-xs font-black text-white uppercase tracking-[0.3em]">{{ getCategoryLabel(group.key) }}</h3>
                <div class="h-px flex-1 bg-zinc-800"></div>
             </div>

             <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                @for (plan of group.value; track plan.id) {
                  <div class="bg-zinc-900 border border-zinc-800/50 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden group transition-all hover:border-primary/30 text-left">
                    @if (plan.isRecommended) {
                      <div class="absolute top-6 right-6 px-3 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg z-10">Recomendado</div>
                    }
                    
                    <div class="mb-6 flex items-center justify-between">
                      <div class="h-14 w-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors">
                        <lucide-angular [img]="icons.Sparkles" class="h-6 w-6"></lucide-angular>
                      </div>
                      <div class="flex flex-col items-end">
                        <span class="text-[8px] font-black uppercase text-zinc-600 tracking-widest mb-1">Días Trial</span>
                        <span class="text-[10px] font-bold text-zinc-400">{{ plan.hasTrial ? plan.trialDays : 'LIFETIME' }}</span>
                      </div>
                    </div>

                    <div class="space-y-1 mb-6">
                      <h3 class="text-xl font-black text-white uppercase tracking-tight">{{ plan.name }}</h3>
                      <p class="text-xs text-zinc-500 font-bold leading-relaxed">{{ plan.description }}</p>
                    </div>

                    <div class="flex items-baseline gap-2 mb-8">
                      <span class="text-3xl font-black text-white tracking-tighter">{{ (plan.price | currency:plan.currency:'symbol':'1.0-0') || '$0' }}</span>
                      <span class="text-[10px] font-bold text-zinc-600 uppercase">/ Mensual</span>
                    </div>

                    <div class="space-y-4 mb-10 flex-1">
                      @for (feat of plan.features; track feat) {
                        <div class="flex items-start gap-4">
                          <lucide-angular [img]="icons.CheckCircle2" class="h-4 w-4 text-emerald-500 shrink-0"></lucide-angular>
                          <span class="text-[10px] font-bold text-zinc-400 leading-tight">{{ feat }}</span>
                        </div>
                      }
                    </div>

                    <div class="pt-6 border-t border-zinc-800/50 flex items-center justify-between">
                       <div class="flex flex-col">
                          <span class="text-[9px] font-black uppercase text-zinc-600 tracking-widest">ID Interno</span>
                          <span class="text-[10px] font-bold text-zinc-400 italic">#{{ plan.id }}</span>
                       </div>
                        <button 
                           (click)="openEditor(plan)"
                           class="h-10 w-10 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-center text-zinc-500 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                           title="Editar Plan"
                        >
                           <lucide-angular [img]="icons.DollarSign" class="h-4 w-4"></lucide-angular>
                        </button>
                        <button 
                           (click)="handleDelete(plan.id)"
                           class="h-10 w-10 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-center text-zinc-500 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                           title="Eliminar Plan"
                        >
                           <lucide-angular [img]="icons.Trash2" class="h-4 w-4"></lucide-angular>
                        </button>
                    </div>
                  </div>
                }
             </div>
          </div>
        }
      </div>

      <!-- Modals -->
      @if (selectedPlan()) {
        <app-plan-editor-modal
          [plan]="selectedPlan()"
          (close)="selectedPlan.set(null)"
          (updated)="loadPlans()"
        ></app-plan-editor-modal>
      }

      <div *ngIf="loading() && plans().length === 0" class="flex flex-col items-center justify-center py-20 opacity-50">
          <lucide-angular [img]="icons.RefreshCw" class="h-12 w-12 text-zinc-600 animate-spin mb-4"></lucide-angular>
          <p class="text-xs font-black uppercase text-zinc-600 tracking-widest">Cargando catálogo...</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar { height: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlansAdminComponent implements OnInit {
  private adminService = inject(PlatformAdminService);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);

  readonly icons = { 
    RefreshCw, CreditCard, CheckCircle2, ShieldAlert, Sparkles, DollarSign, Plus, Layers, Trash2 
  };

  plans = signal<any[]>([]);
  loading = signal<boolean>(true);
  selectedPlan = signal<any | null>(null);
  selectedCategory = signal<string | null>(null);

  categories = [
    { id: 'IMPRESION_3D', label: 'Impresión 3D' },
    { id: 'METALURGICA', label: 'Metalúrgica' },
    { id: 'CARPINTERIA', label: 'Carpintería' },
    { id: 'KIOSCO', label: 'Kiosco' }
  ];

  groupedPlans = computed(() => {
    const raw = this.plans();
    const filter = this.selectedCategory();
    
    const filtered = filter ? raw.filter(p => p.category === filter) : raw;
    
    const groups: { [key: string]: any[] } = {};
    filtered.forEach(p => {
      const cat = p.category || 'GLOBAL';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    
    return groups;
  });

  constructor() {
    LucideAngularModule.pick(this.icons);
  }

  ngOnInit() {
    this.loadPlans();
  }

  onCategoryChange(catId: string | null) {
    this.selectedCategory.set(catId);
    this.loadPlans();
  }

  getCategoryLabel(id: string) {
    if (id === 'GLOBAL') return 'Global / Sistema';
    return this.categories.find(c => c.id === id)?.label || id;
  }

  openEditor(plan: any) {
    this.selectedPlan.set(plan);
  }

  async handleDelete(id: string) {
    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Plan',
      message: `¿Estás seguro de que deseas eliminar el plan "${id}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar definitivamente',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await this.adminService.deletePlan(id);
        this.toast.success('Plan eliminado correctamente');
        this.loadPlans();
      } catch (e) {
        this.toast.error('Error al eliminar plan');
      }
    }
  }

  async loadPlans() {
    try {
      this.loading.set(true);
      const data = await this.adminService.getPlans(this.selectedCategory() || undefined);
      this.plans.set(data || []);
    } catch (e) {
      this.toast.error('Error al cargar catalogo de planes');
    } finally {
      this.loading.set(false);
    }
  }
}
