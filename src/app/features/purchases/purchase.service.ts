import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {

  private apiUrl = 'https://localhost:7053/api/Purchases';

  constructor(private http: HttpClient) {}

  getAll(outletId?: string): Observable<any[]> {
    let url = this.apiUrl;
    if (outletId) {
      url += `?outletId=${outletId}`;
    }
    return this.http.get<any[]>(url);
  }

  create(data: any) {
    return this.http.post(this.apiUrl, data);
  }
}