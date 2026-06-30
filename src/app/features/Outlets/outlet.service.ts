import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Outlet {
  id?: string;
  name: string;
  address: string;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OutletService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5253/api/Outlets';


  // GET ALL
  getOutlets(): Observable<Outlet[]> {
    return this.http.get<Outlet[]>(this.apiUrl);
  }


  // GET BY ID
  getOutletById(id: string): Observable<Outlet> {
    return this.http.get<Outlet>(`${this.apiUrl}/${id}`);
  }


  // CREATE
  addOutlet(outlet: Outlet): Observable<Outlet> {
    return this.http.post<Outlet>(this.apiUrl, outlet);
  }


  // UPDATE
  updateOutlet(id: string, outlet: Outlet): Observable<Outlet> {
    return this.http.put<Outlet>(
      `${this.apiUrl}/${id}`,
      outlet
    );
  }


  // DELETE
  deleteOutlet(id: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }

}
