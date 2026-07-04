import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

export interface OnboardingRequest {
  id: string;
  name: string;
  status: string;
  logoUrl?: string;
  createdAt: string;
  ownerName: string;
  ownerEmail: string;
  outletName: string;
}

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="approvals-container">
      <div class="page-header">
        <div>
          <h1>Onboarding Approvals</h1>
          <p>Review, approve, or reject new organization registration requests</p>
        </div>
      </div>

      <div class="requests-card">
        <div class="card-header">
          <h2>Pending & Onboarded Businesses</h2>
          <span class="badge-total">{{ requests.length }} Total</span>
        </div>

        <div class="table-responsive" *ngIf="requests.length > 0; else noRequests">
          <table class="requests-table">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Organization</th>
                <th>Owner Details</th>
                <th>Outlet Details</th>
                <th>Requested Date</th>
                <th>Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let req of requests" [class.row-pending]="req.status === 'Pending'">
                <td>
                  <div class="logo-preview-box">
                    <img *ngIf="req.logoUrl; else noLogo" [src]="getAbsoluteLogoUrl(req.logoUrl)" class="logo-thumbnail" />
                    <ng-template #noLogo><span class="logo-placeholder">🍞</span></ng-template>
                  </div>
                </td>
                <td>
                  <div class="org-name-cell">{{ req.name }}</div>
                </td>
                <td>
                  <div class="owner-name">{{ req.ownerName }}</div>
                  <div class="owner-email">{{ req.ownerEmail }}</div>
                </td>
                <td>
                  <div class="outlet-name">{{ req.outletName }}</div>
                </td>
                <td>
                  {{ req.createdAt | date:'mediumDate' }}
                </td>
                <td>
                  <span class="status-badge" [ngClass]="req.status.toLowerCase()">
                    {{ req.status }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="action-buttons" *ngIf="req.status === 'Pending'">
                    <button class="btn-approve" (click)="approve(req)">Approve</button>
                    <button class="btn-reject" (click)="reject(req)">Reject</button>
                  </div>
                  <span class="action-done" *ngIf="req.status !== 'Pending'">
                    Closed
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #noRequests>
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>No Onboarding Requests</h3>
            <p>There are no registration onboarding requests currently registered in the database.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .approvals-container {
      padding: 30px;
      font-family: 'Outfit', 'Inter', Arial, sans-serif;
    }

    .page-header {
      margin-bottom: 30px;
    }

    .page-header h1 {
      margin: 0 0 6px 0;
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .page-header p {
      margin: 0;
      color: #777;
      font-size: 15px;
    }

    .requests-card {
      background: white;
      border-radius: 16px;
      border: 1px solid #ececec;
      box-shadow: 0 10px 30px rgba(0,0,0,0.03);
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 30px;
      border-bottom: 1px solid #f5f5f5;
    }

    .card-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1a1a2e;
    }

    .badge-total {
      background: #f5f3ef;
      color: #5a1b11;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 20px;
    }

    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }

    .requests-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .requests-table th {
      padding: 18px 30px;
      font-size: 13px;
      font-weight: 600;
      color: #888;
      background: #fafafa;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .requests-table td {
      padding: 16px 30px;
      border-bottom: 1px solid #f5f5f5;
      font-size: 14px;
      color: #333;
      vertical-align: middle;
    }

    .row-pending {
      background-color: #fffdfb;
    }

    .logo-preview-box {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      overflow: hidden;
      background: #fdfdfd;
      border: 1px solid #ececec;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-thumbnail {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .logo-placeholder {
      font-size: 24px;
    }

    .org-name-cell {
      font-weight: 600;
      color: #1a1a2e;
    }

    .owner-name {
      font-weight: 500;
      color: #333;
    }

    .owner-email {
      font-size: 12px;
      color: #888;
    }

    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 700;
      border-radius: 20px;
      text-transform: uppercase;
    }

    .status-badge.pending {
      background: #fef5e7;
      color: #e67e22;
    }

    .status-badge.approved {
      background: #eafaf1;
      color: #2ecc71;
    }

    .status-badge.rejected {
      background: #fdeaea;
      color: #c0392b;
    }

    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .btn-approve {
      background: #2ecc71;
      color: white;
      border: none;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-approve:hover {
      background: #27ae60;
    }

    .btn-reject {
      background: #c0392b;
      color: white;
      border: none;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-reject:hover {
      background: #962d22;
    }

    .action-done {
      font-size: 13px;
      color: #aaa;
      font-weight: 500;
      font-style: italic;
    }

    .empty-state {
      padding: 80px 30px;
      text-align: center;
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      margin: 0 0 10px 0;
      color: #1a1a2e;
      font-size: 20px;
      font-weight: 600;
    }

    .empty-state p {
      margin: 0;
      color: #777;
      font-size: 14px;
    }
  `]
})
export class ApprovalsComponent implements OnInit {
  private http = inject(HttpClient);
  public auth = inject(AuthService);

  requests: OnboardingRequest[] = [];

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.http.get<any>(`${environment.apiUrl}/api/organizations`).subscribe({
      next: (res) => {
        if (res.success) {
          this.requests = res.data;
        }
      },
      error: (err) => console.error('Error loading onboarding requests:', err)
    });
  }

  getAbsoluteLogoUrl(logoUrl: string): string {
    if (logoUrl.startsWith('/')) {
      return `${environment.apiUrl}${logoUrl}`;
    }
    return logoUrl;
  }

  approve(req: OnboardingRequest): void {
    if (!confirm(`Are you sure you want to APPROVE ${req.name}?`)) return;

    this.http.post<any>(`${environment.apiUrl}/api/organizations/${req.id}/approve`, {}).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Organization approved successfully!');
          this.loadRequests();
        }
      },
      error: (err) => alert(err.error?.message || 'Approval failed')
    });
  }

  reject(req: OnboardingRequest): void {
    if (!confirm(`Are you sure you want to REJECT ${req.name}?`)) return;

    this.http.post<any>(`${environment.apiUrl}/api/organizations/${req.id}/reject`, {}).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Organization rejected.');
          this.loadRequests();
        }
      },
      error: (err) => alert(err.error?.message || 'Rejection failed')
    });
  }
}
