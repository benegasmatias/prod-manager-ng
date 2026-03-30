import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { ApiService } from '../api/api.service';
import { SessionService } from '../session/session.service';
import { Notification } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private api = inject(ApiService);
  private session = inject(SessionService);

  private _notifications = signal<Notification[]>([]);
  private _isLoading = signal(false);

  notifications = computed(() => this._notifications());
  unreadCount = computed(() => this._notifications().filter(n => !n.isRead).length);
  isLoading = computed(() => this._isLoading());

  private lastBusinessId: string | null = null;

  constructor() {
    // Escuchar cambios en el negocio activo para refrescar notificaciones
    effect(() => {
      const businessId = this.session.activeId();
      if (businessId && businessId !== this.lastBusinessId) {
        this.lastBusinessId = businessId;
        console.log('[NotificationsService] Business changed, refreshing:', businessId);
        this.refresh();
      } else if (!businessId) {
        this.lastBusinessId = null;
        this._notifications.set([]);
      }
    });
  }

  async refresh() {
    const businessId = this.session.activeId();
    if (!businessId) return;

    this._isLoading.set(true);
    try {
      const data = await this.api.notifications.getAll(businessId);
      this._notifications.set(data || []);
    } catch (error) {
      console.error('[NotificationsService] Error loading notifications:', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  async markAsRead(id: string) {
    try {
      // Optimistic update
      this._notifications.update(list =>
        list.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      await this.api.notifications.markAsRead(id);
    } catch (error) {
      console.error('[NotificationsService] Error marking as read:', error);
      this.refresh(); // Sync back on error
    }
  }

  async markAllAsRead() {
    const businessId = this.session.activeId();
    try {
      // Optimistic update
      this._notifications.update(list =>
        list.map(n => ({ ...n, isRead: true }))
      );
      await this.api.notifications.markAllAsRead(businessId || undefined);
    } catch (error) {
      console.error('[NotificationsService] Error marking all as read:', error);
      this.refresh();
    }
  }

  async remove(id: string) {
    try {
      // Optimistic update
      this._notifications.update(list => list.filter(n => n.id !== id));
      await this.api.notifications.remove(id);
    } catch (error) {
      console.error('[NotificationsService] Error removing notification:', error);
      this.refresh();
    }
  }

  async removeAll() {
    const businessId = this.session.activeId();
    try {
      // Optimistic update
      this._notifications.set([]);
      await this.api.notifications.removeAll(businessId || undefined);
    } catch (error) {
      console.error('[NotificationsService] Error removing all notifications:', error);
      this.refresh();
    }
  }
}
