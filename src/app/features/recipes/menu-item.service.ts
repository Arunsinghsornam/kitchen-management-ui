import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
providedIn: 'root'
})
export class MenuItemService {

private http = inject(HttpClient);

private apiUrl = 'http://localhost:5253/api/Recipes';

getMenuItems() {
return this.http.get<any[]>(this.apiUrl);
}
}
