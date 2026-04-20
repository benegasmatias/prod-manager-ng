import { Injectable, inject, signal, untracked } from '@angular/core';
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
    if (!businessId) {
      console.warn('[StockService] Intento de carga sin businessId activo');
      return;
    }

    // Usamos untracked para evitar que este método cree dependencias circulares si se llama desde un effect
    const shouldShowLoading = untracked(() => 
      this.activeOrders().length === 0 && this.inStockOrders().length === 0
    );

    if (shouldShowLoading) {
      this.loading.set(true);
    }

    // Safety Timeout
    const timeoutId = setTimeout(() => {
      if (untracked(() => this.loading())) {
        console.error('[StockService] TIMEOUT alcanzado. Forzando cierre.');
        this.loading.set(false);
      }
    }, 15000);

    try {
      const context = new HttpContext().set(HTTP_CACHE_CONFIG, {
        enabled: true,
        ttl: 5000, // Reducido a 5 segundos para mayor reactividad en manufactura
        forceRefresh: force
      });

      const res = await this.api.getListing({ businessId, type: 'STOCK', pageSize: 1000 }, context);
      console.log('[StockService] API respondió con:', res);
      
      const stockOrders = res?.data || [];
      console.log('[StockService] Procesando n items:', stockOrders.length);

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
      console.error('[StockService] Error crítico cargando stock:', e);
    } finally {
      clearTimeout(timeoutId);
      console.log('[StockService] loadStock finalizado');
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
