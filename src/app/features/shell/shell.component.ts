import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <div class="sidenav">
        <div class="brand">
          <span class="brand-icon">🍞</span>
          <div>
            <div class="brand-name">Pav Republic</div>
            <div class="brand-sub">Main Outlet · Bengaluru</div>
          </div>
        </div>
        <nav>
          <a routerLink="/dashboard" routerLinkActive="active">📊 Dashboard</a>
          <a routerLink="/inventory" routerLinkActive="active">📦 Inventory</a>
          <a routerLink="/suppliers" routerLinkActive="active">🚚 Suppliers</a>
          <a routerLink="/purchases" routerLinkActive="active">🛒 Purchases</a>
          <a routerLink="/recipes" routerLinkActive="active">📖 Recipes</a>
          <a routerLink="/sales" routerLinkActive="active">🧾 Sales</a>
           <a routerLink="/pl-report" routerLinkActive="active">📈 P&L Report</a>
        </nav>
        <div class="signout">
          <button (click)="logout()">Sign Out</button>
        </div>
      </div>
      <div class="main-content">
        <router-outlet />
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

.brand-icon{
  font-size:32px;
}

.brand-name{
  font-size:20px;
  font-weight:700;
}

.brand-sub{
  font-size:12px;
  color:rgba(255,255,255,.65);
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
  color:rgba(255,255,255,.85);
  padding:14px 16px;
  margin-bottom:8px;
  border-radius:12px;
  transition:.2s;
  font-size:15px;
}

nav a:hover{
  background:rgba(255,255,255,.08);
}

nav a.active{
  background:#ff6b00;
  color:white;
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
  background:rgba(255,255,255,.08);
  color:white;
  cursor:pointer;
}

.main-content{
  flex:1;
  overflow-y:auto;
  padding:32px;
  background:#f5f3ef;
}
`]
})
export class ShellComponent {
  constructor(
  private auth: AuthService,
  private router: Router
) {}
  logout() {
  this.auth.logout();
  this.router.navigate(['/login']);
}
}