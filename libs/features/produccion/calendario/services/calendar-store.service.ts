import { Injectable, signal, computed } from '@angular/core';
import { CalendarOrderEvent, CalendarViewMode, CalendarFilters } from '../models/calendar.models';

@Injectable({
  providedIn: 'root'
})
export class CalendarStoreService {
  // Persisted state signals
  private _viewMode = signal<CalendarViewMode>('WEEK');
  private _currentDate = signal<Date>(new Date());
  private _filters = signal<CalendarFilters>({
    status: [],
    onlyRisky: false,
    onlyOverdue: false
  });
  
  // Cache for events to avoid refetching on every entry
  private _events = signal<CalendarOrderEvent[]>([]);
  private _lastFetchParams = signal<{ bId: string; start: string; end: string } | null>(null);

  // Public accessors
  viewMode = this._viewMode.asReadonly();
  currentDate = this._currentDate.asReadonly();
  filters = this._filters.asReadonly();
  events = this._events.asReadonly();

  setViewMode(mode: CalendarViewMode) { this._viewMode.set(mode); }
  setCurrentDate(date: Date) { this._currentDate.set(date); }
  setFilters(filters: CalendarFilters) { this._filters.set(filters); }
  
  setEvents(events: CalendarOrderEvent[], params: { bId: string; start: string; end: string }) {
    this._events.set(events);
    this._lastFetchParams.set(params);
  }

  shouldRefetch(bId: string, start: Date, end: Date): boolean {
    const last = this._lastFetchParams();
    if (!last) return true;
    return last.bId !== bId || last.start !== start.toISOString() || last.end !== end.toISOString();
  }

  reset() {
    this._currentDate.set(new Date());
    this._filters.set({ status: [], onlyRisky: false, onlyOverdue: false });
  }
}
