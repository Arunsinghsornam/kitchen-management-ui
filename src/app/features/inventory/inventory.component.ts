import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from './inventory.service';
import { AuthService } from '../../services/auth.service';
import { OutletService, Outlet } from '../outlets/outlet.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],

  template: `
    <div class="inventory-page">

      <div class="page-header" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
        <div>
          <h1>Inventory</h1>
          <p>Manage raw materials and stock levels</p>
        </div>

        <div style="display: flex; align-items: center; gap: 15px; margin-left: auto;">
          <!-- Organization Dropdown filter for Power Admin -->
          <div *ngIf="isPowerAdmin" class="outlet-filter-box">
            <select [(ngModel)]="selectedOrganizationId" (change)="onOrganizationChange()" 
                    style="padding: 10px; border: 1px solid #ddd; border-radius: 10px; font-size: 14px; background: white; outline: none; min-width: 180px; font-weight: 600;">
              <option value="">All Organizations</option>
              <option *ngFor="let org of organizations" [value]="org.id">
                {{ org.name }}
              </option>
            </select>
          </div>

          <!-- Outlet Dropdown filter for Super Admin -->
          <div *ngIf="isSuperAdmin" class="outlet-filter-box">
            <select [(ngModel)]="selectedOutletId" (change)="onOutletFilterChange()" 
                    style="padding: 10px; border: 1px solid #ddd; border-radius: 10px; font-size: 14px; background: white; outline: none; min-width: 180px; font-weight: 600;">
              <option value="">-- Select Outlet --</option>
              <option *ngFor="let outlet of outlets" [value]="outlet.id">
                {{ outlet.name }}
              </option>
            </select>
          </div>

          <button class="add-btn" (click)="openAddForm()" [disabled]="isSuperAdmin && !selectedOutletId" style="opacity: (isSuperAdmin && !selectedOutletId) ? 0.6 : 1;">
            + Add Item
          </button>
        </div>
      </div>

      <div class="inventory-card">
        <table class="inventory-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Stock</th>
              <th style="text-align: right; padding-right: 20px;">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let item of items">
              <td>{{ item.code }}</td>

              <td>
                <strong>{{ item.name }}</strong>
              </td>

              <td>{{ item.categoryName || 'N/A' }}</td>

              <td>{{ item.unit }}</td>

              <td>
                <span
                  class="stock-badge"
                  [class.low-stock]="item.currentStock <= item.reorderLevel">
                  {{ item.currentStock }}
                </span>
              </td>

              <td style="text-align: right; white-space: nowrap; padding-right: 20px;">
                <button class="action-btn edit-btn" (click)="openEditForm(item)" style="background: #e3f2fd; color: #1565c0; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; margin-right: 8px; font-size: 13px;">
                  ✏️ Edit
                </button>
                <button class="action-btn adjust-btn" (click)="openAdjustForm(item)" style="background: #fff3e0; color: #e65100; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; margin-right: 8px; font-size: 13px;">
                  ⚖️ Adjust
                </button>
                <button *ngIf="isSuperAdmin" class="action-btn history-btn" (click)="openLedgerModal(item)" style="background: #e0f2f1; color: #00796b; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; margin-right: 8px; font-size: 13px;">
                  📜 History
                </button>
                <button class="action-btn delete-btn" (click)="deleteItem(item)" style="background: #ffebee; color: #c62828; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px;">
                  🗑️ Delete
                </button>
              </td>
            </tr>

            <tr *ngIf="items.length === 0">
              <td colspan="6" style="text-align: center; color: #777; padding: 20px;">
                {{ (isSuperAdmin && !selectedOutletId) ? 'Please select an outlet to view inventory.' : 'No inventory items found.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add Item Modal -->
      <div *ngIf="showAddForm" class="modal">
        <div class="modal-box">

          <h2>New Raw Material</h2>

          <div class="form-grid">

            <div class="form-group" *ngIf="isSuperAdmin">
              <label>Outlet</label>
              <select [(ngModel)]="newItem.outletId" (change)="onModalOutletChange()" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                <option value="">-- Select Outlet --</option>
                <option *ngFor="let outlet of outlets" [value]="outlet.id">
                  {{ outlet.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Item Code</label>
              <input
                [(ngModel)]="newItem.code"
                placeholder="RM001">
            </div>

            <div class="form-group">
              <label>Item Name</label>
              <input
                [(ngModel)]="newItem.name"
                placeholder="Tomato">
            </div>

            <div class="form-group">
              <label>Unit</label>
              <select [(ngModel)]="newItem.unit">
                <option value="Kg">Kg</option>
                <option value="Gram">Gram</option>
                <option value="Litre">Litre</option>
                <option value="Piece">Piece</option>
                <option value="Pack">Pack</option>
              </select>
            </div>

            <div class="form-group">
              <label>Category</label>
              <select [(ngModel)]="newItem.categoryId">
                <option [ngValue]="null">Select Category</option>

                <option
                  *ngFor="let cat of categories"
                  [ngValue]="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Reorder Level</label>
              <input
                type="number"
                [(ngModel)]="newItem.reorderLevel">
            </div>

          </div>

          <div class="modal-actions">
            <button class="save-btn" (click)="saveItem()">
              Save
            </button>

            <button
              class="cancel-btn"
              (click)="showAddForm = false">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Item Modal -->
      <div *ngIf="showEditForm" class="modal">
        <div class="modal-box">
          <h2>Edit Raw Material</h2>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Item Code</label>
              <input [(ngModel)]="editingItem.code" placeholder="RM001">
            </div>

            <div class="form-group">
              <label>Item Name</label>
              <input [(ngModel)]="editingItem.name" placeholder="Tomato">
            </div>

            <div class="form-group">
              <label>Unit</label>
              <select [(ngModel)]="editingItem.unit">
                <option value="Kg">Kg</option>
                <option value="Gram">Gram</option>
                <option value="Litre">Litre</option>
                <option value="Piece">Piece</option>
                <option value="Pack">Pack</option>
              </select>
            </div>

            <div class="form-group">
              <label>Category</label>
              <select [(ngModel)]="editingItem.categoryId">
                <option [ngValue]="null">Select Category</option>
                <option *ngFor="let cat of categories" [ngValue]="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Reorder Level</label>
              <input type="number" [(ngModel)]="editingItem.reorderLevel">
            </div>
          </div>

          <div class="modal-actions">
            <button class="save-btn" (click)="saveEditItem()">
              Save
            </button>
            <button class="cancel-btn" (click)="showEditForm = false">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Adjust Stock Modal -->
      <div *ngIf="showAdjustForm" class="modal">
        <div class="modal-box" style="width: 450px;">
          <h2>Adjust Stock - {{ adjustingItem?.name }}</h2>
          <p style="color: #777; font-size: 14px; margin-top: 4px;">
            Current Stock: <strong>{{ adjustingItem?.currentStock }} {{ adjustingItem?.unit }}</strong>
          </p>
          
          <div class="form-grid" style="grid-template-columns: 1fr; margin-top: 20px;">
            <div class="form-group">
              <label>Adjustment Quantity</label>
              <input type="number" [(ngModel)]="adjustmentQuantity" placeholder="e.g. 5 or -3">
              <small style="color: #666; margin-top: 4px; display: block;">Use positive numbers to add stock, negative to subtract stock.</small>
            </div>

            <div class="form-group" style="margin-top: 10px;">
              <label>Notes / Reason</label>
              <textarea [(ngModel)]="adjustmentNotes" placeholder="Reason for adjustment..." style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; resize: vertical; min-height: 80px; font-family: inherit; outline: none;"></textarea>
            </div>
          </div>

          <div class="modal-actions">
            <button class="save-btn" (click)="saveAdjustment()" [disabled]="!adjustmentQuantity">
              Adjust
            </button>
            <button class="cancel-btn" (click)="showAdjustForm = false">
              Cancel
            </button>
          </div>
        </div>
      </div>
      <!-- Stock History Ledger Modal -->
      <div *ngIf="showLedgerModal" class="modal">
        <div class="modal-box" style="width: 700px; max-width: 90vw;">
          <h2>Stock History - {{ ledgerItem?.name }}</h2>
          <p style="color: #777; font-size: 14px; margin-top: 4px;">
            Audit trail of all inventory movements.
          </p>

          <div style="margin-top: 20px; max-height: 400px; overflow-y: auto; border: 1px solid #eee; border-radius: 12px;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #fdfcf9; border-bottom: 2px solid #eee;">
                  <th style="padding: 10px; font-size: 13px; font-weight: 700; color: #555;">Date</th>
                  <th style="padding: 10px; font-size: 13px; font-weight: 700; color: #555;">Type</th>
                  <th style="padding: 10px; font-size: 13px; font-weight: 700; color: #555; text-align: right;">Qty In</th>
                  <th style="padding: 10px; font-size: 13px; font-weight: 700; color: #555; text-align: right;">Qty Out</th>
                  <th style="padding: 10px; font-size: 13px; font-weight: 700; color: #555; text-align: right;">Balance</th>
                  <th style="padding: 10px; font-size: 13px; font-weight: 700; color: #555;">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let entry of ledgerEntries" style="border-bottom: 1px solid #f9f9f9; font-size: 13px;">
                  <td style="padding: 10px;">{{ entry.txnDate | date:'short' }}</td>
                  <td style="padding: 10px;">
                    <span style="padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase;"
                          [style.background]="entry.txnType === 'ADJUSTMENT' ? '#fff3e0' : entry.txnType === 'PURCHASE' ? '#e8f6ea' : '#ffebee'"
                          [style.color]="entry.txnType === 'ADJUSTMENT' ? '#e65100' : entry.txnType === 'PURCHASE' ? '#2e7d32' : '#c62828'">
                      {{ entry.txnType }}
                    </span>
                  </td>
                  <td style="padding: 10px; text-align: right; font-weight: 600; color: #2e7d32;">
                    {{ entry.quantityIn > 0 ? '+' + entry.quantityIn : '-' }}
                  </td>
                  <td style="padding: 10px; text-align: right; font-weight: 600; color: #c62828;">
                    {{ entry.quantityOut > 0 ? '-' + entry.quantityOut : '-' }}
                  </td>
                  <td style="padding: 10px; text-align: right; font-weight: 700;">{{ entry.balanceAfter }}</td>
                  <td style="padding: 10px; color: #666; font-style: italic;">{{ entry.notes || '-' }}</td>
                </tr>
                <tr *ngIf="ledgerEntries.length === 0">
                  <td colspan="6" style="text-align: center; color: #999; padding: 20px;">
                    No inventory movements recorded yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="modal-actions" style="margin-top: 20px;">
            <button class="cancel-btn" (click)="showLedgerModal = false" style="margin-left: auto;">
              Close
            </button>
          </div>
        </div>
      </div>

    </div>
  `,

  styles: [`
    .inventory-page{
      padding:32px;
      background:#f7f4ef;
      min-height:100vh;
    }

    .page-header{
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:24px;
    }

    .page-header h1{
      margin:0;
      font-size:40px;
      font-weight:700;
    }

    .page-header p{
      color:#777;
      margin-top:6px;
    }

    .add-btn{
      background:#ff6b00;
      color:white;
      border:none;
      padding:12px 20px;
      border-radius:10px;
      cursor:pointer;
      font-weight:600;
    }

    .inventory-card{
      background:white;
      border-radius:16px;
      padding:24px;
      box-shadow:0 2px 10px rgba(0,0,0,.05);
    }

    .inventory-table{
      width:100%;
      border-collapse:collapse;
    }

    .inventory-table th{
      text-align:left;
      padding:14px;
      border-bottom:1px solid #eee;
      color:#777;
      font-size:14px;
    }

    .inventory-table td{
      padding:14px;
      border-bottom:1px solid #f2f2f2;
    }

    .stock-badge{
      background:#eaf7ee;
      color:#2e7d32;
      padding:6px 12px;
      border-radius:20px;
      font-size:13px;
      font-weight:600;
    }

    .low-stock{
      background:#fdecec;
      color:#c62828;
    }

    .modal{
      position:fixed;
      inset:0;
      background:rgba(0,0,0,.45);
      display:flex;
      justify-content:center;
      align-items:center;
      z-index:1000;
    }

    .modal-box{
      width:600px;
      background:white;
      border-radius:16px;
      padding:24px;
    }

    .form-grid{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:16px;
      margin-top:16px;
    }

    .form-group{
      display:flex;
      flex-direction:column;
    }

    .form-group label{
      margin-bottom:6px;
      font-weight:600;
    }

    .form-group input,
    .form-group select{
      padding:10px;
      border:1px solid #ddd;
      border-radius:8px;
    }

    .modal-actions{
      display:flex;
      justify-content:flex-end;
      gap:10px;
      margin-top:20px;
    }

    .save-btn{
      background:#ff6b00;
      color:white;
      border:none;
      padding:10px 20px;
      border-radius:8px;
      cursor:pointer;
    }

    .cancel-btn{
      background:#eee;
      border:none;
      padding:10px 20px;
      border-radius:8px;
      cursor:pointer;
    }
  `]
})
export class InventoryComponent implements OnInit {

  private inventoryService = inject(InventoryService);
  private authService = inject(AuthService);
  private outletService = inject(OutletService);
  private http = inject(HttpClient);

  items: any[] = [];
  categories: any[] = [];
  outlets: Outlet[] = [];
  organizations: any[] = [];

  isSuperAdmin = false;
  isPowerAdmin = false;
  selectedOutletId = '';
  selectedOrganizationId = '';

  showAddForm = false;

  newItem: any = {
    outletId: '',
    code: '',
    name: '',
    unit: 'Kg',
    reorderLevel: 0,
    categoryId: null
  };

  showEditForm = false;
  showAdjustForm = false;
  showLedgerModal = false;
  editingItem: any = {};
  adjustingItem: any = null;
  ledgerItem: any = null;
  ledgerEntries: any[] = [];
  adjustmentQuantity: number | null = null;
  adjustmentNotes = '';

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
      this.loadInventory();
      this.loadCategories();
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
          this.loadInventory();
          this.loadCategories();
        }
      },
      error: (err) => console.error('Error loading outlets:', err)
    });
  }

  loadInventory(): void {
    if (this.isSuperAdmin && !this.selectedOutletId) {
      this.items = [];
      return;
    }

    this.inventoryService.getAll(this.selectedOutletId).subscribe({
      next: (data) => {
        this.items = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadCategories(targetOutletId?: string): void {
    const outletId = targetOutletId || this.selectedOutletId;
    if (this.isSuperAdmin && !outletId) {
      this.categories = [];
      return;
    }

    this.inventoryService.getCategories(outletId).subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onOutletFilterChange(): void {
    this.loadInventory();
    this.loadCategories();
  }

  onOrganizationChange(): void {
    this.selectedOutletId = '';
    this.loadOutlets();
    this.loadInventory();
    this.loadCategories();
  }

  onModalOutletChange(): void {
    this.loadCategories(this.newItem.outletId);
  }

  openAddForm(): void {
    if (this.isSuperAdmin && !this.selectedOutletId) {
      alert('Please select an outlet first.');
      return;
    }

    const user = this.authService.currentUser;

    this.newItem = {
      outletId: this.isSuperAdmin ? this.selectedOutletId : (user?.outletId || ''),
      code: '',
      name: '',
      unit: 'Kg',
      reorderLevel: 0,
      categoryId: null
    };

    if (this.isSuperAdmin) {
      this.onModalOutletChange();
    }

    this.showAddForm = true;
  }

  saveItem(): void {
    if (!this.newItem.outletId) {
      alert('Please select an outlet.');
      return;
    }

    if (!this.newItem.name?.trim()) {
      alert('Item name is required.');
      return;
    }

    this.inventoryService.create(this.newItem).subscribe({
      next: () => {
        alert('Raw Material Added');
        this.showAddForm = false;
        this.loadInventory();
      },
      error: (err) => {
        console.error(err);
        alert(err?.error?.message ?? 'Failed to save raw material');
      }
    });
  }

  openEditForm(item: any): void {
    this.editingItem = { ...item };
    this.showEditForm = true;
  }

  saveEditItem(): void {
    if (!this.editingItem.name?.trim()) {
      alert('Item name is required.');
      return;
    }

    this.inventoryService.update(this.editingItem.id, this.editingItem).subscribe({
      next: () => {
        alert('Raw Material updated successfully.');
        this.showEditForm = false;
        this.loadInventory();
      },
      error: (err) => {
        console.error(err);
        alert(err?.error?.message ?? 'Failed to update raw material');
      }
    });
  }

  openAdjustForm(item: any): void {
    this.adjustingItem = item;
    this.adjustmentQuantity = null;
    this.adjustmentNotes = '';
    this.showAdjustForm = true;
  }

  saveAdjustment(): void {
    if (this.adjustmentQuantity === null || this.adjustmentQuantity === undefined) {
      alert('Please enter adjustment quantity.');
      return;
    }

    this.inventoryService.adjustStock(this.adjustingItem.id, this.adjustmentQuantity, this.adjustmentNotes).subscribe({
      next: () => {
        alert('Stock adjusted successfully.');
        this.showAdjustForm = false;
        this.loadInventory();
      },
      error: (err) => {
        console.error(err);
        alert(err?.error?.message ?? 'Failed to adjust stock');
      }
    });
  }

  deleteItem(item: any): void {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      this.inventoryService.delete(item.id).subscribe({
        next: () => {
          alert('Raw Material deleted successfully.');
          this.loadInventory();
        },
        error: (err) => {
          console.error(err);
          alert(err?.error?.message ?? 'Failed to delete raw material');
        }
      });
    }
  }

  openLedgerModal(item: any): void {
    this.ledgerItem = item;
    this.ledgerEntries = [];
    this.showLedgerModal = true;

    this.inventoryService.getLedger(item.id).subscribe({
      next: (res) => {
        this.ledgerEntries = res;
      },
      error: (err) => {
        console.error('Error loading stock history:', err);
        alert('Failed to load stock history.');
      }
    });
  }
}