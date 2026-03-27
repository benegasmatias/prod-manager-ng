import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AccessControlService } from '../../../core/auth/access-control.service';
import { FeatureCode, PermissionAction } from '../../models/access-control';

@Directive({
  selector: '[appIfAccess]',
  standalone: true
})
export class IfAccessDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private accessService = inject(AccessControlService);

  @Input('appIfAccess') accessConfig: [FeatureCode, PermissionAction?] | FeatureCode | null = null;

  constructor() {
    effect(() => {
      // Re-evaluate when business, role, or inputs change
      this.updateView();
    });
  }

  private updateView() {
    if (!this.accessConfig) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      return;
    }

    let feature: FeatureCode;
    let action: PermissionAction = 'VIEW';

    if (Array.isArray(this.accessConfig)) {
      feature = this.accessConfig[0];
      action = this.accessConfig[1] || 'VIEW';
    } else {
      feature = this.accessConfig;
    }

    if (this.accessService.hasPermission(feature, action)) {
      if (this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    } else {
      this.viewContainer.clear();
    }
  }
}
