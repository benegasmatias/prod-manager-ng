import { Injectable, inject, signal } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { PedidosApiService } from './pedidos.api.service';
import { SessionService } from '../session/session.service';
import { Pedido } from '../../shared/models';
import { HTTP_CACHE_CONFIG } from '../cache/cache.context';

export interface StockStats {
  totalInvestment: number;
  pendingProfit: number;
  activeOrdersCount: number;
}

@Injectable({ providedIn: 'root' })
export class StockService {
  private api = inject(PedidosApiService);
  private session = inject(SessionService);

  loading = signal(false);
  activeOrders = signal<Pedido[]>([]);
  inStockOrders = signal<Pedido[]>([]);
  stockStats = signal<StockStats>({ totalInvestment: 0, pendingProfit: 0, activeOrdersCount: 0 });

  async loadStock(force = false) {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) return;

    if (this.activeOrders().length === 0 && this.inStockOrders().length === 0) {
      this.loading.set(true);
    }

    try {
      const context = new HttpContext().set(HTTP_CACHE_CONFIG, {
        enabled: true,
        ttl: 120000, // 2 minutos de cache para stock
        forceRefresh: force
      });

      // Traemos un lote grande porque el NextJS original los procesaba todos del lado del cliente
      const res = await this.api.getListing({ businessId, type: 'STOCK', pageSize: 1000 }, context);
      const stockOrders = res.data;

      // Filtrado basado en la lógica de page.tsx (Next.js)
      const activos = stockOrders.filter(o => o.status !== 'IN_STOCK' && o.status !== 'CANCELLED');
      const inStock = stockOrders.filter(o => o.status === 'IN_STOCK');

      this.activeOrders.set(activos);
      this.inStockOrders.set(inStock);

      this.stockStats.set({
        totalInvestment: stockOrders.reduce((acc, o) => acc + (Number(o.totalPrice || o.total || 0)), 0),
        pendingProfit: stockOrders.reduce((acc, o) => acc + (Number(o.profit || 0)), 0),
        activeOrdersCount: activos.length
      });
    } catch (e) {
      console.error('Error loadStock:', e);
    } finally {
      this.loading.set(false);
    }
  }

  async sellStock(orderId: string, data: { price: number; clientName: string; date: string; notes: string }) {
    await this.api.update(orderId, {
      status: 'DELIVERED',
      type: 'CLIENT',
      clientName: data.clientName,
      totalPrice: data.price,
      dueDate: new Date(data.date).toISOString(),
      notes: data.notes
    });
    // Volvemos a cargar luego de la venta exitosa
    await this.loadStock();
  }
}
