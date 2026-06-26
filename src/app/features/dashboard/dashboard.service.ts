import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'https://localhost:7053/api/Dashboard';

  constructor(private http: HttpClient) {}

  getSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/summary`);
  }
}