import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SupplierService } from './supplier.service';
import { OutletService, Outlet } from '../outlets/outlet.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],

  template: `

<div class="page">

  <div class="header" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">

    <div>
      <h2>Suppliers</h2>
      <p>Manage supplier information</p>
    </div>

    <div style="display: flex; align-items: center; gap: 15px; margin-left: auto;">
      <!-- Outlet Dropdown filter for Super Admin -->
      <div *ngIf="isSuperAdmin" class="outlet-filter-box">
        <select [(ngModel)]="selectedOutletId" (change)="onOutletFilterChange()" 
                style="padding: 10px; border: 1px solid #ddd; border-radius: 10px; font-size: 14px; background: white; outline: none; min-width: 180px; font-weight: 600;">
          <option value="">All Outlets</option>
          <option *ngFor="let outlet of outlets" [value]="outlet.id">
            {{ outlet.name }}
          </option>
        </select>
      </div>

      <button class="add-btn" (click)="newSupplier()">
        + Add Supplier
      </button>
    </div>

  </div>

  <div class="cards">

    <div class="card">
      <span>Total Suppliers</span>
      <h2>{{ totalSuppliers }}</h2>
    </div>

    <div class="card">
      <span>Active Vendors</span>
      <h2>{{ totalSuppliers }}</h2>
    </div>

  </div>

  <div class="search-box">

    <input
      [(ngModel)]="searchText"
      placeholder="Search suppliers...">

  </div>

  <!-- FORM -->
  <div *ngIf="showForm" class="supplier-form">

    <h3>
      {{ editing ? 'Edit Supplier' : 'Add Supplier' }}
    </h3>

    <div class="form-grid">

      <!-- Outlet Select (Visible only to Super Admin) -->
      <select *ngIf="isSuperAdmin" [(ngModel)]="supplier.outletId" style="grid-column: span 2;">
        <option value="">
          Select Outlet
        </option>
        <option
          *ngFor="let outlet of outlets"
          [value]="outlet.id">
          {{ outlet.name }}
        </option>
      </select>

      <input [(ngModel)]="supplier.name" placeholder="Supplier Name">
      <input [(ngModel)]="supplier.contactPerson" placeholder="Contact Person">
      <input [(ngModel)]="supplier.mobile" placeholder="Mobile">
      <input [(ngModel)]="supplier.gstNumber" placeholder="GST Number">
      <input [(ngModel)]="supplier.email" placeholder="Email">
      <input [(ngModel)]="supplier.address" placeholder="Address">

    </div>

    <div class="actions">

      <button class="save-btn" (click)="save()">
        Save
      </button>

      <button class="cancel-btn" (click)="showForm=false">
        Cancel
      </button>

    </div>

  </div>

  <!-- TABLE -->
  <div class="table-card">

    <table>

      <thead>
        <tr>
          <th>Outlet</th>
          <th>Name</th>
          <th>Contact Person</th>
          <th>Mobile</th>
          <th>Email</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>

        <tr *ngFor="let s of filteredSuppliers()">

          <td>{{ s.outlet?.name || 'N/A' }}</td>
          <td>{{ s.name }}</td>
          <td>{{ s.contactPerson }}</td>
          <td>{{ s.mobile }}</td>
          <td>{{ s.email }}</td>

          <td>
            <button class="edit-btn" (click)="edit(s)">
              Edit
            </button>

            <button class="delete-btn" (click)="remove(s.id)">
              Delete
            </button>
          </td>

        </tr>

      </tbody>

    </table>

  </div>

</div>

  `,

  styles: [`

.page{
  padding:30px;
  background:#f7f4ef;
  min-height:100vh;
}

.header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:25px;
}

.header h2{
  margin:0;
  font-size:32px;
}

.header p{
  margin-top:5px;
  color:#777;
}

.add-btn{
  background:#ff6b35;
  color:#fff;
  border:none;
  padding:12px 20px;
  border-radius:10px;
  cursor:pointer;
  font-weight:600;
}

.cards{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:20px;
  margin-bottom:20px;
}

.card{
  background:#fff;
  padding:20px;
  border-radius:16px;
  box-shadow:0 2px 10px rgba(0,0,0,.05);
}

.card span{
  color:#777;
}

.card h2{
  margin-top:10px;
  margin-bottom:0;
}

.search-box{
  margin:20px 0;
}

.search-box input{
  width:350px;
  padding:12px;
  border:1px solid #ddd;
  border-radius:10px;
  font-size:14px;
  outline:none;
}

.search-box input:focus{
  border-color:#ff6b35;
}

.supplier-form{
  background:#fff;
  padding:20px;
  border-radius:16px;
  margin-bottom:20px;
  box-shadow:0 2px 10px rgba(0,0,0,.05);
}

.form-grid{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:15px;
}

.form-grid input,
.form-grid select{
  padding:12px;
  border:1px solid #ddd;
  border-radius:10px;
}

.actions{
  margin-top:20px;
}

.save-btn{
  background:#28a745;
  color:white;
  border:none;
  padding:10px 20px;
  border-radius:8px;
  cursor:pointer;
}

.cancel-btn{
  margin-left:10px;
  padding:10px 20px;
  border:none;
  border-radius:8px;
  cursor:pointer;
}

.table-card{
  background:white;
  border-radius:16px;
  overflow:hidden;
  box-shadow:0 2px 10px rgba(0,0,0,.05);
}

table{
  width:100%;
  border-collapse:collapse;
}

th{
  background:#f8f9fa;
  padding:14px;
  text-align:left;
}

td{
  padding:14px;
  border-top:1px solid #eee;
}

tr:hover{
  background:#fafafa;
}

.edit-btn{
  background:#0d6efd;
  color:white;
  border:none;
  padding:8px 12px;
  border-radius:6px;
  margin-right:6px;
  cursor:pointer;
}

.delete-btn{
  background:#dc3545;
  color:white;
  border:none;
  padding:8px 12px;
  border-radius:6px;
  cursor:pointer;
}

`]
})
export class SuppliersComponent implements OnInit {

  private supplierService = inject(SupplierService);
  private outletService = inject(OutletService);
  private authService = inject(AuthService);

  suppliers: any[] = [];
  outlets: Outlet[] = [];

  isSuperAdmin = false;
  selectedOutletId = '';
  searchText = '';

  showForm = false;
  editing = false;

  supplier: any = {};

  get totalSuppliers(): number {
    return this.suppliers.length;
  }

  ngOnInit(): void {
    const user = this.authService.currentUser;
    this.isSuperAdmin = user?.role === 'super_admin' || user?.role === 'power_admin';

    if (this.isSuperAdmin) {
      this.loadOutlets();
    } else {
      this.selectedOutletId = user?.outletId || '';
    }

    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers(this.selectedOutletId).subscribe({
      next: data => this.suppliers = data,
      error: err => console.error(err)
    });
  }

  loadOutlets(): void {
    this.outletService.getOutlets().subscribe({
      next: data => this.outlets = data,
      error: err => console.error(err)
    });
  }

  onOutletFilterChange(): void {
    this.loadSuppliers();
  }

  newSupplier(): void {
    this.editing = false;
    this.showForm = true;

    const user = this.authService.currentUser;

    this.supplier = {
      id: '',
      outletId: this.isSuperAdmin ? (this.selectedOutletId || '') : (user?.outletId || ''),
      name: '',
      contactPerson: '',
      mobile: '',
      gstNumber: '',
      email: '',
      address: ''
    };
  }

  edit(item: any): void {
    this.editing = true;
    this.showForm = true;

    this.supplier = {
      id: item.id,
      outletId: item.outletId,
      name: item.name,
      contactPerson: item.contactPerson,
      mobile: item.mobile,
      gstNumber: item.gstNumber,
      email: item.email,
      address: item.address
    };
  }

  save(): void {
    if (!this.supplier.outletId) {
      alert('Please select an outlet.');
      return;
    }

    if (!this.supplier.name?.trim()) {
      alert('Supplier name is required.');
      return;
    }

    if (this.editing) {
      this.supplierService.updateSupplier(this.supplier).subscribe({
        next: () => {
          this.loadSuppliers();
          this.showForm = false;
        },
        error: err => console.error(err)
      });
    } else {
      this.supplierService.createSupplier(this.supplier).subscribe({
        next: () => {
          this.loadSuppliers();
          this.showForm = false;
        },
        error: err => console.error(err)
      });
    }
  }

  remove(id: string): void {
    if (!confirm('Are you sure you want to delete this supplier?')) {
      return;
    }

    this.supplierService.deleteSupplier(id).subscribe({
      next: () => this.loadSuppliers(),
      error: err => console.error(err)
    });
  }

  filteredSuppliers(): any[] {
    if (!this.searchText) return this.suppliers;

    return this.suppliers.filter(x =>
      (x.name || '').toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}
