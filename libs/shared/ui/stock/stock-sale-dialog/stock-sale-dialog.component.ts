import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pedido } from '../../../models';
import { LucideAngularModule, X, Check, ShoppingBag, User, Calendar, FileText, BadgeDollarSign } from 'lucide-angular';
import { ButtonSpinnerComponent } from '../../button-spinner/button-spinner.component';
import { UI_LABELS } from '../../../config/ui-labels.config';

@Component({
  selector: 'app-stock-sale-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonSpinnerComponent],
  templateUrl: './stock-sale-dialog.component.html',
  styles: [`:host { display: contents; }`]
})
export class StockSaleDialogComponent implements OnChanges {
  @Input() order: Pedido | null = null;
  @Input() isOpen = false;
  @Input() isSubmitting = false;

  @Output() onClose = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<{ price: number; clientName: string; date: string; notes: string }>();

  icons = { X, Check, ShoppingBag, User, Calendar, FileText, BadgeDollarSign };
  labels = UI_LABELS;

  formData = {
    price: 0,
    clientName: '',
    date: new Date().toISOString().slice(0, 10),
    notes: ''
  };

  ngOnChanges(changes: any) {
    if (changes['isOpen']?.currentValue && this.order) {
      this.formData = {
        price: Number(this.order.totalPrice || this.order.total || 0),
        clientName: '',
        date: new Date().toISOString().slice(0, 10),
        notes: ''
      };
    }
  }

  close() {
    if (!this.isSubmitting) this.onClose.emit();
  }

  submit() {
    if (!this.formData.clientName || this.formData.price <= 0) return;
    this.onConfirm.emit({ ...this.formData });
  }
}
