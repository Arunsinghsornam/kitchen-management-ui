import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private apiUrl = 'https://localhost:7053/api/Inventory';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(this.apiUrl);
  }

  getCategories() {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }

  create(item: any) {
    return this.http.post(this.apiUrl, item);
  }
}