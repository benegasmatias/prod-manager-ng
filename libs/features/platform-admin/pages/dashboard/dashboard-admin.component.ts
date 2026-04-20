import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Users, Building2, ShieldAlert, CheckCircle2, ArrowUpRight, Terminal } from 'lucide-angular';
import { PlatformAdminService } from '../../services/platform-admin.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './dashboard-admin.component.html',
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardAdminComponent implements OnInit {
  private adminService = inject(PlatformAdminService);
  
  stats = signal<any>(null);
  loading = signal<boolean>(true);

  constructor() {
    // Force icon registration
    LucideAngularModule.pick({
      Users,
      Building2,
      ShieldAlert,
      CheckCircle2,
      ArrowUpRight,
      Terminal
    });
  }

  async ngOnInit() {
    try {
      this.loading.set(true);
      const data = await this.adminService.getStats();
      this.stats.set(data);
    } catch (e) {
      console.error('Error loading stats', e);
    } finally {
      this.loading.set(false);
    }
  }

  getPendingUsers(): number {
    const breakdown = this.stats()?.users?.breakdown;
    if (!breakdown) return 0;
    return breakdown.find((s: any) => s.status === 'PENDING')?.count || 0;
  }
}
