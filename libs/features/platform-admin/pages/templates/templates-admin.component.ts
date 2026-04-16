import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformAdminService } from '../../services/platform-admin.service';
import { LucideAngularModule, RefreshCw, Building, Loader2 } from 'lucide-angular';
import { ToastService } from '../../../../shared/services/toast.service';
import { TemplateEditorModalComponent } from '../businesses/components/template-editor/template-editor.component';
import { ButtonSpinnerComponent } from '../../../../shared/ui/button-spinner/button-spinner.component';

@Component({
  selector: 'app-templates-admin',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    TemplateEditorModalComponent,
    ButtonSpinnerComponent
  ],
  templateUrl: './templates-admin.component.html',
  styleUrls: ['./templates-admin.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplatesAdminComponent implements OnInit {
  private adminService = inject(PlatformAdminService);
  private toast = inject(ToastService);

  readonly icons = {
    RefreshCw, Building, Loader2
  };

  constructor() {
    LucideAngularModule.pick(this.icons);
  }

  templates = signal<any[]>([]);
  loadingTemplates = signal<boolean>(false);
  selectedTemplate = signal<any | null>(null);

  ngOnInit() {
    this.loadTemplates();
  }

  async loadTemplates() {
    try {
      this.loadingTemplates.set(true);
      const data = await this.adminService.getTemplates();
      this.templates.set(data || []);
    } catch (e: any) {
      console.error('Error loading templates:', e);
      this.toast.error('Error al cargar las plantillas');
    } finally {
      this.loadingTemplates.set(false);
    }
  }

  async syncTemplates() {
    try {
      this.toast.info('Sincronizando plantillas con el estándar del sistema...');
      await this.adminService.seedTemplates();
      this.toast.success('Plantillas sincronizadas correctamente');
      this.loadTemplates();
    } catch (e: any) {
      this.toast.error('Error al sincronizar plantillas: ' + (e.message || 'Error desconocido'));
    }
  }
}
