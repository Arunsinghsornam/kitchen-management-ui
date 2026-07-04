import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private apiUrl = 'http://localhost:5253/api/Inventory';

  constructor(private http: HttpClient) {}

  getAll(outletId?: string): Observable<any[]> {
    let url = this.apiUrl;
    if (outletId) {
      url += `?outletId=${outletId}`;
    }
    return this.http.get<any[]>(url);
  }

  getCategories(outletId?: string): Observable<any[]> {
    let url = `${this.apiUrl}/categories`;
    if (outletId) {
      url += `?outletId=${outletId}`;
    }
    return this.http.get<any[]>(url);
  }

  create(item: any) {
    return this.http.post(this.apiUrl, item);
  }
}
