import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialogComponent } from '../../libs/shared/ui/confirm-dialog/confirm-dialog.component';
import { TermsAndConditionsModalComponent } from '../../libs/shared/ui';
import { ThemeService } from '../../libs/core/layout/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ConfirmDialogComponent, TermsAndConditionsModalComponent],
  template: `
    <router-outlet></router-outlet>
    <app-confirm-dialog></app-confirm-dialog>
    <app-terms-modal></app-terms-modal>
  `,
  styles: []
})
export class App {
  protected readonly title = signal('prod-manager-ng');
  private themeService = inject(ThemeService);
}
