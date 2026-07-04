import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="register-page">
      <div class="register-card" *ngIf="!isRegistered">
        <div class="logo">🍞</div>
        <h1>Start Your Kitchen Journey</h1>
        <p class="subtitle">Create a new organization & setup your first outlet</p>

        <form (ngSubmit)="register()" #registerForm="ngForm">
          
          <div class="section-title">🏢 Organization Info</div>
          
          <div class="form-group">
            <label>Organization Name</label>
            <input
              type="text"
              name="organizationName"
              [(ngModel)]="orgName"
              required
              placeholder="e.g. Pav Republic Group"
              #orgNameInput="ngModel"
            />
            <div class="field-error" *ngIf="orgNameInput.touched && orgNameInput.invalid">
              Organization name is required
            </div>
          </div>

          <div class="form-group">
            <label>Organization Logo (Optional)</label>
            <input
              type="file"
              (change)="onFileSelected($event)"
              accept="image/*"
              style="padding: 8px 14px; border: 2px dashed #e0e0e0; cursor: pointer; width: 100%; border-radius: 8px;"
            />
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Initial Outlet Name</label>
              <input
                type="text"
                name="outletName"
                [(ngModel)]="outletName"
                required
                placeholder="e.g. Bandra West Store"
                #outletNameInput="ngModel"
              />
              <div class="field-error" *ngIf="outletNameInput.touched && outletNameInput.invalid">
                Outlet name is required
              </div>
            </div>

            <div class="form-group">
              <label>Outlet Address</label>
              <input
                type="text"
                name="outletAddress"
                [(ngModel)]="outletAddress"
                placeholder="e.g. Hill Road, Mumbai"
              />
            </div>
          </div>

          <div class="section-title">👤 Account Owner Info (Super Admin)</div>

          <div class="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              [(ngModel)]="fullName"
              required
              placeholder="e.g. Arun Singh"
              #fullNameInput="ngModel"
            />
            <div class="field-error" *ngIf="fullNameInput.touched && fullNameInput.invalid">
              Owner full name is required
            </div>
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              [(ngModel)]="email"
              required
              email
              placeholder="arun@pavrepublic.in"
              #emailInput="ngModel"
            />
            <div class="field-error" *ngIf="emailInput.touched && emailInput.invalid">
              Please enter a valid email address
            </div>
          </div>

          <div class="form-group">
            <label>Password</label>
            <div class="password-wrapper">
              <input
                [type]="showPwd ? 'text' : 'password'"
                name="password"
                [(ngModel)]="password"
                required
                minlength="6"
                placeholder="Minimum 6 characters"
                #passwordInput="ngModel"
              />
              <span class="eye" (click)="showPwd = !showPwd">
                {{ showPwd ? '🙈' : '👁️' }}
              </span>
            </div>
            <div class="field-error" *ngIf="passwordInput.touched && passwordInput.invalid">
              Password must be at least 6 characters long
            </div>
          </div>

          <div class="error" *ngIf="error">{{ error }}</div>

          <button class="register-btn" type="submit" [disabled]="registerForm.invalid || loading">
            {{ loading ? 'Submitting Request...' : 'Submit Onboarding Request' }}
          </button>

          <div class="signin-link">
            Already have an account? <a routerLink="/login">Sign In</a>
          </div>
        </form>
      </div>

      <div class="register-card" *ngIf="isRegistered" style="max-width: 450px;">
        <div class="logo" style="font-size: 64px; margin-bottom: 20px;">⏳</div>
        <h1 style="color: #ff6b35; font-size: 24px; margin-bottom: 12px;">Onboarding Pending</h1>
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 24px; text-align: left;">
          Your request to onboard <strong>{{ orgName }}</strong> has been submitted.
          <br/><br/>
          It is currently pending approval by the platform administrator. 
          An email notification will be sent to <strong>{{ email }}</strong> once the status is updated.
        </p>
        <button class="register-btn" routerLink="/login">Back to Sign In</button>
      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; }

    .register-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #c0392b 100%);
      font-family: 'Outfit', 'Inter', Arial, sans-serif;
      padding: 40px 20px;
    }

    .register-card {
      background: white;
      width: 100%;
      max-width: 500px;
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

    .section-title {
      text-align: left;
      font-size: 14px;
      font-weight: 700;
      color: #c0392b;
      margin: 20px 0 10px;
      padding-bottom: 4px;
      border-bottom: 1px solid #eee;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group {
      text-align: left;
      margin-bottom: 16px;
      position: relative;
    }

    .form-group label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #555;
      margin-bottom: 6px;
    }

    .form-group input {
      width: 100%;
      padding: 10px 14px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .form-group input:focus {
      border-color: #c0392b;
    }

    .password-wrapper {
      position: relative;
    }

    .eye {
      position: absolute;
      right: 12px;
      top: 10px;
      cursor: pointer;
      font-size: 16px;
      user-select: none;
    }

    .field-error {
      color: #c0392b;
      font-size: 11px;
      margin-top: 4px;
    }

    .error {
      background: #fdecea;
      color: #c0392b;
      padding: 10px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
      text-align: left;
    }

    .register-btn {
      width: 100%;
      background: #c0392b;
      color: white;
      border: none;
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 10px;
      transition: background 0.2s;
    }

    .register-btn:hover {
      background: #a93226;
    }

    .register-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .signin-link {
      margin-top: 20px;
      font-size: 14px;
      color: #666;
    }

    .signin-link a {
      color: #c0392b;
      text-decoration: none;
      font-weight: 600;
    }

    .signin-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  orgName = '';
  outletName = '';
  outletAddress = '';
  fullName = '';
  email = '';
  password = '';
  selectedFile: File | null = null;

  error = '';
  loading = false;
  showPwd = false;
  isRegistered = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  register() {
    this.error = '';
    this.loading = true;

    const formData = new FormData();
    formData.append('organizationName', this.orgName);
    formData.append('outletName', this.outletName);
    formData.append('outletAddress', this.outletAddress);
    formData.append('fullName', this.fullName);
    formData.append('email', this.email);
    formData.append('password', this.password);
    if (this.selectedFile) {
      formData.append('logo', this.selectedFile);
    }

    this.auth.register(formData).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.success) {
          this.isRegistered = true;
        } else {
          this.error = response?.message || 'Registration failed';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || err.error?.errors?.[0] || 'Server error occurred';
      }
    });
  }
}
