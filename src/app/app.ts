import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialogComponent } from '../../libs/shared/ui/confirm-dialog/confirm-dialog.component';
import { ThemeService } from '../../libs/core/layout/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ConfirmDialogComponent],
  template: `
    <router-outlet></router-outlet>
    <app-confirm-dialog></app-confirm-dialog>
  `,
  styles: []
})
export class App {
  protected readonly title = signal('prod-manager-ng');
  private themeService = inject(ThemeService);
}
