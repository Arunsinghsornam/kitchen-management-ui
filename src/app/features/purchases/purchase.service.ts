import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {

  private apiUrl = `${environment.apiUrl}/api/Purchases`;

  constructor(private http: HttpClient) {}

  getAll(outletId?: string, organizationId?: string): Observable<any[]> {
    let url = this.apiUrl;
    const params: string[] = [];
    if (outletId) {
      params.push(`outletId=${outletId}`);
    }
    if (organizationId) {
      params.push(`organizationId=${organizationId}`);
    }
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    return this.http.get<any[]>(url);
  }

  create(data: any) {
    return this.http.post(this.apiUrl, data);
  }
}