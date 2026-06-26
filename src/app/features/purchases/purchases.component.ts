import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PurchaseService } from './purchase.service';
import { SupplierService } from '../suppliers/supplier.service';
import { InventoryService } from '../inventory/inventory.service';

@Component({
   selector: 'app-purchases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.css']
})
export class PurchasesComponent implements OnInit {

  purchases: any[] = [];
  suppliers: any[] = [];
  materials: any[] = [];
searchText = '';

get totalPurchases(): number {
  return this.purchases.length;
}

get totalAmount(): number {
  return this.purchases.reduce(
    (sum, p) => sum + (p.total || 0),
    0
  );
}

filteredPurchases() {

  if (!this.searchText) {
    return this.purchases;
  }

  return this.purchases.filter((p: any) =>
    p.invoiceNumber?.toLowerCase().includes(this.searchText.toLowerCase()) ||
    p.supplierName?.toLowerCase().includes(this.searchText.toLowerCase())
  );
}
  showForm = false;

  purchase = {
    supplierId: '',
    invoiceNumber: '',
    purchaseDate: '',
    items: [] as any[]
  };

  constructor(
    private purchaseService: PurchaseService,
    private supplierService: SupplierService,
    private inventoryService: InventoryService
  ) {}

  ngOnInit(): void {

    this.loadPurchases();

    this.supplierService.getAll()
      .subscribe(data => this.suppliers = data);

    this.inventoryService.getAll()
      .subscribe(data => this.materials = data);
  }

  loadPurchases() {
    this.purchaseService.getAll()
      .subscribe(data => this.purchases = data);
  }

  newPurchase() {

    this.purchase = {
      supplierId: '',
      invoiceNumber: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      items: []
    };

    this.addItem();

    this.showForm = true;
  }

  addItem() {

    this.purchase.items.push({
      rawMaterialId: '',
      quantity: '',
      unitCost: '',
      gstPercent: ''
    });
  }

  removeItem(index: number) {
    this.purchase.items.splice(index, 1);
  }

  savePurchase() {

    this.purchaseService.create(this.purchase)
      .subscribe({

        next: () => {

          alert('Purchase Saved Successfully');

          this.showForm = false;

          this.loadPurchases();

          // reload inventory automatically
          this.inventoryService.getAll()
            .subscribe(data => this.materials = data);
        },

        error: err => {
          console.error(err);
          alert('Unable to save purchase');
        }
      });
  }
}