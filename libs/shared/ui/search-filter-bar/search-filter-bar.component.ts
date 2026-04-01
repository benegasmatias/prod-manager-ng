import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Calendar, User, ChevronDown, Filter, X } from 'lucide-angular';
import { Employee } from '@shared/models/pedido';
import { cn } from '@shared/utils/cn';

export interface FilterValues {
  search?: string;
  startDate?: string;
  endDate?: string;
  technician?: string;
  status?: string;
  urgency?: string;
  [key: string]: any;
}

export interface FilterOptions {
  statuses?: { label: string; value: string }[];
  technicians?: Employee[];
  urgencies?: { label: string; value: string }[];
}

import { AppDatePickerComponent } from '../app-date-picker/app-date-picker.component';

@Component({
  selector: 'app-search-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, AppDatePickerComponent],
  templateUrl: './search-filter-bar.component.html'
})
export class SearchFilterBarComponent {
  @Input() values: FilterValues = {};
  @Input() options?: FilterOptions;
  
  // Visibility
  @Input() showSearch = true;
  @Input() showDates = true;
  @Input() showTechnician = true;
  @Input() showStatus = true;
  @Input() showUrgency = false;
  
  @Input() className = '';

  @Output() valueChange = new EventEmitter<{ key: string, value: any }>();
  @Output() clear = new EventEmitter<void>();

  onValueChange(key: string, value: any) {
    this.valueChange.emit({ key, value });
  }

  hasActiveFilters(): boolean {
    if (!this.values) return false;
    return !!(
      this.values.search || 
      this.values.startDate || 
      this.values.endDate || 
      (this.values.technician && this.values.technician !== 'all') || 
      (this.values.status && this.values.status !== 'all') ||
      (this.values.urgency && this.values.urgency !== 'all')
    );
  }

  protected readonly icons = { Search, Calendar, User, ChevronDown, Filter, X };

  isExpanded = false;

  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  cn = cn;
}
