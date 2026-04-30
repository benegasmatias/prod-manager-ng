import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsApiService, ReportsSummary } from '../../core/api/reports.api.service';
import { SessionService } from '../../core/session/session.service';
import { MetricCardComponent, MetricCardsGridComponent } from '@shared/ui';
import { LucideAngularModule, TrendingUp, BarChart as BarChartIcon, PieChart as PieChartIcon, Calendar, Printer, Info, Activity, Package } from 'lucide-angular';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, MetricCardComponent, MetricCardsGridComponent, LucideAngularModule],
  template: `
    <div class="space-y-10 pb-32 sm:pb-16 px-8 pt-8 animate-in fade-in duration-700">
      <!-- Header Area -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div class="flex flex-col gap-1 text-left">
          <div class="flex items-center gap-2 mb-1">
            <div class="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
            <span class="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Inteligencia de Datos</span>
          </div>
          <h1 class="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            Análisis y <span class="text-primary italic">Métricas</span>
          </h1>
          <p class="text-sm font-medium text-muted-foreground max-w-2xl leading-relaxed text-left">
            Desempeño operativo, rentabilidad por unidad y proyecciones estratégicas de manufactura.
          </p>
        </div>
      </div>

      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-24 space-y-4">
          <div class="h-12 w-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
          <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Analizando registros...</p>
        </div>
      } @else if (data()) {
        @let d = data()!;
        
        <!-- Summary Stats Grid -->
        <app-metric-cards-grid [columns]="3">
          <app-metric-card
            title="Ventas del Mes"
            [value]="(d.summary.monthlyTotal | currency:'ARS':'$':'1.0-0') || ''"
            [icon]="icons.TrendingUp"
            trendText="12.5% proyectado vs mes ant."
            trendDirection="up"
            [loading]="loading()"
          ></app-metric-card>
          <app-metric-card
            title="Pedidos Pendientes"
            [value]="d.summary.pendingOrders.toString()"
            [icon]="icons.BarChart"
            [loading]="loading()"
          ></app-metric-card>
          <app-metric-card
            title="Trabajos en Curso"
            [value]="d.summary.activeJobs.toString()"
            [icon]="icons.Printer"
            [loading]="loading()"
          ></app-metric-card>
        </app-metric-cards-grid>

        <div class="grid gap-8 md:grid-cols-2">
          <!-- Monthly Sales Chart -->
          <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border shadow-sm overflow-hidden flex flex-col backdrop-blur-sm">
            <div class="p-8 border-b border-border bg-muted/30">
              <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-left">Ventas Mensuales (Últimos 6 Meses)</h3>
            </div>
            <div class="p-8 flex-1 min-h-[300px] flex items-end justify-around gap-2 px-10">
              @for (month of d.charts.salesByMonth; track month.name) {
                <div class="flex flex-col items-center gap-4 flex-1 group h-full justify-end">
                  <div class="relative w-full flex justify-center">
                    <div 
                      class="w-8 md:w-10 bg-zinc-900 dark:bg-white rounded-t-xl transition-all duration-1000 ease-out group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] cursor-help relative"
                      [style.height.px]="getBarHeight(month.total, d.charts.salesByMonth)"
                    >
                      <!-- Tooltip (Simple CSS) -->
                      <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                        {{ month.total | currency:'ARS':'$':'1.0-0' }}
                      </div>
                    </div>
                  </div>
                  <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{{ month.name }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Top Products Chart -->
          <div class="bg-white dark:bg-zinc-900/40 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800/50 shadow-sm overflow-hidden flex flex-col backdrop-blur-sm">
            <div class="p-8 border-b border-zinc-50 dark:border-zinc-800/20 bg-zinc-50/10 dark:bg-zinc-900/10">
              <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-left">Top Productos (por cantidad)</h3>
            </div>
            <div class="p-8 flex-1 flex flex-col lg:flex-row items-center justify-between gap-10">
              <!-- Donut Chart (SVG) -->
              <div class="relative h-48 w-48 shrink-0">
                <svg viewBox="0 0 36 36" class="h-full w-full -rotate-90">
                  @for (item of pieData(); track item.name; let i = $index) {
                    <circle
                      cx="18" cy="18" r="15.915"
                      fill="transparent"
                      stroke-width="3"
                      [attr.stroke]="item.color"
                      [attr.stroke-dasharray]="item.dashArray"
                      [attr.stroke-dashoffset]="item.offset"
                      class="transition-all duration-1000"
                    ></circle>
                  }
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span class="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Total</span>
                   <span class="text-2xl font-black text-foreground tracking-tighter">{{ totalProductQty() }}</span>
                </div>
              </div>

              <!-- Legend -->
              <div class="flex-1 space-y-3 w-full">
                @for (item of pieData(); track item.name) {
                  <div class="flex items-center justify-between group cursor-default">
                    <div class="flex items-center gap-3">
                      <div class="h-2 w-2 rounded-full transition-transform group-hover:scale-150" [style.background-color]="item.color"></div>
                      <span class="text-xs font-bold text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors truncate max-w-[120px]">{{ item.name }}</span>
                    </div>
                    <span class="text-[10px] font-black text-zinc-400 tabular-nums">{{ item.value }} u.</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Machine Performance -->
        <div class="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border shadow-sm overflow-hidden backdrop-blur-sm">
          <div class="p-8 border-b border-border bg-muted/30 flex items-center justify-between">
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-left">Rendimiento Técnico Unidades</h3>
            <div class="flex items-center gap-2">
               <lucide-angular [img]="icons.Info" class="h-3.5 w-3.5 text-muted-foreground"></lucide-angular>
               <span class="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Basado en trabajos finalizados</span>
            </div>
          </div>
          <div class="p-8">
            <div class="space-y-10">
              @for (machine of d.printerStats; track machine.name) {
                <div class="space-y-4 text-left group">
                  <div class="flex justify-between items-end">
                    <div class="flex flex-col gap-1">
                      <div class="flex items-center gap-2">
                         <lucide-angular [img]="icons.Activity" class="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity"></lucide-angular>
                         <span class="text-sm font-black text-zinc-900 dark:text-zinc-100">{{ machine.name }}</span>
                      </div>
                      <span class="text-[10px] text-zinc-500 font-bold uppercase tracking-tight ml-5">
                        {{ machine.jobsDone }} Items finalizados esta semana
                      </span>
                    </div>
                    <div class="text-right">
                       <span class="text-xl font-black text-foreground tabular-nums">{{ machine.efficiency }}%</span>
                       <p class="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Optimizado</p>
                    </div>
                  </div>
                  <div class="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border">
                    <div
                      class="h-full rounded-full bg-primary transition-all duration-1000 ease-in-out shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)] relative group-hover:bg-primary/80"
                      [style.width.%]="machine.efficiency"
                    >
                       <div class="absolute top-0 right-0 h-full w-4 bg-white/20 skew-x-12 animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                </div>
              }
              @if (d.printerStats.length === 0) {
                 <div class="py-10 flex flex-col items-center justify-center text-center space-y-4">
                    <lucide-angular [img]="icons.Info" class="h-8 w-8 text-zinc-300"></lucide-angular>
                    <p class="text-xs text-zinc-400 italic">No hay datos de rendimiento disponibles.</p>
                 </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    @keyframes shimmer {
      0% { transform: translateX(-100%) skewX(-12deg); }
      100% { transform: translateX(200%) skewX(-12deg); }
    }

    @media print {
      /* Ocultar elementos de la interfaz que no son del reporte */
      :host-context(app-sidebar), 
      :host-context(app-navbar),
      button, 
      .h-px,
      .animate-pulse {
        display: none !important;
      }

      /* Ajustar el contenedor para que ocupe toda la hoja */
      .space-y-10 {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
      }

      /* Forzar que los fondos se impriman (importante para gráficos) */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /* Evitar cortes feos en medio de los gráficos */
      .bg-white, .grid {
        break-inside: avoid;
        page-break-inside: avoid;
        border: 1px solid #eee !important;
        box-shadow: none !important;
      }

      /* Títulos más sobrios para el papel */
      h1 { font-size: 24pt !important; color: black !important; }
      .text-primary { color: #4f46e5 !important; }
    }
  `]
})
export class ReportesPageComponent implements OnInit {
  private reportsApi = inject(ReportsApiService);
  private session = inject(SessionService);

  data = signal<ReportsSummary | null>(null);
  loading = signal(true);

  readonly icons = { TrendingUp, BarChart: BarChartIcon, PieChart: PieChartIcon, Calendar, Printer, Info, Activity, Package };

  // Helper for Pie Charts without libraries - using a vibrant palette
  colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  totalProductQty = computed(() => {
    const d = this.data();
    if (!d) return 0;
    return d.charts.productUsage.reduce((acc, curr) => acc + curr.value, 0);
  });

  pieData = computed(() => {
    const d = this.data();
    if (!d) return [];

    const total = this.totalProductQty();
    if (total === 0) return [];

    let currentOffset = 0;
    return d.charts.productUsage.map((item, i) => {
      const percentage = (item.value / total) * 100;
      const dashArray = `${percentage} ${100 - percentage}`;
      const offset = 100 - currentOffset + 25; // 25 is to start from top
      currentOffset += percentage;

      return {
        ...item,
        color: this.colors[i % this.colors.length],
        dashArray,
        offset: offset
      };
    });
  });

  async ngOnInit() {
    const businessId = this.session.activeNegocio()?.id;
    if (!businessId) {
      this.loading.set(false);
      return;
    }

    try {
      const res = await this.reportsApi.getSummary(businessId);
      this.data.set(res);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      this.loading.set(false);
    }
  }

  getBarHeight(value: number, allData: { total: number }[]): number {
    const max = Math.max(...allData.map(d => d.total), 1);
    const maxHeight = 160; // max px height
    return (value / max) * maxHeight;
  }

  printReport() {
    window.print();
  }
}
