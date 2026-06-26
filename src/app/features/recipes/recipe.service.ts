import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
providedIn: 'root'
})
export class RecipeService {

private http = inject(HttpClient);

private apiUrl = 'http://localhost:5253/api/Recipes';

getRecipes(): Observable<any[]> {
return this.http.get<any[]>(this.apiUrl);
}

createRecipe(data: any): Observable<any> {
return this.http.post(this.apiUrl, data);
}

updateRecipe(id: string, data: any): Observable<any> {
return this.http.put(`${this.apiUrl}/${id}`, data);
}

deleteRecipe(id: string): Observable<any> {
return this.http.delete(`${this.apiUrl}/${id}`);
}
}
