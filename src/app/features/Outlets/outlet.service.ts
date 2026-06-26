import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Outlet {
  id: string;
  name: string;
  address: string;
}

@Injectable({
  providedIn: 'root'
})
export class OutletService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5253/api/Outlets';

  getOutlets(): Observable<Outlet[]> {
    return this.http.get<Outlet[]>(this.apiUrl);
  }
}