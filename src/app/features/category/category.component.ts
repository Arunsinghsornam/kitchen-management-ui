import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

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

  categories: Category[] = [];
  outlets: Outlet[] = [];

  category: Partial<Category> = {
    outletId: '',
    name: ''
  };

  isSuperAdmin = false;
  isEditMode = false;
  showForm = false;

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.isSuperAdmin = user?.role === 'super_admin' || user?.role === 'power_admin';
    this.category.outletId = this.isSuperAdmin ? '' : (user?.outletId || '');

    if (this.isSuperAdmin) {
      this.loadOutlets();
    }
    this.loadCategories();
  }

  loadOutlets() {
    this.categoryService.getOutlets().subscribe({
      next: (data) => {
        this.outlets = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error(err);
      }
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
