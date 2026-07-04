import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SalesService } from './sales.service';
import { MenuItemService } from '../recipes/menu-item.service';
import { AuthService } from '../../services/auth.service';
import { OutletService, Outlet } from '../outlets/outlet.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit {

  private salesService = inject(SalesService);
  private menuService = inject(MenuItemService);
  private authService = inject(AuthService);
  private outletService = inject(OutletService);
  private http = inject(HttpClient);

  sales: any[] = [];
  menuItems: any[] = [];
  organizations: any[] = [];

  isSuperAdmin = false;
  isPowerAdmin = false;
  outlets: Outlet[] = [];
  selectedOutletId = '';
  selectedOrganizationId = '';
  modalOrganizationId = '';

  showModal = false;

  sale = {
    outletId: '',
    channel: 'OUTLET',
    discount: 0,
    items: [] as any[]
  };

  ngOnInit(): void {
    const user = this.authService.currentUser;
    this.isSuperAdmin = user?.role === 'super_admin' || user?.role === 'power_admin';
    this.isPowerAdmin = user?.role === 'power_admin';

    if (this.isPowerAdmin) {
      this.loadOrganizations();
    }
    if (this.isSuperAdmin) {
      this.loadOutlets();
    } else {
      this.selectedOutletId = user?.outletId || '';
      this.loadSales();
      this.loadMenuItems(this.selectedOutletId);
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
        if (this.outlets.length > 0 && !this.selectedOutletId) {
          this.selectedOutletId = this.outlets[0].id || '';
          this.loadSales();
          this.loadMenuItems(this.selectedOutletId);
        }
      },
      error: (err) => console.error('Error loading outlets:', err)
    });
  }

  loadSales(): void {
    this.salesService.getSales(this.selectedOutletId, this.selectedOrganizationId).subscribe({
      next: (res) => {
        this.sales = res;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadMenuItems(outletId?: string): void {
    if (this.isSuperAdmin && !outletId) {
      this.menuItems = [];
      return;
    }
    this.menuService.getMenuItems(outletId).subscribe({
      next: (res) => {
        this.menuItems = res;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onOutletFilterChange(): void {
    this.loadSales();
    this.loadMenuItems(this.selectedOutletId);
  }

  onOrganizationChange(): void {
    this.selectedOutletId = '';
    this.loadOutlets();
    this.loadSales();
    this.menuItems = [];
  }

  onModalOrganizationChange(): void {
    this.sale.outletId = '';
    this.outletService.getOutlets(this.modalOrganizationId).subscribe({
      next: data => this.outlets = data,
      error: err => console.error(err)
    });
  }

  onModalOutletChange(): void {
    this.loadMenuItems(this.sale.outletId);
    this.sale.items = []; // Clear current items since they belong to the previous outlet's menu items
    this.addItem();
  }

  newSale(): void {
    this.sale = {
      outletId: this.selectedOutletId || '', // Default to current selected filter
      channel: 'OUTLET',
      discount: 0,
      items: []
    };

    this.loadMenuItems(this.sale.outletId);
    this.addItem();

    this.showModal = true;
  }

  addItem(): void {
    this.sale.items.push({
      menuItemId: '',
      quantity: 1,
      unitPrice: 0
    });
  }

  removeItem(index: number): void {
    this.sale.items.splice(index, 1);
  }

  onMenuChange(item: any): void {
    const menu = this.menuItems.find(
      x => x.id === item.menuItemId
    );

    if (menu) {
      item.unitPrice = menu.sellingPrice;
    }
  }

  get subtotal(): number {
    return this.sale.items.reduce(
      (sum, item) =>
        sum + (item.quantity * item.unitPrice),
      0
    );
  }

  get total(): number {
    return Math.max(0, this.subtotal - this.sale.discount);
  }

  saveSale(): void {

    if (this.isSuperAdmin && !this.sale.outletId) {
      alert('Please select an outlet.');
      return;
    }

    // Validate discount
    if (this.sale.discount < 0) {
      alert('Discount cannot be negative.');
      return;
    }

    if (this.sale.discount > this.subtotal) {
      alert('Discount cannot be greater than the subtotal.');
      return;
    }

    // No items
    if (this.sale.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    // Duplicate menu items
    const menuIds = this.sale.items.map(
      x => x.menuItemId
    );

    if (menuIds.length !== new Set(menuIds).size) {
      alert('Duplicate menu items are not allowed.');
      return;
    }

    // Validate each item
    for (const item of this.sale.items) {
      if (!item.menuItemId) {
        alert('Please select a menu item');
        return;
      }

      if (item.quantity <= 0) {
        alert('Quantity must be greater than zero');
        return;
      }

      if (item.unitPrice <= 0) {
        alert('Invalid selling price');
        return;
      }
    }

    const payload = {
      outletId: this.isSuperAdmin ? this.sale.outletId : undefined,
      saleDate: new Date().toISOString().split('T')[0],
      channel: this.sale.channel,
      discount: this.sale.discount,
      items: this.sale.items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    };

    this.salesService.createSale(payload)
      .subscribe({
        next: () => {
          alert('Sale saved successfully');
          this.loadSales();
          this.showModal = false;
        },
        error: err => {
          console.error(err);
          alert(
            err?.error?.message ??
            'Unable to save sale'
          );
        }
      });
  }
}