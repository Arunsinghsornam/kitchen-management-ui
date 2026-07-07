import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

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

          <div>
            <div class="brand-name">{{ auth.getOrganizationName() }}</div>
            <div class="brand-sub">
              Welcome, {{ auth.getFullName() }}
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
`]
})
export class ShellComponent {

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

}
