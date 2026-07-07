import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-org-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <div class="page-header">
        <h1>Organization Profile</h1>
        <p>Manage your organization details and brand identity</p>
      </div>

      <div class="content-grid" *ngIf="org">
        <!-- Profile Card -->
        <div class="card profile-info-card">
          <div class="logo-preview-container">
            <img [src]="logoPreview || getOrgLogo()" alt="Organization Logo" class="org-logo-preview" />
          </div>
          
          <div class="org-status-badge" [ngClass]="org.status.toLowerCase()">
            {{ org.status }}
          </div>

          <h2 class="org-name-title">{{ org.name }}</h2>
          <p class="org-meta">Registered on: {{ org.createdAt | date:'mediumDate' }}</p>
        </div>

        <!-- Form Card -->
        <div class="card profile-form-card">
          <h2>Edit Details</h2>
          <form (ngSubmit)="saveProfile()" #profileForm="ngForm">
            <div class="form-group">
              <label>Organization Name</label>
              <input
                type="text"
                name="orgName"
                [value]="org.name"
                disabled
                style="background: #f1f1f1; cursor: not-allowed;"
              />
              <span class="locked-text" style="font-size: 12px; color: #888; margin-top: 4px; display: block;">🔒 Organization name is registered and cannot be modified.</span>
            </div>

            <div class="form-group">
              <label>Upload New Logo</label>
              <div class="file-dropzone">
                <input
                  type="file"
                  (change)="onFileSelected($event)"
                  accept="image/*"
                  id="logo-upload-input"
                />
                <div class="dropzone-text">
                  <span>📸 Click to select a new logo image</span>
                  <small>PNG, JPG or GIF (max. 2MB)</small>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" [disabled]="!selectedLogo || saving" class="btn-save">
                {{ saving ? 'Saving Changes...' : 'Save Profile' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 32px;
      background: #f7f4ef;
      min-height: 100vh;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 42px;
      font-weight: 700;
      color: #1a1a1a;
    }

    .page-header p {
      color: #777;
      margin-top: 8px;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 32px;
    }

    .card {
      background: white;
      border-radius: 20px;
      padding: 32px;
      border: 1px solid #ececec;
      box-shadow: 0 4px 16px rgba(0,0,0,.03);
    }

    .profile-info-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .logo-preview-container {
      width: 150px;
      height: 150px;
      border-radius: 24px;
      overflow: hidden;
      background: #fcfcfc;
      border: 1px solid #eaeaea;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
    }

    .org-logo-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .org-status-badge {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 6px 14px;
      border-radius: 20px;
      margin-bottom: 16px;
    }

    .org-status-badge.approved {
      background: #e8f6ea;
      color: #2e7d32;
    }

    .org-status-badge.pending {
      background: #fff2e7;
      color: #ef6c00;
    }

    .org-name-title {
      font-size: 24px;
      font-weight: 700;
      margin: 8px 0;
    }

    .org-meta {
      color: #888;
      font-size: 14px;
      margin: 0;
    }

    .profile-form-card h2 {
      margin-top: 0;
      margin-bottom: 24px;
      font-size: 20px;
      font-weight: 700;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 8px;
      color: #444;
    }

    .form-group input[type="text"] {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #ddd;
      border-radius: 12px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .form-group input[type="text"]:focus {
      border-color: #ff6b35;
    }

    .file-dropzone {
      position: relative;
      border: 2px dashed #ff6b35;
      background: #fffcf8;
      border-radius: 16px;
      padding: 24px;
      text-align: center;
      cursor: pointer;
      transition: background 0.2s;
    }

    .file-dropzone:hover {
      background: #fff8ee;
    }

    .file-dropzone input[type="file"] {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }

    .dropzone-text {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .dropzone-text span {
      font-weight: 600;
      color: #ff6b35;
    }

    .dropzone-text small {
      color: #888;
    }

    .field-error {
      color: #d32f2f;
      font-size: 12px;
      margin-top: 6px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 32px;
    }

    .btn-save {
      background: #ff6b35;
      color: white;
      border: none;
      padding: 12px 32px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-save:hover:not(:disabled) {
      background: #e55a2b;
    }

    .btn-save:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 992px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OrgProfileComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  org: any = null;
  editName = '';
  selectedLogo: File | null = null;
  logoPreview: string | null = null;
  saving = false;

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.http.get<any>(`${environment.apiUrl}/api/organizations/profile`).subscribe({
      next: (res) => {
        if (res.success) {
          this.org = res.data;
          this.editName = this.org.name;
        }
      },
      error: (err) => {
        console.error('Error loading organization profile:', err);
      }
    });
  }

  getOrgLogo(): string {
    if (!this.org?.logoUrl) return 'assets/placeholder-logo.png';
    if (this.org.logoUrl.startsWith('/')) {
      return `${environment.apiUrl}${this.org.logoUrl}`;
    }
    return this.org.logoUrl;
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedLogo = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile(): void {
    if (!this.selectedLogo) return;

    this.saving = true;
    const formData = new FormData();
    formData.append('logo', this.selectedLogo);

    this.http.put<any>(`${environment.apiUrl}/api/organizations/profile`, formData).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.success) {
          alert('Organization profile updated successfully.');
          this.org = res.data;
          this.selectedLogo = null;
          this.logoPreview = null;

          // Update localStorage user details to update sidebar header immediately
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userObj = JSON.parse(storedUser);
            userObj.organizationName = res.data.name;
            userObj.logoUrl = res.data.logoUrl;
            localStorage.setItem('user', JSON.stringify(userObj));
          }
        }
      },
      error: (err) => {
        this.saving = false;
        alert(err.error?.message || 'Failed to update organization profile.');
        console.error('Error updating organization profile:', err);
      }
    });
  }
}
