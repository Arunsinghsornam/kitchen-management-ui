import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { OutletService, Outlet } from '../outlets/outlet.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private outletService = inject(OutletService);

  isSuperAdmin = false;
  isPowerAdmin = false;
  outlets: Outlet[] = [];
  selectedOutletId = '';
  selectedOrganizationId = '';
  organizations: any[] = [];

  // Filter dates
  fromDate = '';
  toDate = '';

  // Tab State
  activeTab = 'summary'; // 'summary' | 'sales-log' | 'items' | 'inventory' | 'suppliers' | 'purchases-log' | 'expenses-log'

  // Raw data loaded
  sales: any[] = [];
  menuItems: any[] = [];
  rawMaterials: any[] = [];
  purchases: any[] = [];
  expenses: any[] = [];
  suppliers: any[] = [];
  expenseBreakdown: any[] = [];

  // Aggregated data for reports
  channelSummary: any[] = [];
  itemSummary: any[] = [];
  lowStockItems: any[] = [];
  supplierDetailsSummary: any[] = [];
  financialOverview = {
    totalSales: 0,
    totalCogs: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    netProfit: 0
  };

  ngOnInit(): void {
    const user = this.authService.currentUser;
    this.isSuperAdmin = user?.role === 'super_admin' || user?.role === 'power_admin';
    this.isPowerAdmin = user?.role === 'power_admin';

    // Default dates (current month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.fromDate = this.formatDate(firstDay);
    this.toDate = this.formatDate(today);

    if (this.isPowerAdmin) {
      this.loadOrganizations();
    }
    if (this.isSuperAdmin) {
      this.loadOutlets();
    } else {
      this.selectedOutletId = user?.outletId || '';
      this.runReport();
    }
  }

  formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
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
        if (this.outlets.length > 0 && !this.selectedOutletId) {
          this.selectedOutletId = this.outlets[0].id || '';
          this.runReport();
        }
      },
      error: (err) => console.error('Error loading outlets:', err)
    });
  }

  onFilterChange(): void {
    this.runReport();
  }

  onOrganizationChange(): void {
    this.selectedOutletId = '';
    this.loadOutlets();
  }

  runReport(): void {
    if (this.isSuperAdmin && !this.selectedOutletId) {
      return;
    }

    const params = `?outletId=${this.selectedOutletId}&fromDate=${this.fromDate}&toDate=${this.toDate}`;
    
    // 1. Fetch Sales
    this.http.get<any[]>(`${environment.apiUrl}/api/Sales${params}`).subscribe({
      next: (salesData) => {
        this.sales = salesData || [];
        this.calculateOrderReports();
        this.calculateItemReports();
      }
    });

    // 2. Fetch Menu Items (Recipes)
    this.http.get<any[]>(`${environment.apiUrl}/api/Recipes?outletId=${this.selectedOutletId}`).subscribe({
      next: (recipeData) => {
        this.menuItems = recipeData || [];
        this.calculateItemReports();
      }
    });

    // 3. Fetch Purchases
    this.http.get<any[]>(`${environment.apiUrl}/api/Purchases${params}`).subscribe({
      next: (purchaseData) => {
        this.purchases = purchaseData || [];
        this.calculateSupplierReports();
        this.calculateFinancialSummary();
      }
    });

    // 4. Fetch Raw Materials
    this.http.get<any[]>(`${environment.apiUrl}/api/RawMaterials?outletId=${this.selectedOutletId}`).subscribe({
      next: (materialsData) => {
        this.rawMaterials = materialsData || [];
        this.calculateInventoryReports();
      }
    });

    // 5. Fetch Operational Expenses
    this.http.get<any[]>(`${environment.apiUrl}/api/Expenses${params}`).subscribe({
      next: (expenseData) => {
        this.expenses = expenseData || [];
        this.calculateExpenseBreakdown();
        this.calculateFinancialSummary();
      }
    });

    // 6. Fetch Suppliers
    this.http.get<any>(`${environment.apiUrl}/api/Suppliers?outletId=${this.selectedOutletId}`).subscribe({
      next: (res) => {
        this.suppliers = res?.data || [];
        this.calculateSupplierReports();
      }
    });
  }

  calculateOrderReports(): void {
    const channels = ['OUTLET', 'SWIGGY', 'ZOMATO'];
    this.channelSummary = channels.map(c => {
      const salesChannel = this.sales.filter(s => s.channel === c);
      const orders = salesChannel.length;
      const subtotal = salesChannel.reduce((sum, s) => sum + (s.subtotal || 0), 0);
      const discount = salesChannel.reduce((sum, s) => sum + (s.discount || 0), 0);
      const total = salesChannel.reduce((sum, s) => sum + (s.total || 0), 0);
      return { channel: c, orders, subtotal, discount, total };
    });

    this.calculateFinancialSummary();
  }

  calculateItemReports(): void {
    if (!this.sales.length || !this.menuItems.length) {
      this.itemSummary = [];
      return;
    }

    const itemMap = new Map<string, { qty: number, revenue: number }>();
    this.sales.forEach(sale => {
      (sale.saleItems || []).forEach((si: any) => {
        const existing = itemMap.get(si.menuItemId) || { qty: 0, revenue: 0 };
        itemMap.set(si.menuItemId, {
          qty: existing.qty + (si.quantity || 0),
          revenue: existing.revenue + ((si.quantity || 0) * (si.unitPrice || 0))
        });
      });
    });

    this.itemSummary = this.menuItems.map(menu => {
      const stats = itemMap.get(menu.id) || { qty: 0, revenue: 0 };
      const recipeCost = menu.recipeCost || 0;
      const totalCogs = stats.qty * recipeCost;
      const profit = stats.revenue - totalCogs;
      const margin = stats.revenue > 0 ? (profit / stats.revenue) * 100 : 0;
      return {
        name: menu.name,
        category: menu.category || 'Uncategorized',
        qtySold: stats.qty,
        revenue: stats.revenue,
        cogs: totalCogs,
        profit,
        margin
      };
    }).filter(x => x.qtySold > 0)
      .sort((a, b) => b.qtySold - a.qtySold);

    this.calculateFinancialSummary();
  }

  calculateInventoryReports(): void {
    this.lowStockItems = this.rawMaterials.filter(rm => (rm.currentStock || 0) <= (rm.reorderLevel || 0));
  }

  calculateSupplierReports(): void {
    const supplierMap = new Map<string, number>();
    this.purchases.forEach(p => {
      const supplierName = p.supplierName || 'Unknown Supplier';
      const existing = supplierMap.get(supplierName) || 0;
      supplierMap.set(supplierName, existing + (p.total || 0));
    });

    this.supplierDetailsSummary = this.suppliers.map(sup => {
      const spend = supplierMap.get(sup.name) || 0;
      return {
        name: sup.name,
        phone: sup.mobile || '-',
        email: sup.email || '-',
        address: sup.address || '-',
        spend
      };
    }).sort((a, b) => b.spend - a.spend);
  }

  calculateFinancialSummary(): void {
    const totalSales = this.sales.reduce((sum, s) => sum + (s.total || 0), 0);
    const totalPurchases = this.purchases.reduce((sum, p) => sum + (p.total || 0), 0);
    const totalCogs = this.itemSummary.reduce((sum, item) => sum + (item.cogs || 0), 0);
    const totalExpensesPortion = this.expenses.reduce((sum, e) => sum + (e.totalAmount || 0), 0);
    const netProfit = totalSales - totalCogs - totalExpensesPortion - totalPurchases;

    this.financialOverview = {
      totalSales,
      totalCogs,
      totalPurchases,
      totalExpenses: totalExpensesPortion + totalPurchases,
      netProfit
    };
  }

  getTotalInventoryValuation(): number {
    return this.rawMaterials.reduce((sum, rm) => sum + ((rm.currentStock || 0) * (rm.averageCost || 0)), 0);
  }

  // Helpers for log descriptions
  getSaleItemsSummary(sale: any): string {
    return (sale.saleItems || []).map((si: any) => {
      const menuItem = this.menuItems.find(m => m.id === si.menuItemId);
      const name = menuItem ? menuItem.name : 'Unknown Item';
      return `${name} x ${si.quantity}`;
    }).join(', ');
  }

  getPurchaseItemsSummary(purchase: any): string {
    return (purchase.purchaseItems || []).map((pi: any) => {
      const name = pi.materialName || 'Unknown Material';
      return `${name} x ${pi.quantity}`;
    }).join(', ');
  }

  calculateExpenseBreakdown(): void {
    const categories = {
      salary: 0,
      rent: 0,
      ebBill: 0,
      gasBill: 0,
      miscellaneous: 0
    };
    let customItemsTotal = 0;

    this.expenses.forEach(exp => {
      categories.salary += exp.staffSalary || 0;
      categories.rent += exp.shopRent || 0;
      categories.ebBill += exp.ebBill || 0;
      categories.gasBill += exp.gasBill || 0;
      categories.miscellaneous += exp.miscExpense || 0;

      (exp.otherExpenses || []).forEach((oe: any) => {
        customItemsTotal += oe.amount || 0;
      });
    });

    this.expenseBreakdown = [
      { category: 'Staff Salaries', amount: categories.salary },
      { category: 'Monthly Rent', amount: categories.rent },
      { category: 'EB Electricity Bill', amount: categories.ebBill },
      { category: 'Gas Cylinder Bill', amount: categories.gasBill },
      { category: 'General Miscellaneous', amount: categories.miscellaneous },
      { category: 'Custom Misc Items', amount: customItemsTotal }
    ].filter(x => x.amount > 0);
  }
}
