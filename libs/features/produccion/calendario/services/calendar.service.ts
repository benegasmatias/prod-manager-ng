import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PedidosApiService } from '@core/api/pedidos.api.service';
import { CalendarOrderEvent, RiskLevel, UrgencyLevel } from '../models/calendar.models';
import { Pedido } from '@shared/models';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private api = inject(PedidosApiService);

  async getEvents(businessId: string, from: Date, to: Date): Promise<CalendarOrderEvent[]> {
    // In a real scenario, we'd use a specific calendar endpoint.
    // For now, we reuse the listing API and map the data.
    const response = await this.api.getListing({
      businessId,
      startDate: from.toISOString(),
      endDate: to.toISOString(),
      pageSize: 1000 // Large page for calendar visibility
    });

    return (response.data || []).map(order => this.mapToCalendarEvent(order));
  }

  private mapToCalendarEvent(order: Pedido): CalendarOrderEvent {
    const risk = this.calculateRisk(order);
    const urgency = this.calculateUrgency(order);
    const isAssigned = !!(order.responsableId || order.operatorId);
    
    // Basic progress calculation
    const completionPercentage = this.calculateProgress(order);

    return {
      ...order,
      risk,
      urgency,
      isAssigned,
      completionPercentage
    };
  }

  private calculateRisk(order: Pedido): { level: RiskLevel; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    const today = new Date();
    const dueDate = order.dueDate ? new Date(order.dueDate) : null;
    
    // 1. Overdue logic
    if (dueDate && dueDate < today && order.status !== 'DONE' && order.status !== 'DELIVERED') {
      score += 50;
      reasons.push('Plazo de entrega vencido');
    }

    // 2. Assignment risk
    if (!order.responsableId && !order.operatorId && order.status !== 'PENDING') {
      score += 20;
      reasons.push('Sin operador asignado');
    }

    // 3. Progress risk
    const progress = this.calculateProgress(order);
    if (dueDate) {
      const timeRemaining = dueDate.getTime() - today.getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (timeRemaining < oneDay && progress < 80) {
        score += 30;
        reasons.push('Entrega inminente con progreso insuficiente');
      }
    }

    if (order.status === 'FAILED') {
      score += 40;
      reasons.push('Producción bloqueada por fallo');
    }

    let level: RiskLevel = 'NONE';
    if (score >= 70) level = 'CRITICAL';
    else if (score >= 40) level = 'HIGH';
    else if (score >= 20) level = 'MEDIUM';
    else if (score > 0) level = 'LOW';

    return { level, reasons };
  }

  private calculateUrgency(order: Pedido): UrgencyLevel {
    if (!order.dueDate) return 'NORMAL';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(order.dueDate);
    due.setHours(0, 0, 0, 0);

    const diff = due.getTime() - today.getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    if (diff < 0) return 'OVERDUE';
    if (diff === 0) return 'TODAY';
    if (diff <= dayMs * 3) return 'UPCOMING';
    return 'NORMAL';
  }

  private calculateProgress(order: Pedido): number {
    const stages: Record<string, number> = {
      'PENDING': 0,
      'DESIGN': 20,
      'APPROVED': 25,
      'IN_PROGRESS': 50,
      'POST_PROCESS': 80,
      'DONE': 100,
      'DELIVERED': 100,
      'IN_STOCK': 100
    };
    return stages[order.status] || 0;
  }
}
