import { inject } from '@angular/core';
import { Router, CanMatchFn, Route, UrlSegment } from '@angular/router';
import { SessionService } from '../session/session.service';

export const capabilityGuard = (requiredCapability: string): CanMatchFn => {
  return async (route: Route, segments: UrlSegment[]) => {
    const session = inject(SessionService);
    
    // Esperar a que la sesión esté inicializada (especialmente importante en F5)
    await session.waitUntilInitialized();

    // Si la capacidad está en la lista del negocio activo, permitimos cargar el bundle/ruta
    if (session.hasCapability(requiredCapability)) {
      return true;
    }

    console.warn(`[CapabilityGuard] Access denied for capability: ${requiredCapability}.`);
    return false;
  };
};
