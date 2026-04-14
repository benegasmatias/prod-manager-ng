import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OrderFormComponent } from '../components/form';

@Component({
  selector: 'app-editar-pedido-page',
  standalone: true,
  imports: [CommonModule, OrderFormComponent],
  template: `
    <div class="p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <app-order-form [id]="orderId"></app-order-form>
    </div>
  `
})
export class EditarPedidoPageComponent {
  private route = inject(ActivatedRoute);
  orderId = this.route.snapshot.paramMap.get('id') || '';
}
