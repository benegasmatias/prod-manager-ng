import { HttpContextToken } from '@angular/common/http';

export interface CacheOptions {
  enabled: boolean;
  ttl?: number;      // Tiempo de vida en ms
  forceRefresh?: boolean; // Ignorar cache actual
  tag?: string;      // Tag para invalidación grupal (v2)
}

export const HTTP_CACHE_CONFIG = new HttpContextToken<CacheOptions>(() => ({
  enabled: false,
  ttl: 300000 // 5 minutos por defecto
}));
