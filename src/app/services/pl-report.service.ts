// =============================================================
// FILE: src/app/services/pl-report.service.ts
// =============================================================
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ── Models ────────────────────────────────────────────────────

export interface DailyPLRow {
  date: string;            // ISO date string "2026-06-01"
  dayName: string;
  orders: number;
  grossRevenue: number;
  discount: number;
  netRevenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPct: number;
  purchaseSpend: number;
}

export interface MonthlyPLRow {
  year: number;
  month: number;
  monthName: string;
  orders: number;
  grossRevenue: number;
  discount: number;
  netRevenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPct: number;
}

export interface ChannelPLRow {
  channel: string;

  orders: number;

  grossRevenue: number;

  discount: number;

  netRevenue: number;

  revenueSharePct: number;

  cogs: number;

  grossProfit: number;

  grossMarginPct: number;
}

export interface PLReportResponse {
  daily: DailyPLRow[];
  monthly: MonthlyPLRow[];
  channels: ChannelPLRow[];

  totalGrossRevenue: number;
  totalDiscount: number;

  totalRevenue: number;
  totalCogs: number;
  totalGrossProfit: number;
  avgMarginPct: number;
  totalOrders: number;
  totalPurchaseSpend: number;
}

// ── Service ───────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class PLReportService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/plreport`;

  getPLReport(
    outletId: string,
    dateFrom: string,   // 'yyyy-MM-dd'
    dateTo: string      // 'yyyy-MM-dd'
  ): Observable<PLReportResponse> {
    const params = new HttpParams()
      .set('outletId', outletId)
      .set('dateFrom', dateFrom)
      .set('dateTo',   dateTo);

    return this.http.get<PLReportResponse>(this.base, { params });
  }
}
