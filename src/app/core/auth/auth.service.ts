import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    userId: string;
    email: string;
    fullName: string;
    role: string;
    outletId: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = `${environment.apiUrl}/api/Auth`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.api}/login`,
      { email, password }
    ).pipe(
      tap(res => {
        if (res.success) {

          localStorage.setItem('access_token', res.data.accessToken);
          localStorage.setItem('refresh_token', res.data.refreshToken);
          localStorage.setItem('user', JSON.stringify(res.data));

        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // ==========================
  // New helper methods
  // ==========================

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getRole(): string {
    return this.getUser()?.role ?? '';
  }

  getFullName(): string {
    return this.getUser()?.fullName ?? '';
  }

  getEmail(): string {
    return this.getUser()?.email ?? '';
  }

  getOutletId(): string {
    return this.getUser()?.outletId ?? '';
  }

  isSuperAdmin(): boolean {
    return this.getRole() === 'super_admin';
  }

  isStoreManager(): boolean {
    return this.getRole() === 'store_manager';
  }

  isAccountant(): boolean {
    return this.getRole() === 'accountant';
  }

  isKitchenStaff(): boolean {
    return this.getRole() === 'kitchen_staff';
  }

}