import { Injectable, signal } from '@angular/core';

/**
 * Servicio atómico de infraestructura para romper dependencias circulares.
 * Solo almacena el ID del negocio activo de forma reactiva.
 */
@Injectable({ providedIn: 'root' })
export class BusinessContextService {
  private _activeId = signal<string | null>(null);
  
  /** Signal de solo lectura para ser consumido por interceptores y servicios */
  activeId = this._activeId.asReadonly();

  /** Actualiza el ID del negocio globalmente */
  setBusinessId(id: string | null) {
    this._activeId.set(id);
  }
}
