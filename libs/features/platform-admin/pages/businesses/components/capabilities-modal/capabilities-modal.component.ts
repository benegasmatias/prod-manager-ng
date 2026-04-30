import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, Check, Shield, AlertTriangle } from 'lucide-angular';
import { PlatformAdminService } from '../../../../services/platform-admin.service';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-capabilities-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" (click)="close.emit()"></div>
      
      <div class="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <!-- Header -->
        <div class="flex items-center justify-between p-8 border-b border-zinc-900 bg-zinc-900/20">
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <lucide-angular [img]="icons.Shield" class="h-6 w-6 text-primary"></lucide-angular>
            </div>
            <div>
              <h3 class="text-xl font-black text-white uppercase tracking-tight">Capacidades del Negocio</h3>
              <p class="text-zinc-500 text-xs font-bold italic">{{ business?.name }}</p>
            </div>
          </div>
          <button (click)="close.emit()" class="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 transition-all">
            <lucide-angular [img]="icons.X" class="h-5 w-5"></lucide-angular>
          </button>
        </div>

        <div class="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div class="grid grid-cols-1 gap-4">
            <div *ngFor="let cap of availableCapabilities" 
                 (click)="toggleCapability(cap.key)"
                 [class.border-primary]="hasCapability(cap.key)"
                 [class.bg-primary/5]="hasCapability(cap.key)"
                 class="group p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between">
              
              <div class="flex flex-col">
                <span class="text-xs font-black text-zinc-100 uppercase tracking-widest">{{ cap.label }}</span>
                <span class="text-[10px] text-zinc-500 font-bold italic">{{ cap.description }}</span>
              </div>

              <div [class]="hasCapability(cap.key) ? 'bg-primary text-white' : 'bg-zinc-800 text-zinc-600'"
                   class="h-6 w-6 rounded-lg flex items-center justify-center transition-all shadow-xl">
                <lucide-angular [img]="icons.Check" class="h-4 w-4" [class.opacity-0]="!hasCapability(cap.key)"></lucide-angular>
              </div>
            </div>
          </div>

          <!-- Manual Entry -->
          <div class="mt-8 pt-8 border-t border-zinc-900">
             <h4 class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Entrada Manual (Avanzado)</h4>
             <div class="flex gap-2">
                <input type="text" 
                       [(ngModel)]="manualCap"
                       placeholder="NOMBRE_CAPACIDAD_RAW"
                       class="flex-1 h-12 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-xs font-bold text-zinc-300 focus:outline-none focus:border-primary transition-all">
                <button (click)="addManual()" class="px-6 h-12 bg-zinc-800 text-zinc-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-700 transition-all">Agregar</button>
             </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-8 border-t border-zinc-900 bg-zinc-900/20 flex items-center justify-end gap-4">
          <button (click)="close.emit()" class="px-8 py-3 bg-zinc-800 text-zinc-400 rounded-2xl hover:bg-zinc-700 transition-all text-xs font-black uppercase tracking-widest">
            Cancelar
          </button>
          <button 
            (click)="save()" 
            [disabled]="saving()"
            class="flex items-center gap-2 px-10 py-3 bg-primary text-white rounded-2xl hover:bg-primary-hover transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <span *ngIf="!saving()">Guardar Cambios</span>
            <span *ngIf="saving()">Guardando...</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
  `]
})
export class EditCapabilitiesModalComponent implements OnInit {
  private adminService = inject(PlatformAdminService);
  private toast = inject(ToastService);

  @Input() business: any;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  readonly icons = { X, Check, Shield, AlertTriangle };

  selectedCapabilities = signal<string[]>([]);
  saving = signal<boolean>(false);
  manualCap = '';

  availableCapabilities = [
    { key: 'PRODUCTION_MANAGEMENT', label: 'Gestión de Producción', description: 'Permite estados complejos y seguimiento de fabricación.' },
    { key: 'PRODUCTION_MACHINES', label: 'Maquinaria Industrial', description: 'Habilita el módulo de máquinas, impresoras y recursos físicos.' },
    { key: 'INVENTORY_RAW', label: 'Insumos Crudos', description: 'Control de filamentos, resinas o materia prima.' },
    { key: 'SALES_MANAGEMENT', label: 'Ventas Pro', description: 'Módulo de cobros, señas y saldos avanzado.' },
    { key: 'FINANCIAL_BASIC', label: 'Finanzas Básicas', description: 'Reportes básicos de ingresos y egresos.' },
    { key: 'CRM_BASIC', label: 'CRM / Clientes', description: 'Base de datos centralizada de contactos.' }
  ];

  ngOnInit() {
    if (this.business?.capabilities) {
      this.selectedCapabilities.set([...this.business.capabilities]);
    }
  }

  hasCapability(key: string): boolean {
    return this.selectedCapabilities().includes(key);
  }

  toggleCapability(key: string) {
    const current = this.selectedCapabilities();
    if (current.includes(key)) {
      this.selectedCapabilities.set(current.filter(c => c !== key));
    } else {
      this.selectedCapabilities.set([...current, key]);
    }
  }

  addManual() {
    if (!this.manualCap) return;
    const cap = this.manualCap.toUpperCase().replace(/\s+/g, '_');
    if (!this.selectedCapabilities().includes(cap)) {
      this.selectedCapabilities.set([...this.selectedCapabilities(), cap]);
    }
    this.manualCap = '';
  }

  async save() {
    try {
      this.saving.set(true);
      await this.adminService.updateBusinessCapabilities(this.business.id, this.selectedCapabilities());
      this.toast.success('Capacidades actualizadas correctamente');
      this.updated.emit();
      this.close.emit();
    } catch (e) {
      this.toast.error('Error al actualizar capacidades');
    } finally {
      this.saving.set(false);
    }
  }
}
