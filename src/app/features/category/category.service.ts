import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Outlet {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  outletId: string;
  outlet?: Outlet;
  name: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private http = inject(HttpClient);

  private baseUrl = 'http://localhost:5253/api';

  private categoryApi = `${this.baseUrl}/categories`;
  private outletApi = `${this.baseUrl}/outlets`;

  // =========================
  // CATEGORY APIs
  // =========================

  getCategories(organizationId?: string): Observable<Category[]> {
    let url = this.categoryApi;
    if (organizationId) {
      url += `?organizationId=${organizationId}`;
    }
    return this.http.get<Category[]>(url);
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(this.categoryApi, category);
  }

  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.categoryApi}/${id}`, category);
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.categoryApi}/${id}`);
  }

  // =========================
  // OUTLET APIs
  // =========================

  getOutlets(organizationId?: string): Observable<Outlet[]> {
    let url = this.outletApi;
    if (organizationId) {
      url += `?organizationId=${organizationId}`;
    }
    return this.http.get<Outlet[]>(url);
  }
}
