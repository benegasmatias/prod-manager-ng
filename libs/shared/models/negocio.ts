export type Rubro = 'IMPRESION_3D' | 'METALURGICA' | 'CARPINTERIA' | 'GENERICO';

export interface Negocio {
  id: string;
  nombre: string;
  rubro: Rubro;
  moneda?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
  subscriptionExpiresAt?: string;
  createdAt: string;
}

export interface CampoItem {
  key: string;
  label: string;
  tipo: 'text' | 'number' | 'money' | 'url' | 'textarea' | 'select' | 'boolean' | 'header' | 'material-select' | 'multiselect' | 'checkbox-group' | 'date';
  required?: boolean;
  section?: string;
  options?: string[];
  placeholder?: string;
  className?: string;
  visibleIf?: {
    key: string;
    values: (string | boolean | number)[];
  };
}

export interface StatMetric {
  key: string;
  label: string;
  icon: string;
  format?: 'currency' | 'number';
}

export interface NegocioConfig {
  sidebarItems: string[];
  itemFields: CampoItem[];
  labels: {
    produccion: string;
    items: string;
    maquinas: string;
    materiales: string;
    unidadName: string;
    unidadModel: string;
    [key: string]: string | undefined;
  };
  icons: Record<string, string>;
  stats: StatMetric[];
  productionStages: { key: string; label: string; color: string }[];
  materialConfig: {
    namePlaceholder: string;
    brandPlaceholder: string;
    types: { key: string; label: string }[];
    units: { key: string; label: string }[];
    defaultUnit: string;
    defaultType: string;
  };
  staffPlaceholder: string;
  features: {
    hasNozzle: boolean;
    hasMaxFilaments: boolean;
    hasVisits: boolean;
    hasQuotes: boolean;
    hasMaterials: boolean;
  };
  machineStatusLabels?: Record<string, string>;
}
