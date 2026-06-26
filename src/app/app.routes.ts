import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/shell/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./features/inventory/inventory.component').then(m => m.InventoryComponent)
      },
      {
        path: 'suppliers',
        loadComponent: () =>
          import('./features/suppliers/suppliers.component').then(m => m.SuppliersComponent)
      },
      {
        path: 'purchases',
        loadComponent: () =>
          import('./features/purchases/purchases.component').then(m => m.PurchasesComponent)
      },
      {
        path: 'recipes',
        loadComponent: () =>
          import('./features/recipes/recipes.component').then(m => m.RecipesComponent)
      },
      {
        path: 'sales',
        loadComponent: () =>
          import('./features/sales/sales.component').then(m => m.SalesComponent)
      },
      {
  path: 'pl-report',
  loadComponent: () =>
    import('./pages/pl-report/pl-report.component')
      .then(m => m.PLReportComponent),
}
    ]
  }
];