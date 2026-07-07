import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  outletId?: string;
  outletName?: string;
  organizationId?: string;
  organizationName?: string;
  isActive: boolean;
  createdAt: string;
}
export interface CreateUser {
  email: string;
  password: string;
  fullName: string;
  role: string;
  outletId: string | null;
}
@Injectable({
  providedIn: 'root'
})
export class UserService {

  private api = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  getUsers(organizationId?: string): Observable<any> {
    let url = this.api;
    if (organizationId) {
      url += `?organizationId=${organizationId}`;
    }
    return this.http.get(url);
  }

  getUser(id: string): Observable<any> {
    return this.http.get(`${this.api}/${id}`);
  }

  createUser(user: CreateUser): Observable<any> {
  return this.http.post(this.api, user);
}
  

  updateUser(id: string, user: any): Observable<any> {
    return this.http.put(`${this.api}/${id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  resetPassword(id: string, newPassword: string): Observable<any> {
    return this.http.post(
      `${this.api}/${id}/reset-password`,
      { newPassword }
    );
  }

}