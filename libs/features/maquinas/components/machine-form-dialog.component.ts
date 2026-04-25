import { Component, Input, Output, EventEmitter, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Machine } from '@shared/models';
import { LucideAngularModule, Cpu, Info, X } from 'lucide-angular';
import { SessionService } from '@core/session/session.service';
import { LayoutService } from '@core/layout/layout.service';
import { ButtonSpinnerComponent } from '@shared/ui/button-spinner/button-spinner.component';

@Component({
  selector: 'app-machine-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonSpinnerComponent],
  templateUrl: './machine-form-dialog.component.html'
})
export class MachineFormDialogComponent implements OnChanges {
  @Input() machineId: string | null = null;
  @Input() initialData: Partial<Machine> | null = null;
  @Input() saving = false;

  @Output() onSave = new EventEmitter<Partial<Machine>>();
  @Output() onCancel = new EventEmitter<void>();

  private session = inject(SessionService);
  public layout = inject(LayoutService);
  config = this.session.config;
  readonly icons = { Cpu, Info, X };

  form = {
    name: '',
    model: '',
    nozzle: '0.4mm',
    maxFilaments: 1
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && this.initialData) {
      this.form = {
        name: this.initialData.name || '',
        model: this.initialData.model || '',
        nozzle: this.initialData.nozzle || '0.4mm',
        maxFilaments: this.initialData.maxFilaments || 1
      };
    }
  }

  handleSave() {
    this.onSave.emit(this.form);
  }
}
