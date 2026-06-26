import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RawMaterialService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5253/api/RawMaterials';

  getMaterials(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}