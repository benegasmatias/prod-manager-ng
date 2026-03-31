import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderFormComponent } from '../../../shared/ui/order-form/order-form.component';

@Component({
  selector: 'app-nuevo-stock-page',
  standalone: true,
  imports: [CommonModule, OrderFormComponent],
  template: `
    <div class="p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <app-order-form [forcedType]="'STOCK'" returnUrl="/stock"></app-order-form>
    </div>
  `
})
export class NuevoStockPageComponent {}
