/**
 * Centralized keys for local storage to avoid magic strings across the app.
 */
export const STORAGE_KEYS = {
  ACTIVE_BUSINESS_ID: 'prodmanager_negocio_activo',
  THEME_MODE: 'prodmanager_theme_mode',
  USER_SESSION: 'prodmanager_user_session',
} as const;

/**
 * Common fallback values and configuration constants.
 */
export const APP_CONFIG = {
  DEFAULT_CURRENCY: 'ARS',
  DEFAULT_RUBRO: 'GENERICO',
  TRANSITION_DURATION_MS: 200,
} as const;

/**
 * Reusable layout constants.
 */
export const LAYOUT_CONSTANTS = {
  SIDEBAR_WIDTH_EXPANDED: 260,
  SIDEBAR_WIDTH_COLLAPSED: 78,
  NAVBAR_HEIGHT: 64,
} as const;
