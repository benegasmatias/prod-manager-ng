import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { ApiService } from '../api/api.service';
import { AuthService } from '../auth/auth.service';
import { Negocio, Rubro, NegocioConfig } from '../../shared/models';
import { getNegocioConfig, mapCategoryToRubro } from '../../shared/utils';
import { STORAGE_KEYS, APP_CONFIG } from '../../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  private _negocios = signal<Negocio[]>([]);
  negocios = computed(() => this._negocios());

  private _activeId = signal<string | null>(localStorage.getItem(STORAGE_KEYS.ACTIVE_BUSINESS_ID));
  activeId = computed(() => this._activeId());

  // El negocio activo es computado basado en la lista y el ID actual
  activeNegocio = computed<Negocio | null>(() => 
    this._negocios().find(n => n.id === this._activeId()) || this._negocios()[0] || null
  );

  // La configuración se deriva dinámicamente del rubro del negocio activo
  config = computed<NegocioConfig>(() => 
    getNegocioConfig(this.activeNegocio()?.rubro || APP_CONFIG.DEFAULT_RUBRO)
  );

  // Rubro del negocio activo para fácil acceso
  rubro = computed<Rubro>(() => 
    this.activeNegocio()?.rubro || APP_CONFIG.DEFAULT_RUBRO
  );

  isInitialized = signal(false);

  private lastUserId: string | null = null;

  constructor() {
    // Reaccionar al cambio de sesión
    effect(() => {
      const session = this.auth.session();
      if (session) {
        // Solo inicializar si el usuario cambió o si no está inicializado
        if (this.lastUserId !== session.user.id) {
          this.lastUserId = session.user.id;
          this.initialize();
        }
      } else {
        this.lastUserId = null;
        this._negocios.set([]);
        this._activeId.set(null);
        this.isInitialized.set(true);
      }
    });
  }

  private async initialize() {
    try {
      const data = await this.api.businesses.getAll();
      const mapped: Negocio[] = (data || []).map((b: any) => ({
          id: b.id,
          nombre: b.name,
          rubro: mapCategoryToRubro(b.category),
          moneda: b.currency || APP_CONFIG.DEFAULT_CURRENCY,
          status: b.status,
          subscriptionExpiresAt: b.subscriptionExpiresAt,
          createdAt: b.createdAt
      }));

      this._negocios.set(mapped);

      // Si no tenemos ID activo, intentamos obtener el perfil del usuario
      if (!this._activeId()) {
        const profile = await this.api.users.getMe();
        const defaultId = profile?.defaultBusinessId;
        
        if (defaultId && mapped.find(n => n.id === defaultId)) {
          this.setActiveId(defaultId);
        } else if (mapped.length === 1) {
          // Si solo hay uno, lo seteamos automáticamente
          this.setActiveId(mapped[0].id);
        }
        // Si hay más de uno y no hay default, el BusinessGuard se encargará de redirigir
      }

      this.isInitialized.set(true);
    } catch (error) {
      console.error('[SessionService] Initialization error:', error);
      this.isInitialized.set(true);
    }
  }

  setActiveId(id: string) {
    this._activeId.set(id);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BUSINESS_ID, id);
    // Intentar persistir en el servidor en background
    this.api.users.setDefaultBusiness(id).catch(() => {});
  }

  async addNegocio(nombre: string, rubro: Rubro) {
    try {
      const b = await this.api.businesses.create({ name: nombre, category: rubro });
      const newNegocio: Negocio = {
        id: b.id,
        nombre: b.name,
        rubro: mapCategoryToRubro(b.category),
        moneda: b.currency || 'ARS',
        status: b.status,
        subscriptionExpiresAt: b.subscriptionExpiresAt,
        createdAt: b.createdAt
      };
      this._negocios.update(list => [...list, newNegocio]);
      return newNegocio;
    } catch (error) {
      console.error('[SessionService] Error adding business:', error);
      throw error;
    }
  }

  async updateNegocio(id: string, updates: Partial<Negocio>) {
    try {
      const b = await this.api.businesses.update(id, {
        name: updates.nombre,
        category: updates.rubro,
        currency: updates.moneda
      });
      this._negocios.update(list => list.map(n => n.id === id ? {
        ...n,
        nombre: b.name,
        rubro: mapCategoryToRubro(b.category),
        moneda: b.currency
      } : n));
    } catch (error) {
      console.error('[SessionService] Error updating business:', error);
      throw error;
    }
  }

  async removeNegocio(id: string) {
    try {
      await this.api.businesses.delete(id);
      this._negocios.update(list => list.filter(n => n.id !== id));
      if (this.activeId() === id) {
        const next = this._negocios()[0];
        if (next) this.setActiveId(next.id);
      }
    } catch (error) {
      console.error('[SessionService] Error removing business:', error);
      throw error;
    }
  }
}
