import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Landmark, Globe, Save, Trash2 } from 'lucide-angular';
import { SessionService } from '../../core/session/session.service';
import { ConfirmService } from '../../shared/ui/confirm-dialog/confirm-dialog.component';
import { Negocio } from '../../shared/models';

@Component({
  selector: 'app-ajustes',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './ajustes.component.html'
})
export class AjustesComponent {
  public sessionService = inject(SessionService);
  private confirmService = inject(ConfirmService);
  private router = inject(Router);
  
  // Use a computed signal for the active business to ensure reactivity
  negocioActivo = computed(() => this.sessionService.activeNegocio());
  
  // Local state for editing
  nombre = signal('');
  moneda = signal('ARS');
  saving = signal(false);

  readonly icons = {
    Landmark, Globe, Save, Trash2
  };

  readonly currencies = [
    { code: 'ARS', label: 'Pesos Argentinos', symbol: '$' },
    { code: 'USD', label: 'Dólares Estadounidenses', symbol: 'US$' },
    { code: 'EUR', label: 'Euros', symbol: '€' },
    { code: 'CLP', label: 'Pesos Chilenos', symbol: 'CLP$' },
    { code: 'UYU', label: 'Pesos Uruguayos', symbol: '$U' },
  ];

  constructor() {
    // Sync local state when the active business changes
    effect(() => {
      const active = this.negocioActivo();
      if (active) {
        this.nombre.set(active.nombre);
        this.moneda.set(active.moneda || 'ARS');
      }
    });
  }

  async handleSave() {
    const active = this.negocioActivo();
    if (!active) return;

    this.saving.set(true);
    try {
      await this.sessionService.updateNegocio(active.id, {
        nombre: this.nombre(),
        moneda: this.moneda()
      });
      // Optionally show a success toast here if toast service is available
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      this.saving.set(false);
    }
  }

  async handleDelete() {
    const active = this.negocioActivo();
    if (!active) return;

    const confirmed = await this.confirmService.confirm({
      title: 'Eliminar Negocio',
      message: `¿Estás seguro de que deseas eliminar "${active.nombre}"? Esta acción es definitiva y borrará todos los datos asociados.`,
      confirmLabel: 'Eliminar Negocio',
      type: 'danger'
    });

    if (confirmed) {
      try {
        await this.sessionService.removeNegocio(active.id);
        this.router.navigate(['/select-business']);
      } catch (error) {
        console.error('Error deleting business:', error);
      }
    }
  }
}
