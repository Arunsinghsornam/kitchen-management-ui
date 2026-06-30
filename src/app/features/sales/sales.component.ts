import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SalesService } from './sales.service';
import { MenuItemService } from '../recipes/menu-item.service';
import { AuthService } from '../../services/auth.service';
import { OutletService, Outlet } from '../outlets/outlet.service';

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

  sales: any[] = [];
  menuItems: any[] = [];

  isSuperAdmin = false;
  outlets: Outlet[] = [];
  selectedOutletId = '';

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

    if (this.isSuperAdmin) {
      this.loadOutlets();
    } else {
      this.selectedOutletId = user?.outletId || '';
    }

    this.loadSales();
    this.loadMenuItems();
  }

  loadOutlets(): void {
    this.outletService.getOutlets().subscribe({
      next: (data) => {
        this.outlets = data;
      },
      error: (err) => console.error('Error loading outlets:', err)
    });
  }

  loadSales(): void {
    this.salesService.getSales(this.selectedOutletId).subscribe({
      next: (res) => {
        this.sales = res;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadMenuItems(): void {
    this.menuService.getMenuItems().subscribe({
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
  }

  newSale(): void {
    this.sale = {
      outletId: this.selectedOutletId || '', // Default to current selected filter
      channel: 'OUTLET',
      discount: 0,
      items: []
    };

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