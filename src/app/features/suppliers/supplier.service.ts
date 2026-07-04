import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  private baseUrl = 'http://localhost:5253/api/suppliers';

  constructor(private http: HttpClient) { }

  // GET ALL
  getAll(outletId?: string, organizationId?: string): Observable<any[]> {
    let url = this.baseUrl;
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
    return this.http.get<any>(url).pipe(
      map(res => res.data)
    );
  }

  // ALIAS (for compatibility)
  getSuppliers(outletId?: string, organizationId?: string): Observable<any[]> {
    return this.getAll(outletId, organizationId);
  }

  // CREATE
  createSupplier(data: any): Observable<any> {
    const payload = {
      outletId: data.outletId,
      name: data.name,
      contactPerson: data.contactPerson,
      mobile: data.mobile,
      gstNumber: data.gstNumber,
      email: data.email,
      address: data.address,
      outstanding: data.outstanding ?? 0
    };

    return this.http.post(this.baseUrl, payload);
  }

  // UPDATE
  updateSupplier(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${data.id}`, data);
  }

  // DELETE
  deleteSupplier(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}