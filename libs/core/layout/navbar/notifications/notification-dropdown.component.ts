import { Component, inject, signal, computed, ChangeDetectionStrategy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Bell,
  Check,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  ExternalLink,
  Loader2,
  Trash2,
  X
} from 'lucide-angular';
import { NotificationsService } from '../../notifications.service';
import { LayoutService } from '../../layout.service';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="relative">
      <button 
        (click)="toggleDropdown($event)"
        class="h-10 w-10 flex items-center justify-center rounded-2xl relative hover:bg-zinc-100 dark:hover:bg-zinc-900 group transition-all"
      >
        <lucide-angular 
          [img]="icons.Bell" 
          class="h-4 w-4 text-zinc-500 group-hover:scale-110 transition-transform"
          [class.animate-pulse]="notificationsService.unreadCount() > 0"
          [class.text-primary]="notificationsService.unreadCount() > 0"
        ></lucide-angular>
        
        @if (notificationsService.unreadCount() > 0) {
          <span class="absolute top-2.5 right-2.5 h-4 w-4 flex items-center justify-center rounded-full bg-primary border-2 border-white dark:border-zinc-950 text-[9px] font-black text-white px-1">
            {{ notificationsService.unreadCount() > 9 ? '9+' : notificationsService.unreadCount() }}
          </span>
        }
      </button>

      <!-- Dropdown Content: App-style Responsive -->
      @if (isOpen()) {
        <div class="fixed inset-x-4 top-16 md:absolute md:top-13 md:right-0 md:inset-x-auto md:w-[380px] bg-white dark:bg-zinc-950 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl z-[150] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
          <div class="p-6 pb-4 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/10">
            <div>
              <h3 class="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-50">Notificaciones</h3>
              <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Alertas y Comunicados</p>
            </div>
            @if (notificationsService.unreadCount() > 0) {
              <button 
                (click)="notificationsService.markAllAsRead()"
                class="h-8 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl px-3 flex items-center gap-1"
              >
                <lucide-angular [img]="icons.Check" class="h-3 w-3"></lucide-angular>
                Marcar todo como leído
              </button>
            }
          </div>

          <div class="max-h-[400px] overflow-y-auto no-scrollbar">
            @if (notificationsService.isLoading() && notificationsService.notifications().length === 0) {
              <div class="p-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
                <lucide-angular [img]="icons.Loader2" class="h-8 w-8 animate-spin"></lucide-angular>
                <span class="text-[10px] font-black uppercase tracking-widest">Cargando...</span>
              </div>
            } @else if (notificationsService.notifications().length === 0) {
              <div class="p-12 flex flex-col items-center justify-center text-center gap-4">
                <div class="h-16 w-16 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                  <lucide-angular [img]="icons.Bell" class="h-8 w-8 text-zinc-200 dark:text-zinc-800"></lucide-angular>
                </div>
                <div class="space-y-1">
                  <p class="text-xs font-black uppercase tracking-tight text-zinc-400">No tenés notificaciones</p>
                  <p class="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Todo está al día por ahora</p>
                </div>
              </div>
            } @else {
              <div class="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                @for (n of notificationsService.notifications(); track n.id) {
                  <div 
                    class="p-5 transition-all relative flex gap-4 group"
                    [class.bg-primary/5]="!n.isRead"
                    [class.dark:bg-primary/10]="!n.isRead"
                    [class.hover:bg-zinc-50/50]="n.isRead"
                    [class.dark:hover:bg-zinc-900/50]="n.isRead"
                  >
                    <div class="mt-1 shrink-0">
                      <div 
                        class="h-9 w-9 rounded-xl flex items-center justify-center shadow-sm"
                        [class.bg-white]="!n.isRead"
                        [class.dark:bg-zinc-900]="!n.isRead"
                        [class.bg-zinc-50]="n.isRead"
                        [class.dark:bg-zinc-950]="n.isRead"
                      >
                        <lucide-angular [img]="getIcon(n.type)" class="h-4 w-4" [class]="getIconClass(n.type)"></lucide-angular>
                      </div>
                    </div>

                    <div class="flex-1 space-y-1.5 pr-2">
                       <div class="flex items-start justify-between">
                         <h4 
                           class="text-xs font-black tracking-tight leading-tight uppercase"
                           [class.text-zinc-900]="!n.isRead"
                           [class.dark:text-zinc-50]="!n.isRead"
                           [class.text-zinc-500]="n.isRead"
                         >
                           {{ n.title }}
                         </h4>
                         <div class="flex items-center gap-3 ml-2 shrink-0">
                           <span class="text-[9px] font-bold text-zinc-300 uppercase tracking-tighter whitespace-nowrap">
                             {{ getTimeAgo(n.createdAt) }}
                           </span>
                           <button 
                             (click)="notificationsService.remove(n.id)"
                             class="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-zinc-300 hover:text-rose-500 transition-all opacity-40 group-hover:opacity-100"
                           >
                             <lucide-angular [img]="icons.Trash2" class="h-3 w-3"></lucide-angular>
                           </button>
                         </div>
                       </div>
                       <p 
                         class="text-[11px] font-medium leading-relaxed italic"
                         [class.text-zinc-600]="!n.isRead"
                         [class.dark:text-zinc-400]="!n.isRead"
                         [class.text-zinc-400]="n.isRead"
                       >
                         {{ n.message }}
                       </p>
                       
                       @if (n.actionUrl || !n.isRead) {
                         <div class="flex gap-3 pt-2">
                            @if (n.actionUrl) {
                              <a [href]="n.actionUrl" class="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
                                {{ n.actionLabel || 'Ver más' }}
                                <lucide-angular [img]="icons.ExternalLink" class="h-2.5 w-2.5"></lucide-angular>
                              </a>
                            }
                            @if (!n.isRead) {
                              <button 
                                (click)="notificationsService.markAsRead(n.id)"
                                class="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 transition-colors"
                              >
                                Marcar como leída
                              </button>
                            }
                         </div>
                       }
                    </div>

                    @if (!n.isRead) {
                      <div class="absolute top-5 right-4 h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <div class="p-3 bg-zinc-50/50 dark:bg-zinc-900/10 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
            <button class="flex-1 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 h-9 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
              Historial
            </button>
            @if (notificationsService.notifications().length > 0) {
              <button 
                (click)="notificationsService.removeAll()"
                class="flex-1 text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 h-9 rounded-xl transition-colors"
              >
                Limpiar Todo
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationDropdownComponent {
  notificationsService = inject(NotificationsService);
  layoutService = inject(LayoutService);
  private elementRef = inject(ElementRef);
  
  isOpen = computed(() => this.layoutService.activeDropdown() === 'notifications');

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target) && this.isOpen()) {
      this.layoutService.activeDropdown.set(null);
    }
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    const next = !this.isOpen();
    this.layoutService.activeDropdown.set(next ? 'notifications' : null);
    if (next) {
      this.notificationsService.refresh();
    }
  }

  readonly icons = {
    Bell,
    Check,
    Info,
    AlertTriangle,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Trash2,
    ExternalLink,
    X
  };

  getIcon(type: string) {
    switch (type) {
      case 'success': return CheckCircle2;
      case 'warning': return AlertTriangle;
      case 'error': return AlertCircle;
      default: return Info;
    }
  }

  getIconClass(type: string) {
    switch (type) {
      case 'success': return 'text-emerald-500';
      case 'warning': return 'text-amber-500';
      case 'error': return 'text-rose-500';
      default: return 'text-blue-500';
    }
  }

  getTimeAgo(date: string) {
    const sec = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (sec < 60) return 'Ahora';
    const min = Math.floor(sec / 60);
    if (min < 60) return `Hace ${min}m`;
    const hours = Math.floor(min / 60);
    if (hours < 24) return `Hace ${hours}h`;
    return 'Reciente';
  }
}
