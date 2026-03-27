import { Rubro, NegocioConfig, StatMetric } from '../models/negocio';

export function getNegocioConfig(rubro: Rubro): NegocioConfig {
  const commonStats: StatMetric[] = [
    { key: 'totalSales', label: 'Ventas Totales', icon: 'TrendingUp', format: 'currency' },
    { key: 'pendingBalance', label: 'Saldo a Cobrar', icon: 'Wallet', format: 'currency' },
  ];

  switch (rubro) {
    case 'IMPRESION_3D':
      return {
        sidebarItems: ['/dashboard', '/pedidos', '/stock', '/clientes', '/personal', '/maquinas', '/materiales', '/reportes', '/ajustes'],
        labels: {
          produccion: 'Producción',
          items: 'Modelos a Imprimir',
          maquinas: 'Impresoras',
          materiales: 'Filamentos',
          unidadName: 'Nombre de Impresora',
          unidadModel: 'Modelo / Marca',
        },
        icons: {
          pedidos: 'Box',
          produccion: 'Cpu',
          maquinas: 'Printer',
          materiales: 'Layers',
        },
        stats: [
          ...commonStats,
          { key: 'productionOrders', label: 'Producción en Curso', icon: 'Printer', format: 'number' },
          { key: 'activePrinters', label: 'Impresoras Activas', icon: 'Zap', format: 'number' },
        ],
        productionStages: [
          { key: 'PENDING', label: 'Pendiente', color: 'bg-zinc-100' },
          { key: 'DESIGN', label: 'En Diseño', color: 'bg-indigo-500' },
          { key: 'IN_PROGRESS', label: 'Imprimiendo', color: 'bg-blue-500' },
          { key: 'FAILED', label: 'Fallo de Impresión', color: 'bg-red-500' },
          { key: 'REPRINT_PENDING', label: 'Pendiente Reimpresión', color: 'bg-orange-400' },
          { key: 'POST_PROCESS', label: 'Post-Proceso', color: 'bg-amber-500' },
          { key: 'DONE', label: 'Terminado', color: 'bg-emerald-500' },
          { key: 'DELIVERED', label: 'Entregado', color: 'bg-zinc-100' },
          { key: 'IN_STOCK', label: 'Ingresado a Stock', color: 'bg-purple-500' },
        ],
        materialConfig: {
          namePlaceholder: 'Ej: PLA Negro Pro / PETG Gris',
          brandPlaceholder: 'Ej: Grilon3 / Printalot',
          defaultUnit: 'g',
          defaultType: 'PLA',
          types: [
            { key: 'PLA', label: 'PLA' },
            { key: 'PETG', label: 'PETG' },
            { key: 'ABS', label: 'ABS' },
            { key: 'TPU', label: 'TPU' },
            { key: 'RESIN', label: 'RESINA' },
            { key: 'LIMPIEZA', label: 'FILAMENTO LIMPIEZA' },
          ],
          units: [
            { key: 'g', label: 'Gramos (g)' },
            { key: 'kg', label: 'Kilos (kg)' },
          ],
        },
        itemFields: [
          { key: 'nombreProducto', label: 'Nombre del Modelo / Trabajo', tipo: 'text', section: 'INFORMACIÓN DEL TRABAJO', required: true, placeholder: 'Ej. Llavero de pared' },
          { key: 'tipo_filamento', label: 'Tipo de Filamento (General)', tipo: 'select', section: 'INFORMACIÓN DEL TRABAJO', options: ['PLA', 'PETG', 'ABS', 'TPU', 'RESIN', 'NYLON', 'FLEX'], required: false },
          { key: 'seDiseñaSTL', label: '¿Se diseña el STL?', tipo: 'boolean', section: 'INFORMACIÓN DEL TRABAJO' },
          { key: 'precioDiseno', label: 'Costo de Diseño ($)', tipo: 'money', section: 'INFORMACIÓN DEL TRABAJO', placeholder: 'Ej. 2500' },
          { key: 'url_stl', label: 'URL STL', tipo: 'url', section: 'INFORMACIÓN DEL TRABAJO', placeholder: 'https://...' },
          { key: 'peso_gramos', label: 'Peso estimado (g)', tipo: 'number', section: 'ESPECIFICACIONES TÉCNICAS', placeholder: 'Ej. 150' },
          { key: 'duracion_estimada_minutos', label: 'Duración (min)', tipo: 'number', section: 'ESPECIFICACIONES TÉCNICAS', placeholder: 'Ej. 120' },
        ],
        staffPlaceholder: 'Ej: Operario de Impresión, Modelador, Post-procesado...',
      };

    case 'METALURGICA':
      return {
        sidebarItems: ['/dashboard', '/visitas', '/presupuestos', '/pedidos', '/stock', '/clientes', '/personal', '/materiales', '/maquinas', '/reportes', '/ajustes'],
        labels: {
          produccion: 'Monitor de Taller',
          items: 'Planos y Estructuras',
          maquinas: 'Puestos de Trabajo',
          materiales: 'Materiales',
          unidadName: 'Nombre del Puesto / Operario',
          unidadModel: 'Especialidad / Equipo',
        },
        icons: {
          visitas: 'Calendar',
          presupuestos: 'Zap',
          pedidos: 'FileText',
          produccion: 'Cog',
          maquinas: 'Wrench',
          materiales: 'Grid',
        },
        stats: [
          ...commonStats,
          { key: 'productionOrders', label: 'Fabricación en Curso', icon: 'Cog', format: 'number' },
          { key: 'activeOrders', label: 'Proyectos Activos', icon: 'HardHat', format: 'number' },
        ],
        productionStages: [
          { key: 'SITE_VISIT', label: 'Visita Técnica', color: 'bg-indigo-500' },
          { key: 'SITE_VISIT_DONE', label: 'Visita Realizada', color: 'bg-emerald-500' },
          { key: 'VISITA_REPROGRAMADA', label: 'Visita Reprogramada', color: 'bg-orange-400' },
          { key: 'VISITA_CANCELADA', label: 'Visita Cancelada', color: 'bg-red-400' },
          { key: 'QUOTATION', label: 'Presupuesto Pendiente', color: 'bg-blue-500' },
          { key: 'BUDGET_GENERATED', label: 'Presupuesto Enviado', color: 'bg-amber-500' },
          { key: 'BUDGET_REJECTED', label: 'Presupuesto Rechazado', color: 'bg-zinc-400' },
          { key: 'SURVEY_DESIGN', label: 'Relevamiento / Diseño', color: 'bg-blue-400' },
          { key: 'APPROVED', label: 'Presupuesto Confirmado', color: 'bg-primary' },
          { key: 'OFFICIAL_ORDER', label: 'En Taller / Cola', color: 'bg-zinc-100' },
          { key: 'CUTTING', label: 'Corte', color: 'bg-orange-500' },
          { key: 'WELDING', label: 'Soldadura', color: 'bg-blue-600' },
          { key: 'ASSEMBLY', label: 'Armado', color: 'bg-amber-600' },
          { key: 'PAINTING', label: 'Pintura', color: 'bg-purple-500' },
          { key: 'INSTALACION_OBRA', label: 'Instalación en Obra', color: 'bg-indigo-600' },
          { key: 'FAILED', label: 'Fallo / Error', color: 'bg-red-500' },
          { key: 'DONE', label: 'Listo p/ Entrega', color: 'bg-emerald-500' },
          { key: 'DELIVERED', label: 'Entregado (Cerrado)', color: 'bg-zinc-100' },
        ],
        materialConfig: {
          namePlaceholder: 'Ej: Caño 40x40 / Chapa N18 / Electrodo 6013',
          brandPlaceholder: 'Ej: Acer Bragado / Acindar / Sin Marca',
          defaultUnit: 'm',
          defaultType: 'PERFIL',
          types: [
            { key: 'PERFIL', label: 'PERFIL / CAÑO' },
            { key: 'CHAPA', label: 'CHAPA' },
            { key: 'MACHO', label: 'MACHIMBRE' },
            { key: 'HERRAJE', label: 'HERRAJE / ACCESORIO' },
            { key: 'INSUMO', label: 'INSUMO (DISCO/ELECTRODO)' },
            { key: 'OTRO', label: 'OTRO' },
          ],
          units: [
            { key: 'm', label: 'Metros (m)' },
            { key: 'uds', label: 'Unidades (uds)' },
            { key: 'kg', label: 'Kilos (kg)' },
            { key: 'barras', label: 'Barras (6m)' },
            { key: 'placas', label: 'Placas/Chapas' },
          ],
        },
        itemFields: [
          { key: 'tipo_trabajo', label: 'Tipo de Trabajo', tipo: 'select', section: '1. INFORMACIÓN DEL TRABAJO', options: ['Portón', 'Reja', 'Escalera', 'Estructura', 'Puerta', 'Paño Fijo', 'Otro'], required: true },
          { key: 'typeAperture', label: 'Tipo de Apertura', tipo: 'select', section: '1. INFORMACIÓN DEL TRABAJO', options: ['CORREDIZO', 'BATIENTE', 'PIVOTANTE', 'FIJO'], visibleIf: { key: 'tipo_trabajo', values: ['Portón', 'Puerta', 'Paño Fijo', 'Pivotante'] } },
          { key: 'nombreProducto', label: 'Descripción del ítem', tipo: 'text', section: '1. INFORMACIÓN DEL TRABAJO', required: true, placeholder: 'Ej: Portón principal frente' },
          { key: 'medidas', label: 'Medidas Exactas', tipo: 'text', section: '1. INFORMACIÓN DEL TRABAJO', placeholder: 'Ej: 3.50 x 2.10 m' },
          { key: 'material', label: 'Materiales a utilizar', tipo: 'text', section: '1. INFORMACIÓN DEL TRABAJO', placeholder: 'Ej: Caño 40x40, Chapa N18' },
          { key: 'material_estructura', label: 'Cuerpo / Estructura (Caños)', tipo: 'text', section: '2. ESTRUCTURA', placeholder: 'Ej: Caño 40x40' },
          { key: 'refuerzos', label: 'Refuerzos Estructurales', tipo: 'boolean', section: '2. ESTRUCTURA', visibleIf: { key: 'tipo_trabajo', values: ['Portón', 'Portón Batiente', 'Estructura', 'Puerta'] } },
          { key: 'fillMaterial', label: 'Material de Relleno', tipo: 'select', section: '3. RELLENO / REVESTIMIENTO', options: ['MADERA', 'CHAPA', 'CHAPA_PERFORADA', 'BARROTES', 'MIXTO'] },
          { key: 'revestimiento', label: 'Detalle de Relleno', tipo: 'text', section: '3. RELLENO / REVESTIMIENTO', placeholder: 'Ej: Machimbre de Pino / Chapa N°18' },
          { key: 'terminacion', label: 'Tratamiento / Pintura', tipo: 'text', section: '4. TERMINACIÓN', placeholder: 'Ej: Pintura epoxi al horno' },
          { key: 'color', label: 'Color / Tono Final', tipo: 'text', section: '4. TERMINACIÓN', placeholder: 'Ej: Negro microtexturado' },
          { key: 'accessories', label: 'Accesorios Incluidos', tipo: 'checkbox-group', section: '5. INSTALACIÓN / ACCESORIOS', options: ['RIEL', 'RUEDAS', 'MOTOR', 'CERRADURA', 'PASADORES', 'BISAGRAS'] },
          { key: 'instalacion', label: '¿Requiere Instalación en Obra?', tipo: 'boolean', section: '5. INSTALACIÓN / ACCESORIOS' },
          { key: 'costo_instalacion', label: 'Costo de Instalación ($)', tipo: 'money', section: '5. INSTALACIÓN / ACCESORIOS', placeholder: 'Ej: 15000', visibleIf: { key: 'instalacion', values: [true] } },
        ],
        staffPlaceholder: 'Ej: Soldador, Pintor, Armado, Plegador...',
      };

    case 'CARPINTERIA':
      return {
        sidebarItems: ['/dashboard', '/pedidos', '/stock', '/clientes', '/personal', '/produccion', '/reportes', '/ajustes'],
        labels: {
          produccion: 'Estado de Armado',
          items: 'Muebles y Componentes',
          maquinas: 'Bancos / Operarios',
          materiales: 'Maderas',
          unidadName: 'Nombre del Banco / Operario',
          unidadModel: 'Especialidad / Herramientas',
        },
        icons: {
          pedidos: 'ClipboardList',
          produccion: 'Hammer',
          maquinas: 'Wrench',
          materiales: 'Trees',
        },
        stats: [
          ...commonStats,
          { key: 'productionOrders', label: 'Muebles en Armado', icon: 'Hammer', format: 'number' },
          { key: 'activeOrders', label: 'Pedidos Pendientes', icon: 'ShoppingCart', format: 'number' },
        ],
        productionStages: [
          { key: 'PENDING', label: 'Planificación', color: 'bg-zinc-100' },
          { key: 'CUTTING', label: 'Corte de Placas', color: 'bg-orange-400' },
          { key: 'ARMADO', label: 'En Armado', color: 'bg-blue-500' },
          { key: 'BARNIZADO', label: 'Lustre / Barniz', color: 'bg-amber-600' },
          { key: 'FAILED', label: 'Rehacer / Error', color: 'bg-red-500' },
          { key: 'RE_WORK', label: 'En Ajuste / Reparación', color: 'bg-orange-400' },
          { key: 'DONE', label: 'Terminado', color: 'bg-emerald-500' },
          { key: 'DELIVERED', label: 'Entregado', color: 'bg-zinc-100' },
          { key: 'IN_STOCK', label: 'Ingresado a Stock', color: 'bg-purple-500' },
        ],
        materialConfig: {
          namePlaceholder: 'Ej: Placa Melamina 18mm / Cola Vinílica',
          brandPlaceholder: 'Ej: Faplac / Egger / Sin Marca',
          defaultUnit: 'uds',
          defaultType: 'PLACA',
          types: [
            { key: 'PLACA', label: 'PLACA / TABLERO' },
            { key: 'MADERA', label: 'MADERA MACIZA / LISTÓN' },
            { key: 'HERRAJE', label: 'HERRAJE / TIRADOR' },
            { key: 'INSUMO', label: 'INSUMO (COLA/LIJA)' },
            { key: 'OTRO', label: 'OTRO' },
          ],
          units: [
            { key: 'uds', label: 'Unidades (uds)' },
            { key: 'm', label: 'Metros (m)' },
            { key: 'm2', label: 'M2 (Superficie)' },
          ],
        },
        itemFields: [
          { key: 'nombreProducto', label: 'Mueble / Producto', tipo: 'text', section: 'INFORMACIÓN DEL TRABAJO', required: true, placeholder: 'Ej. Mesa ratona' },
          { key: 'madera', label: 'Tipo de Madera', tipo: 'text', section: 'ESPECIFICACIONES TÉCNICAS', placeholder: 'Ej. Pino, Roble' },
          { key: 'medidas', label: 'Dimensiones Finales', tipo: 'text', section: 'INFORMACIÓN DEL TRABAJO', placeholder: 'Ej. 120 x 80 x 45 cm' },
          { key: 'herrajes', label: 'Detalle de Herrajes', tipo: 'textarea', section: 'ESPECIFICACIONES TÉCNICAS' },
        ],
        staffPlaceholder: 'Ej: Carpintero, Lijador, Lustrador, Diseñador...',
      };

    case 'GENERICO':
    default:
      return {
        sidebarItems: ['/dashboard', '/pedidos', '/stock', '/clientes', '/personal', '/produccion', '/reportes', '/ajustes'],
        labels: {
          produccion: 'Producción',
          items: 'Ítems de Pedido',
          maquinas: 'Unidades de Trabajo',
          materiales: 'Materiales',
          unidadName: 'Nombre de la Unidad',
          unidadModel: 'Tipo / Categoría',
        },
        icons: {
          pedidos: 'ShoppingCart',
          produccion: 'Cpu',
          maquinas: 'Wrench',
          materiales: 'Package',
        },
        stats: [
          ...commonStats,
          { key: 'activeOrders', label: 'Pedidos Activos', icon: 'ShoppingCart', format: 'number' },
          { key: 'productionOrders', label: 'En Fila de Trabajo', icon: 'Clock', format: 'number' },
        ],
        productionStages: [
          { key: 'PENDING', label: 'Pendiente', color: 'bg-zinc-100' },
          { key: 'IN_PROGRESS', label: 'En Proceso', color: 'bg-blue-500' },
          { key: 'FAILED', label: 'Fallo / Error', color: 'bg-red-500' },
          { key: 'RE_WORK', label: 'En Reparación', color: 'bg-orange-400' },
          { key: 'DONE', label: 'Terminado', color: 'bg-emerald-500' },
          { key: 'DELIVERED', label: 'Entregado', color: 'bg-zinc-100' },
          { key: 'IN_STOCK', label: 'Ingresado a Stock', color: 'bg-purple-500' },
        ],
        materialConfig: {
          namePlaceholder: 'Ej: Insumo General / Producto',
          brandPlaceholder: 'Ej: Marca / Proveedor',
          defaultUnit: 'uds',
          defaultType: 'INSUMO',
          types: [
            { key: 'INSUMO', label: 'INSUMO / MATERIAL' },
            { key: 'PRODUCTO', label: 'PRODUCTO / REVENTA' },
            { key: 'OTRO', label: 'OTRO' },
          ],
          units: [
            { key: 'uds', label: 'Unidades (uds)' },
            { key: 'kg', label: 'Kilos (kg)' },
            { key: 'l', label: 'Litros (l)' },
          ],
        },
        itemFields: [
          { key: 'nombreProducto', label: 'Producto/Servicio', tipo: 'text', section: 'INFORMACIÓN DEL TRABAJO', required: true, placeholder: 'Ej. Servicio de pintura' },
          { key: 'descripcion', label: 'Descripción Extendida', tipo: 'textarea', section: 'INFORMACIÓN DEL TRABAJO' },
        ],
        staffPlaceholder: 'Ej: Operario, Vendedor, Administrativo...',
      };
  }
}

export function getStatusLabel(status: string, rubro?: Rubro): string {
  const config = getNegocioConfig(rubro || 'GENERICO');
  const stage = config.productionStages.find((s) => s.key === status);
  if (stage) return stage.label;

  const fallbacks: Record<string, string> = {
    PENDING: 'Pendiente',
    IN_PROGRESS: 'En Proceso',
    DONE: 'Terminado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Anulado',
    READY: 'Listo',
    FAILED: 'Fallido',
    IN_STOCK: 'En Stock',
  };

  return fallbacks[status] || status;
}

export function getStatusStyles(status: string, rubro?: Rubro): string {
  const config = getNegocioConfig(rubro || 'GENERICO');
  const stage = config.productionStages.find((s) => s.key === status);

  const color = stage?.color || (status === 'CANCELLED' ? 'bg-red-500' : 'bg-zinc-100');

  const parts = color.split('-');
  const baseColor = parts.length > 1 ? parts[1] : 'zinc';

  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
    amber: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50',
    rose: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50',
    blue: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50',
    red: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50',
    orange: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50',
    zinc: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800',
  };

  return colorMap[baseColor] || colorMap['zinc'];
}

export function mapCategoryToRubro(category: string): Rubro {
  const map: Record<string, Rubro> = {
    'IMPRESION_3D': 'IMPRESION_3D',
    'METALURGICA': 'METALURGICA',
    'CARPINTERIA': 'CARPINTERIA',
    'GENERICO': 'GENERICO'
  };
  return map[category] || 'GENERICO';
}
