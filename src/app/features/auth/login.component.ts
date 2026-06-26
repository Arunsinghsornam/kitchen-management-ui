import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="logo">🍞</div>
        <h1>Pav Republic</h1>
        <p class="subtitle">Kitchen Operations Portal</p>

        <div class="form-group">
          <label>Email</label>
          <input
            type="email"
            [(ngModel)]="email"
            placeholder="arun@pavrepublic.in"
          />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input
            [type]="showPwd ? 'text' : 'password'"
            [(ngModel)]="password"
            placeholder="Password"
          />
          <span class="eye" (click)="showPwd = !showPwd">
            {{ showPwd ? '🙈' : '👁️' }}
          </span>
        </div>

        <div class="error" *ngIf="error">{{ error }}</div>

        <button class="login-btn" (click)="login()" [disabled]="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; }

    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #c0392b 100%);
      font-family: Arial, sans-serif;
    }

    .login-card {
      background: white;
      width: 380px;
      padding: 40px 32px;
      text-align: center;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }

    .logo { font-size: 48px; margin-bottom: 8px; }

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .subtitle {
      color: #888;
      margin: 4px 0 24px;
      font-size: 14px;
    }

    .form-group {
      text-align: left;
      margin-bottom: 16px;
      position: relative;
    }

    .form-group label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #555;
      margin-bottom: 6px;
    }

    .form-group input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
    }

    .form-group input:focus {
      border-color: #c0392b;
    }

    .eye {
      position: absolute;
      right: 12px;
      top: 34px;
      cursor: pointer;
      font-size: 16px;
      user-select: none;
    }

    .error {
      background: #fdecea;
      color: #c0392b;
      padding: 10px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
    }

    .login-btn {
      width: 100%;
      background: #c0392b;
      color: white;
      border: none;
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
    }

    .login-btn:hover {
      background: #a93226;
    }

    .login-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;
  showPwd = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  login() {
     console.log('LOGIN BUTTON CLICKED');
  console.log('Email:', this.email);
  console.log('Password:', this.password);

  this.error = '';
  this.loading = true;
  this.error = '';
  this.loading = true;

  if (!this.email || !this.password) {
    this.error = 'Email and password are required';
    this.loading = false;
    return;
  }

  this.auth.login(this.email, this.password).subscribe({
    next: (response: any) => {
      this.loading = false;

      console.log("LOGIN RESPONSE:", response);

      if (response.success && response.data?.accessToken) {
    this.router.navigate(['/dashboard']);
} else {
        this.error = response?.message || 'Invalid login';
      }
    },

    error: (err) => {
      this.loading = false;

      if (err.status === 401) {
        this.error = 'Invalid email or password';
      } else if (err.status === 400) {
        this.error = 'Please enter email and password';
      } else {
        this.error = 'Server error';
      }
    }
  });
}
}