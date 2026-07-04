import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
providedIn: 'root'
})
export class RecipeService {

private http = inject(HttpClient);

private apiUrl = 'http://localhost:5253/api/Recipes';

getRecipes(outletId?: string): Observable<any[]> {
  let url = this.apiUrl;
  if (outletId) {
    url += `?outletId=${outletId}`;
  }
  return this.http.get<any[]>(url);
}

createRecipe(data: any, outletId?: string): Observable<any> {
  let url = this.apiUrl;
  if (outletId) {
    url += `?outletId=${outletId}`;
  }
  return this.http.post(url, data);
}

updateRecipe(id: string, data: any): Observable<any> {
return this.http.put(`${this.apiUrl}/${id}`, data);
}

deleteRecipe(id: string): Observable<any> {
return this.http.delete(`${this.apiUrl}/${id}`);
}
}
