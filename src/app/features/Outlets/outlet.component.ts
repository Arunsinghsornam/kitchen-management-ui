import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { Outlet, OutletService } from './outlet.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-outlet',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './outlet.component.html',
  styleUrls: ['./outlet.component.css']
})
export class OutletComponent implements OnInit {

  private outletService = inject(OutletService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  outlets: Outlet[] = [];
  organizations: any[] = [];

  newOutlet: Outlet = {
    name: '',
    address: '',
    active: true,
    organizationId: ''
  };

  isPowerAdmin = false;
  isEditMode = false;
  editingId = '';
  showForm = false;
  selectedOrganizationId = '';

  ngOnInit(): void {
    const user = this.authService.currentUser;
    this.isPowerAdmin = user?.role === 'power_admin';

    if (this.isPowerAdmin) {
      this.loadOrganizations();
    }
    this.loadOutlets();
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
      },
      error: () => {
        alert('Unable to load outlets.');
      }
    });
  }

  onOrganizationChange(): void {
    this.loadOutlets();
  }

  openAddForm(): void {
    this.isEditMode = false;
    this.showForm = true;
    this.editingId = '';
    this.newOutlet = {
      name: '',
      address: '',
      active: true,
      organizationId: this.selectedOrganizationId || ''
    };
  }

  saveOutlet(): void {
    if (!this.newOutlet.name.trim()) {
      alert('Please enter outlet name.');
      return;
    }

    if (this.isEditMode) {
      this.newOutlet.id = this.editingId;
      this.outletService.updateOutlet(this.editingId, this.newOutlet).subscribe({
        next: () => {
          alert('Outlet updated successfully.');
          this.cancelEdit();
          this.loadOutlets();
        },
        error: () => {
          alert('Unable to update outlet.');
        }
      });
    } else {
      this.outletService.addOutlet(this.newOutlet).subscribe({
        next: () => {
          alert('Outlet added successfully.');
          this.cancelEdit();
          this.loadOutlets();
        },
        error: () => {
          alert('Unable to add outlet.');
        }
      });
    }
  }

  editOutlet(outlet: Outlet): void {
    this.isEditMode = true;
    this.showForm = true;
    this.editingId = outlet.id!;
    this.newOutlet = {
      id: outlet.id,
      name: outlet.name,
      address: outlet.address,
      active: outlet.active
    };
  }

  deleteOutlet(id?: string): void {
    if (!id) {
      return;
    }

    if (!confirm('Are you sure you want to delete this outlet?')) {
      return;
    }

    this.outletService.deleteOutlet(id).subscribe({
      next: () => {
        alert('Outlet deleted successfully.');
        this.loadOutlets();
      },
      error: () => {
        alert('Unable to delete outlet.');
      }
    });
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.showForm = false;
    this.editingId = '';
    this.newOutlet = {
      name: '',
      address: '',
      active: true
    };
  }
}
