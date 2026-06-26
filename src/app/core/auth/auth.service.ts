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

          localStorage.setItem(
            'access_token',
            res.data.accessToken
          );

          localStorage.setItem(
            'refresh_token',
            res.data.refreshToken
          );

          localStorage.setItem(
            'user',
            JSON.stringify(res.data)
          );

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

}