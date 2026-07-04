import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { PurchaseService } from './purchase.service';
import { SupplierService } from '../suppliers/supplier.service';
import { InventoryService } from '../inventory/inventory.service';
import { AuthService } from '../../services/auth.service';
import { OutletService, Outlet } from '../outlets/outlet.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.css']
})
export class PurchasesComponent implements OnInit {

  private purchaseService = inject(PurchaseService);
  private supplierService = inject(SupplierService);
  private inventoryService = inject(InventoryService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private outletService = inject(OutletService);
  private http = inject(HttpClient);

  purchases: any[] = [];
  suppliers: any[] = [];
  materials: any[] = [];
  outlets: Outlet[] = [];
  organizations: any[] = [];

  isSuperAdmin = false;
  isPowerAdmin = false;
  selectedOutletId = '';
  selectedOrganizationId = '';
  modalOrganizationId = '';
  searchText = '';
  showForm = false;

  purchase = {
    outletId: '',
    supplierId: '',
    invoiceNumber: '',
    purchaseDate: '',
    items: [] as any[]
  };

  get totalPurchases(): number {
    return this.purchases.length;
  }

  get totalAmount(): number {
    return this.purchases.reduce(
      (sum, p) => sum + (p.total || 0),
      0
    );
  }

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
    }

    this.loadData();
    this.checkQueryParams();
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
      next: data => {
        this.outlets = data;
        if (this.outlets.length > 0 && !this.selectedOutletId) {
          this.selectedOutletId = this.outlets[0].id || '';
          this.loadData();
        }
      },
      error: err => console.error(err)
    });
  }

  loadData(): void {
    this.loadPurchases();

    // Load suppliers and raw materials for the selected outlet (or org level if outlet is empty)
    this.supplierService.getSuppliers(this.selectedOutletId, this.selectedOrganizationId)
      .subscribe(data => this.suppliers = data);

    this.inventoryService.getAll(this.selectedOutletId)
      .subscribe(data => this.materials = data);
  }

  loadPurchases() {
    this.purchaseService.getAll(this.selectedOutletId, this.selectedOrganizationId)
      .subscribe(data => this.purchases = data);
  }

  onOutletFilterChange(): void {
    this.loadData();
  }

  onOrganizationChange(): void {
    this.selectedOutletId = '';
    this.loadOutlets();
    this.loadData();
  }

  onModalOrganizationChange(): void {
    this.purchase.outletId = '';
    this.outletService.getOutlets(this.modalOrganizationId).subscribe({
      next: data => this.outlets = data,
      error: err => console.error(err)
    });
  }

  newPurchase() {
    this.purchase = {
      outletId: this.selectedOutletId || '', // Default to current selected filter
      supplierId: '',
      invoiceNumber: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      items: []
    };
    this.modalOrganizationId = this.selectedOrganizationId;
    this.outletService.getOutlets(this.modalOrganizationId).subscribe({
      next: data => this.outlets = data
    });

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
    if (this.isSuperAdmin && !this.purchase.outletId) {
      alert('Please select an outlet.');
      return;
    }

    if (!this.purchase.supplierId) {
      alert('Please select a supplier.');
      return;
    }

    if (this.purchase.items.length === 0) {
      alert('Please add at least one item.');
      return;
    }

    for (const item of this.purchase.items) {
      if (!item.rawMaterialId) {
        alert('Please select a material.');
        return;
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        alert('Quantity must be greater than zero.');
        return;
      }
      if (!item.unitCost || Number(item.unitCost) <= 0) {
        alert('Unit cost must be greater than zero.');
        return;
      }
    }

    const payload = {
      outletId: this.isSuperAdmin ? this.purchase.outletId : undefined,
      supplierId: this.purchase.supplierId,
      invoiceNumber: this.purchase.invoiceNumber,
      purchaseDate: this.purchase.purchaseDate,
      items: this.purchase.items.map(item => ({
        rawMaterialId: item.rawMaterialId,
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
        gstPercent: Number(item.gstPercent || 0)
      }))
    };

    this.purchaseService.create(payload)
      .subscribe({
        next: () => {
          alert('Purchase Saved Successfully');
          this.showForm = false;
          this.loadPurchases();

          // reload materials automatically
          this.inventoryService.getAll(this.selectedOutletId)
            .subscribe(data => this.materials = data);
        },
        error: err => {
          console.error(err);
          alert(err?.error?.message ?? 'Unable to save purchase');
        }
      });
  }

  filteredPurchases() {
    if (!this.searchText) return this.purchases;
    return this.purchases.filter(p =>
      (p.supplier?.name || '').toLowerCase().includes(this.searchText.toLowerCase()) ||
      (p.invoiceNumber || '').toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  checkQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      const rawMaterialId = params['rawMaterialId'];
      const outletId = params['outletId'];
      
      if (rawMaterialId) {
        if (outletId) {
          this.selectedOutletId = outletId;
          this.loadData();
        }

        // Prefill modal form and show it
        this.purchase = {
          outletId: outletId || this.selectedOutletId || '',
          supplierId: '',
          invoiceNumber: '',
          purchaseDate: new Date().toISOString().split('T')[0],
          items: [
            {
              rawMaterialId: rawMaterialId,
              quantity: 10,
              unitCost: '',
              gstPercent: 0
            }
          ]
        };

        this.modalOrganizationId = this.selectedOrganizationId;
        this.outletService.getOutlets(this.modalOrganizationId).subscribe({
          next: data => this.outlets = data
        });

        this.showForm = true;
      }
    });
  }
}