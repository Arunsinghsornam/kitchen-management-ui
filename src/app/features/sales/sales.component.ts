import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SalesService } from './sales.service';
import { MenuItemService } from '../recipes/menu-item.service';

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

  sales: any[] = [];
  menuItems: any[] = [];

  showModal = false;

  sale = {
    channel: 'OUTLET',
    discount: 0,
    items: [] as any[]
  };

  ngOnInit(): void {
    this.loadSales();
    this.loadMenuItems();
  }

  loadSales(): void {
    this.salesService.getSales().subscribe({
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

  newSale(): void {
    this.sale = {
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
    return this.subtotal - this.sale.discount;
  }

  saveSale(): void {

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