import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PLReportService, PLReportResponse, DailyPLRow, MonthlyPLRow, ChannelPLRow } from '../../services/pl-report.service';
import { AuthService } from '../../services/auth.service';
import { OutletService, Outlet } from '../../features/outlets/outlet.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

type ActiveTab = 'daily' | 'monthly' | 'channel';

@Component({
selector: 'app-pl-report',
standalone: true,
imports: [CommonModule, FormsModule],
templateUrl: './pl-report.component.html',
styleUrls: ['./pl-report.component.css']
})
export class PLReportComponent implements OnInit {

  private svc = inject(PLReportService);
  private auth = inject(AuthService);
  private outletService = inject(OutletService);
  private http = inject(HttpClient);

  loading = signal(false);
  error = signal<string | null>(null);
  report = signal<PLReportResponse | null>(null);

  activeTab = signal<ActiveTab>('daily');

  outletId = '';
  selectedOrganizationId = '';
  isSuperAdmin = false;
  isPowerAdmin = false;
  organizations: any[] = [];
  outlets: Outlet[] = [];

  dateFrom = this.formatDate(
    new Date(Date.now() - 29 * 86400000)
  );

  dateTo = this.formatDate(
    new Date()
  );

summaryCards = computed(() => {
  const r = this.report();

  if (!r) return [];

  return [
    {
      label: 'Total Revenue',
      value: r.totalRevenue,
      type: 'currency'
    },
    {
      label: 'Total COGS',
      value: r.totalCogs,
      type: 'currency'
    },
    {
      label: 'Total Expenses',
      value: r.totalExpenses || 0,
      type: 'currency'
    },
    {
      label: 'Gross Profit',
      value: r.totalGrossProfit,
      type: 'currency'
    },
    {
      label: 'Net Profit',
      value: r.netProfit || 0,
      type: 'currency'
    },
    {
      label: 'Avg Gross Margin',
      value: r.avgMarginPct,
      type: 'percent'
    },
    {
      label: 'Total Orders',
      value: r.totalOrders,
      type: 'number'
    }
  ];
});

  ngOnInit(): void {
    const user = this.auth.currentUser;
    this.isSuperAdmin = user?.role === 'super_admin' || user?.role === 'power_admin';
    this.isPowerAdmin = user?.role === 'power_admin';

    if (this.isPowerAdmin) {
      this.loadOrganizations();
    }

    if (this.isSuperAdmin) {
      this.loadOutlets();
    } else {
      this.outletId = user?.outletId || '';
      this.load();
    }
  }

  loadOrganizations(): void {
    this.http.get<any>(`${environment.apiUrl}/api/organizations`).subscribe({
      next: (res) => {
        if (res.success) {
          this.organizations = res.data.filter((o: any) => o.status === 'Approved');
        }
      },
      error: (err) => console.error('Error loading organizations:', err)
    });
  }

  loadOutlets(): void {
    this.outletService.getOutlets(this.selectedOrganizationId).subscribe({
      next: (data) => {
        this.outlets = data;
        if (this.outlets.length > 0 && !this.outletId) {
          this.outletId = this.outlets[0].id || '';
          this.load();
        }
      },
      error: (err) => console.error('Error loading outlets:', err)
    });
  }

  onOrganizationChange(): void {
    this.outletId = '';
    this.loadOutlets();
    this.report.set(null);
  }

  onOutletChange(): void {
    this.load();
  }

  load(): void {
    if (!this.outletId) {
      return;
    }

    if (!this.dateFrom || !this.dateTo) {
      return;
    }

this.loading.set(true);
this.error.set(null);

this.svc
  .getPLReport(
    this.outletId,
    this.dateFrom,
    this.dateTo
  )
  .subscribe({

    next: (data) => {

      this.report.set(data);

      this.loading.set(false);
    },

    error: (err) => {

      this.error.set(
        err?.error?.title ??
        'Failed to load report.'
      );

      this.loading.set(false);
    }
  });


}

setTab(tab: ActiveTab): void {
this.activeTab.set(tab);
}

setPreset(days: number): void {


this.dateFrom = this.formatDate(
  new Date(
    Date.now() - (days - 1) * 86400000
  )
);

this.dateTo = this.formatDate(
  new Date()
);

this.load();


}

setThisMonth(): void {


const now = new Date();

this.dateFrom = this.formatDate(
  new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  )
);

this.dateTo = this.formatDate(now);

this.load();


}

setLastMonth(): void {


const now = new Date();

const from = new Date(
  now.getFullYear(),
  now.getMonth() - 1,
  1
);

const to = new Date(
  now.getFullYear(),
  now.getMonth(),
  0
);

this.dateFrom = this.formatDate(from);
this.dateTo = this.formatDate(to);

this.load();


}

private formatDate(d: Date): string {
return d.toISOString().slice(0, 10);
}

fmtINR(value: number): string {


return new Intl.NumberFormat(
  'en-IN',
  {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }
).format(value);


}

marginClass(pct: number): string {


if (pct >= 60) {
  return 'text-green-600 font-semibold';
}

if (pct >= 40) {
  return 'text-yellow-600 font-semibold';
}

return 'text-red-600 font-semibold';


}

profitClass(val: number): string {


return val >= 0
  ? 'text-green-700'
  : 'text-red-600';


}

channelClass(channel: string): string {

  switch ((channel || '').toUpperCase()) {

    case 'OUTLET':
      return 'channel-outlet';

    case 'SWIGGY':
      return 'channel-swiggy';

    case 'ZOMATO':
      return 'channel-zomato';

    default:
      return '';
  }
}

trackByDate(
_: number,
row: DailyPLRow
): string {
return row.date;
}

trackByMonth(
_: number,
row: MonthlyPLRow
): string {
return `${row.year}-${row.month}`;
}

trackByChannel(
_: number,
row: ChannelPLRow
): string {
return row.channel;
}
}
