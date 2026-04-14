import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RetailService } from '@core/retail/retail.service';
import { Supplier } from '@shared/models/retail/retail.models';
import { LucideAngularModule, Truck, Plus, Phone, Mail, Edit2, ShieldCheck, ShieldAlert } from 'lucide-angular';
import { ButtonSpinnerComponent } from '@shared/ui/button-spinner/button-spinner.component';

@Component({
  selector: 'app-retail-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonSpinnerComponent],
  template: `
    <div class="p-6 space-y-6">
      <header class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <lucide-icon [name]="'Truck'" class="w-8 h-8 text-indigo-600"></lucide-icon>
            Proveedores
          </h1>
          <p class="text-gray-500">Gestión de abastecimiento y contactos.</p>
        </div>
        <button (click)="openModal()" 
                class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-100">
          <lucide-icon [name]="'Plus'" class="w-5 h-5"></lucide-icon>
          NUEVO PROVEEDOR
        </button>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (s of suppliers(); track s.id) {
              <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition">
                  <div class="flex justify-between items-start">
                      <div class="flex items-center gap-3">
                          <div [class]="'w-3 h-3 rounded-full ' + (s.active ? 'bg-green-500' : 'bg-red-500')"></div>
                          <h3 class="font-bold text-lg text-gray-900">{{ s.name }}</h3>
                      </div>
                      <button (click)="openModal(s)" class="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
                          <lucide-icon [name]="'Edit2'" class="w-4 h-4"></lucide-icon>
                      </button>
                  </div>

                  <div class="space-y-2 text-sm text-gray-600">
                      <div class="flex items-center gap-2">
                          <lucide-icon [name]="'Phone'" class="w-4 h-4 text-gray-400"></lucide-icon>
                          {{ s.phone || 'Sin teléfono' }}
                      </div>
                      <div class="flex items-center gap-2">
                          <lucide-icon [name]="'Mail'" class="w-4 h-4 text-gray-400"></lucide-icon>
                          {{ s.email || 'Sin email' }}
                      </div>
                  </div>

                  @if (s.notes) {
                      <p class="text-xs text-gray-400 line-clamp-2 bg-gray-50 p-3 rounded-xl italic">
                          "{{ s.notes }}"
                      </p>
                  }
              </div>
          } @empty {
              <div class="col-span-full py-20 text-center text-gray-400">
                   <lucide-icon [name]="'Truck'" class="w-12 h-12 mx-auto mb-4 opacity-20"></lucide-icon>
                   Aún no tienes proveedores registrados.
              </div>
          }
      </div>

      <!-- Modal -->
      @if (showModal) {
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div class="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6">
                  <h2 class="text-xl font-bold">{{ editing() ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</h2>
                  <div class="space-y-4">
                      <label class="block">
                          <span class="text-sm font-medium text-gray-600">Nombre del Proveedor</span>
                          <input type="text" [(ngModel)]="current.name" class="w-full mt-1 p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500" placeholder="Nombre de la empresa">
                      </label>
                      <div class="grid grid-cols-2 gap-4">
                          <label class="block">
                              <span class="text-sm font-medium text-gray-600">Teléfono</span>
                              <input type="text" [(ngModel)]="current.phone" class="w-full mt-1 p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500">
                          </label>
                          <label class="block">
                              <span class="text-sm font-medium text-gray-600">Email</span>
                              <input type="email" [(ngModel)]="current.email" class="w-full mt-1 p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500">
                          </label>
                      </div>
                      <label class="block">
                          <span class="text-sm font-medium text-gray-600">Notas</span>
                          <textarea [(ngModel)]="current.notes" rows="3" class="w-full mt-1 p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500" placeholder="Dirección, días de entrega, etc."></textarea>
                      </label>

                      <div class="flex items-center gap-2 py-2">
                        <input type="checkbox" [(ngModel)]="current.active" id="active" class="rounded text-indigo-600 focus:ring-indigo-500">
                        <label for="active" class="text-sm font-medium text-gray-600">Proveedor Activo</label>
                      </div>

                      <div class="flex gap-3 pt-4">
                          <button (click)="showModal = false" class="flex-1 p-4 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
                          <app-button-spinner
                              [loading]="loading()"
                              [btnClass]="'flex-1 p-4 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition'"
                              (onClick)="save()"
                              loadingText="GUARDANDO...">
                              Guardar
                          </app-button-spinner>
                      </div>
                  </div>
              </div>
          </div>
      }
    </div>
  `
})
export class RetailProveedoresComponent implements OnInit {
  private retailService = inject(RetailService);

  suppliers = signal<Supplier[]>([]);
  loading = signal(false);
  showModal = false;
  editing = signal(false);

  current: Partial<Supplier> = {
    name: '',
    phone: '',
    email: '',
    notes: '',
    active: true
  };

  ngOnInit() {
    this.list();
  }

  async list() {
    const list = await this.retailService.getSuppliers();
    this.suppliers.set(list);
  }

  openModal(s?: Supplier) {
    if (s) {
      this.current = { ...s };
      this.editing.set(true);
    } else {
      this.current = { name: '', phone: '', email: '', notes: '', active: true };
      this.editing.set(false);
    }
    this.showModal = true;
  }

  async save() {
    if (!this.current.name) return;
    
    this.loading.set(true);
    try {
      if (this.editing()) {
        await this.retailService.updateSupplier(this.current.id!, this.current);
      } else {
        await this.retailService.createSupplier(this.current);
      }
      this.showModal = false;
      this.list();
    } catch (e) {
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }
}
