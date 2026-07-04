import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import {
  Category,
  Outlet,
  CategoryService
} from './category.service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {

  private categoryService = inject(CategoryService);
  public authService = inject(AuthService);
  private http = inject(HttpClient);

  categories: Category[] = [];
  outlets: Outlet[] = [];
  organizations: any[] = [];

  category: Partial<Category> = {
    outletId: '',
    name: ''
  };

  isSuperAdmin = false;
  isPowerAdmin = false;
  isEditMode = false;
  showForm = false;
  selectedOrganizationId = '';

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.isSuperAdmin = user?.role === 'super_admin' || user?.role === 'power_admin';
    this.isPowerAdmin = user?.role === 'power_admin';
    this.category.outletId = this.isSuperAdmin ? '' : (user?.outletId || '');

    if (this.isPowerAdmin) {
      this.loadOrganizations();
    }
    if (this.isSuperAdmin) {
      this.loadOutlets();
    }
    this.loadCategories();
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

  loadOutlets() {
    this.categoryService.getOutlets(this.selectedOrganizationId).subscribe({
      next: (data) => {
        this.outlets = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadCategories() {
    this.categoryService.getCategories(this.selectedOrganizationId).subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onOrganizationChange(): void {
    this.category.outletId = '';
    this.loadOutlets();
    this.loadCategories();
  }

  onModalOrganizationChange(): void {
    this.category.outletId = '';
    this.categoryService.getOutlets(this.selectedOrganizationId).subscribe({
      next: data => this.outlets = data,
      error: err => console.error(err)
    });
  }

  saveCategory() {

    if (!this.category.outletId) {
      alert('Please select an outlet.');
      return;
    }

    if (!this.category.name?.trim()) {
      alert('Category name is required.');
      return;
    }

    if (this.isEditMode) {

      this.categoryService.updateCategory(
        this.category.id!,
        this.category
      ).subscribe({

        next: () => {
          alert('Category updated successfully.');
          this.resetForm();
          this.loadCategories();
        },

        error: (err) => {
          alert(err.error?.message || 'Update failed.');
        }

      });

    } else {

      this.categoryService.createCategory(this.category).subscribe({

        next: () => {
          alert('Category created successfully.');
          this.resetForm();
          this.loadCategories();
        },

        error: (err) => {
          alert(err.error?.message || 'Creation failed.');
        }

      });

    }

  }

  openAddForm() {
    this.isEditMode = false;
    this.showForm = true;
    const user = this.authService.getUser();
    this.category = {
      outletId: this.isSuperAdmin ? '' : (user?.outletId || ''),
      name: ''
    };
  }

  editCategory(category: Category) {
    this.category = {
      id: category.id,
      outletId: category.outletId,
      name: category.name
    };
    this.isEditMode = true;
    this.showForm = true;
  }

  deleteCategory(id: string) {

    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    this.categoryService.deleteCategory(id).subscribe({

      next: () => {
        alert('Category deleted successfully.');
        this.loadCategories();
      },

      error: (err) => {
        alert(err.error?.message || 'Delete failed.');
      }

    });

  }

  resetForm() {
    const user = this.authService.getUser();
    this.category = {
      outletId: this.isSuperAdmin ? '' : (user?.outletId || ''),
      name: ''
    };

    this.isEditMode = false;
    this.showForm = false;
  }

  filteredCategories(): Category[] {
    if (this.isSuperAdmin) {
      return this.categories;
    }
    const user = this.authService.getUser();
    return this.categories.filter(c => c.outletId === user?.outletId);
  }

}
