import { Injectable } from '@angular/core';
import { Rubro } from '@shared/models/negocio';

export interface ItemCalculationResult {
  subtotal: number;
  diseno: number;
  instalacion: number;
  total: number;
  senia: number;
  unidades: number;
}

export interface OrderCalculationSummary {
  subtotal: number;
  diseno: number;
  instalacion: number;
  total: number;
  totalSenias: number;
  unidades: number;
  saldoPendiente: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderCalculatorService {

  /**
   * Calculates logic for a single item based on rubric-specific rules.
   */
  calculateItem(item: any, rubro: Rubro): ItemCalculationResult {
    const qty = Number(item.cantidad) || 0;
    const price = Number(item.precioUnitario) || 0;
    const itemSubtotal = qty * price;

    // Rubric-specific extra costs
    let designCost = 0;
    let installationCost = 0;

    if (rubro === 'IMPRESION_3D' && item.seDiseñaSTL) {
      designCost = Number(item.precioDiseno) || 0;
    }

    if (rubro === 'METALURGICA' && item.instalacion) {
      installationCost = Number(item.costo_instalacion) || 0;
    }

    return {
      subtotal: itemSubtotal,
      diseno: designCost,
      instalacion: installationCost,
      total: itemSubtotal + designCost + installationCost,
      senia: Number(item.senia) || 0,
      unidades: qty
    };
  }

  /**
   * Orchestrates the calculation of the entire order.
   */
  calculateOrder(items: any[], rubro: Rubro): OrderCalculationSummary {
    const summary = items.reduce((acc, item) => {
      const res = this.calculateItem(item, rubro);
      
      return {
        subtotal: acc.subtotal + res.subtotal,
        diseno: acc.diseno + res.diseno,
        instalacion: acc.instalacion + res.instalacion,
        total: acc.total + res.total,
        totalSenias: acc.totalSenias + res.senia,
        unidades: acc.unidades + res.unidades
      };
    }, {
      subtotal: 0,
      diseno: 0,
      instalacion: 0,
      total: 0,
      totalSenias: 0,
      unidades: 0
    });

    return {
      ...summary,
      saldoPendiente: summary.total - summary.totalSenias
    };
  }
}
