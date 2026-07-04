import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5253/api/Sales';

  getSales(outletId?: string): Observable<any[]> {
    let url = this.apiUrl;
    if (outletId) {
      url += `?outletId=${outletId}`;
    }
    return this.http.get<any[]>(url);
  }

  createSale(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  deleteSale(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
