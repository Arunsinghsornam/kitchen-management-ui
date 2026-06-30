import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

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
    organizationId?: string;
    organizationName?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = `${environment.apiUrl}/api/Auth`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(`${this.api}/login`, {
        email,
        password
      })
      .pipe(
        tap(response => {

          if (response.success) {

            localStorage.setItem(
              'access_token',
              response.data.accessToken
            );

            localStorage.setItem(
              'refresh_token',
              response.data.refreshToken
            );

            localStorage.setItem(
              'user',
              JSON.stringify(response.data)
            );

          }

        })
      );
  }

  logout() {

    localStorage.clear();

  }

  get token(): string | null {

    return localStorage.getItem('access_token');

  }

  get currentUser() {

    const user = localStorage.getItem('user');

    return user ? JSON.parse(user) : null;

  }

  get isLoggedIn(): boolean {

    return !!this.token;

  }

  getOrganizationName(): string {
    return this.currentUser?.organizationName ?? 'Pav Republic';
  }

  getOutletId(): string {
    return this.currentUser?.outletId ?? '';
  }

  isSuperAdmin(): boolean {
    return this.currentUser?.role === 'super_admin';
  }

  isPowerAdmin(): boolean {
    return this.currentUser?.role === 'power_admin';
  }

  isStoreManager(): boolean {
    return this.currentUser?.role === 'store_manager';
  }

  isKitchenStaff(): boolean {
    return this.currentUser?.role === 'kitchen_staff';
  }

  isAccountant(): boolean {
    return this.currentUser?.role === 'accountant';
  }
}