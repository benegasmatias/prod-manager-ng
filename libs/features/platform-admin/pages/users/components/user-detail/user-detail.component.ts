import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, User, Mail, Phone, MapPin, Building, Calendar, Info, Activity, Shield, X, History, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-angular';
import { PlatformAdminService } from '../../../../services/platform-admin.service';
import { ToastService } from '../../../../../../shared/services/toast.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './user-detail.component.html',
  styles: [`
    :host { display: block; }
  `]
})
export class UserDetailComponent implements OnInit {
  private adminService = inject(PlatformAdminService);
  private toast = inject(ToastService);

  constructor() {
    LucideAngularModule.pick({
      User, Mail, Phone, MapPin, Building, Calendar, Info, Activity, Shield, X, History, ExternalLink, ShieldCheck, CheckCircle2
    });
  }

  @Input() userId!: string;
  @Output() close = new EventEmitter<void>();

  user = signal<any | null>(null);
  logs = signal<any[]>([]);
  loading = signal<boolean>(true);
  activeTab = signal<'info' | 'activity'>('info');

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      this.loading.set(true);
      const [userData, logsData] = await Promise.all([
        this.adminService.getUserDetail(this.userId),
        this.adminService.getUserLogs(this.userId)
      ]);
      this.user.set(userData);
      this.logs.set(logsData);
    } catch (e) {
      this.toast.error('Error al cargar detalles del usuario');
      this.close.emit();
    } finally {
      this.loading.set(false);
    }
  }

  getStatusStyles(status: string) {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'BLOCKED': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'SUSPENDED': return 'bg-zinc-500/10 text-zinc-400 border-zinc-700';
      case 'DELETED': return 'bg-black text-zinc-600 border-zinc-800';
      default: return 'bg-zinc-800 text-zinc-400';
    }
  }
}
