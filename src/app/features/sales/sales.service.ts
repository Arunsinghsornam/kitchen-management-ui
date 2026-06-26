import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
providedIn: 'root'
})
export class SalesService {

private http = inject(HttpClient);

private apiUrl = 'http://localhost:5253/api/Sales';

getSales() {
return this.http.get<any[]>(this.apiUrl);
}

createSale(data: any) {
return this.http.post(this.apiUrl, data);
}

deleteSale(id: string) {
return this.http.delete(`${this.apiUrl}/${id}`);
}
}
