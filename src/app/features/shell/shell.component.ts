import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService, NotificationAlert } from '../../services/notification.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  template: `
    <div class="shell">

      <div class="sidenav">

        <div class="brand" [routerLink]="auth.isSuperAdmin() ? '/org-profile' : null" [class.clickable]="auth.isSuperAdmin()">
          <div class="brand-logo-box" style="width: 36px; height: 36px; border-radius: 8px; overflow: hidden; background: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <img *ngIf="auth.getLogoUrl()" [src]="auth.getLogoUrl()" style="width: 100%; height: 100%; object-fit: cover;" />
            <span *ngIf="!auth.getLogoUrl()" class="brand-icon" style="font-size: 24px;">🍞</span>
          </div>

          <div style="flex-grow: 1; display: flex; flex-direction: column;">
            <div class="brand-name">{{ auth.getOrganizationName() }}</div>
            <div class="brand-sub" style="display: flex; align-items: center; justify-content: space-between; gap: 8px; position: relative;">
              <span>Welcome, {{ auth.getFullName() }}</span>
              
              <!-- Bell Icon inside Brand Header -->
              <div *ngIf="auth.isSuperAdmin() || auth.isPowerAdmin()" 
                   (click)="toggleNotifications($event)" 
                   class="bell-btn" 
                   style="position: relative; cursor: pointer; padding: 2px; font-size: 16px; transition: transform 0.2s;">
                🔔
                <span *ngIf="unreadCount > 0" 
                      style="position: absolute; top: -6px; right: -6px; background: #e02424; color: white; border-radius: 9999px; padding: 1px 5px; font-size: 9px; font-weight: 800; line-height: 1;">
                  {{ unreadCount }}
                </span>
              </div>

              <!-- Notification Overlay Dropdown -->
              <div *ngIf="showNotifications" 
                   class="notif-dropdown"
                   (click)="$event.stopPropagation()">
                <div class="notif-header">
                  <span class="notif-title">Recent Activity Alerts</span>
                  <button class="notif-clear-btn" *ngIf="unreadCount > 0" (click)="markAllAsRead()">Mark all read</button>
                </div>
                
                <div class="notif-list">
                  <div *ngIf="notifications.length === 0" class="notif-empty">
                    No recent activity alerts.
                  </div>
                  
                  <div *ngFor="let n of notifications" 
                       class="notif-item" 
                       [class.unread]="!n.isRead">
                    <div class="notif-meta">
                      <span class="notif-user">{{ n.userFullName }} ({{ n.userRole }})</span>
                      <span class="notif-outlet">📍 {{ n.outletName }}</span>
                    </div>
                    <div class="notif-message">{{ n.message }}</div>
                    <div class="notif-time">{{ timeAgo(n.createdAt) }}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <nav>

          <!-- Everyone -->
          <a routerLink="/dashboard" routerLinkActive="active">
            📊 Dashboard
          </a>

          <!-- Inventory -->
          <a
            *ngIf="auth.isPowerAdmin() || auth.isSuperAdmin() || auth.isStoreManager() || auth.isKitchenStaff()"
            routerLink="/inventory"
            routerLinkActive="active">
            📦 Inventory
          </a>

          <!-- Suppliers -->
          <a
            *ngIf="auth.isPowerAdmin() || auth.isSuperAdmin() || auth.isStoreManager()"
            routerLink="/suppliers"
            routerLinkActive="active">
            🚚 Suppliers
          </a>

          <!-- Purchases -->
          <a
            *ngIf="auth.isPowerAdmin() || auth.isSuperAdmin() || auth.isStoreManager()"
            routerLink="/purchases"
            routerLinkActive="active">
            🛒 Purchases
          </a>

          <!-- Recipes -->
          <a
            *ngIf="auth.isPowerAdmin() || auth.isSuperAdmin() || auth.isStoreManager() || auth.isKitchenStaff()"
            routerLink="/recipes"
            routerLinkActive="active">
            📖 Recipes
          </a>

          <!-- Sales -->
          <a
            *ngIf="auth.isPowerAdmin() || auth.isSuperAdmin() || auth.isStoreManager()"
            routerLink="/sales"
            routerLinkActive="active">
            🧾 Sales
          </a>
  <!-- Outlets -->
<a
  *ngIf="auth.isPowerAdmin() || auth.isSuperAdmin()"
  routerLink="/outlets"
  routerLinkActive="active">
  🏢 Outlets
</a>

<!-- Categories -->
<a
  *ngIf="auth.isPowerAdmin() || auth.isSuperAdmin() || auth.isStoreManager()"
  routerLink="/categories"
  routerLinkActive="active">
  📂 Categories
</a>

<!-- User Management -->
<a
  *ngIf="auth.isPowerAdmin() || auth.isSuperAdmin()"
  routerLink="/users"
  routerLinkActive="active">
  👥 User Management
</a>

          <!-- P&L -->
          <a
            *ngIf="auth.isPowerAdmin() || auth.isSuperAdmin() || auth.isStoreManager() || auth.isAccountant()"
            routerLink="/pl-report"
            routerLinkActive="active">
            📈 P&L Report
          </a>

          <!-- Expenses -->
          <a
            *ngIf="auth.isPowerAdmin() || auth.isSuperAdmin() || auth.isStoreManager() || auth.isAccountant()"
            routerLink="/expenses"
            routerLinkActive="active">
            💸 Expenses
          </a>

          <!-- Reports -->
          <a
            *ngIf="auth.isPowerAdmin() || auth.isSuperAdmin() || auth.isStoreManager() || auth.isAccountant()"
            routerLink="/reports"
            routerLinkActive="active">
            📋 Reports
          </a>

          <!-- Approvals (Power Admin Only) -->
          <a
            *ngIf="auth.isPowerAdmin()"
            routerLink="/approvals"
            routerLinkActive="active">
            ⏳ Approvals
          </a>

        </nav>

        <div class="signout">
          <button (click)="logout()">Sign Out</button>
        </div>

      </div>

      <div class="main-content">
        <router-outlet></router-outlet>
      </div>

    </div>
  `,
  styles: [`
.shell{
  display:flex;
  height:100vh;
  background:#f5f3ef;
}

.sidenav{
  width:260px;
  background:linear-gradient(180deg,#5a1b11 0%, #3d100a 100%);
  color:white;
  display:flex;
  flex-direction:column;
  flex-shrink:0;
}

.brand{
  display:flex;
  align-items:center;
  gap:12px;
  padding:24px 20px;
  border-bottom:1px solid rgba(255,255,255,.08);
}

.brand.clickable {
  cursor: pointer;
  transition: background-color 0.2s, opacity 0.2s;
}

.brand.clickable:hover {
  background-color: rgba(255, 255, 255, 0.05);
  opacity: 0.95;
}

.brand-icon{
  font-size:32px;
}

.brand-name{
  font-size:20px;
  font-weight:700;
}

.brand-sub{
  font-size:12px;
  color:rgba(255,255,255,.7);
}

nav{
  flex:1;
  padding:16px 12px;
}

nav a{
  display:flex;
  align-items:center;
  gap:10px;
  text-decoration:none;
  color:white;
  padding:14px 16px;
  margin-bottom:8px;
  border-radius:12px;
  transition:.2s;
}

nav a:hover{
  background:rgba(255,255,255,.08);
}

nav a.active{
  background:#ff6b00;
}

.signout{
  padding:20px;
  border-top:1px solid rgba(255,255,255,.08);
}

.signout button{
  width:100%;
  height:48px;
  border:none;
  border-radius:12px;
  cursor:pointer;
  background:rgba(255,255,255,.08);
  color:white;
}

.main-content{
  flex:1;
  overflow:auto;
  padding:32px;
}

.bell-btn:hover {
  transform: scale(1.15);
}

.notif-dropdown {
  position: absolute;
  top: 35px;
  left: 235px;
  width: 380px;
  max-height: 500px;
  background: white;
  color: #1a1a1a;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  border: 1px solid #e2e8f0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: inherit;
  text-align: left;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #edf2f7;
}

.notif-title {
  font-size: 15px;
  font-weight: 700;
  color: #2d3748;
}

.notif-clear-btn {
  background: transparent;
  border: none;
  color: #dd6b20;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s;
}

.notif-clear-btn:hover {
  color: #c05621;
}

.notif-list {
  overflow-y: auto;
  flex: 1;
  max-height: 440px;
}

.notif-empty {
  padding: 32px 16px;
  text-align: center;
  color: #718096;
  font-size: 14px;
}

.notif-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f7fafc;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: background 0.15s;
}

.notif-item:hover {
  background: #f7fafc;
}

.notif-item.unread {
  background: #fffaf0;
  border-left: 4px solid #dd6b20;
}

.notif-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.notif-user {
  font-weight: 700;
  color: #2d3748;
}

.notif-outlet {
  color: #4a5568;
  font-weight: 500;
}

.notif-message {
  font-size: 13px;
  color: #2d3748;
  line-height: 1.45;
  word-break: break-word;
}

.notif-time {
  font-size: 11px;
  color: #718096;
  text-align: right;
  margin-top: 2px;
}
`]
})
export class ShellComponent implements OnInit, OnDestroy {
  showNotifications = false;
  notifications: NotificationAlert[] = [];
  unreadCount = 0;
  private pollInterval: any;

  constructor(
    public auth: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    if (this.auth.isSuperAdmin() || this.auth.isPowerAdmin()) {
      this.loadNotifications();
      this.pollInterval = setInterval(() => this.loadNotifications(), 15000);
    }
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  loadNotifications() {
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.unreadCount = data.filter(n => !n.isRead).length;
      },
      error: (err) => console.error('Error loading notifications:', err)
    });
  }

  toggleNotifications(event: MouseEvent) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications && this.unreadCount > 0) {
      this.markAllAsRead();
    }
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.unreadCount = 0;
        this.notifications.forEach(n => n.isRead = true);
      },
      error: (err) => console.error('Error marking notifications as read:', err)
    });
  }

  timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick() {
    this.showNotifications = false;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
