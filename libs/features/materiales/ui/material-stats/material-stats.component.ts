import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Package, Weight, Activity } from 'lucide-angular';

@Component({
  selector: 'app-material-stats',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './material-stats.component.html',
  styleUrls: ['./material-stats.component.scss']
})
export class MaterialStatsComponent {
  stats = input.required<{
    count: number;
    critical: number;
    estimatedValue: number;
  }>();

  readonly icons = { Package, Weight, Activity };
}
