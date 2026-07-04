import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
providedIn: 'root'
})
export class MenuItemService {

private http = inject(HttpClient);

private apiUrl = 'http://localhost:5253/api/Recipes';

  getMenuItems(outletId?: string) {
    let url = this.apiUrl;
    if (outletId) {
      url += `?outletId=${outletId}`;
    }
    return this.http.get<any[]>(url);
  }
}
