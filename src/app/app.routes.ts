import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register.component')
        .then(m => m.RegisterComponent)
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/shell/shell.component')
        .then(m => m.ShellComponent),

    children: [

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },

      {
        path: 'inventory',
        canActivate: [
          roleGuard([
            'super_admin',
            'store_manager',
            'kitchen_staff'
          ])
        ],
        loadComponent: () =>
          import('./features/inventory/inventory.component')
            .then(m => m.InventoryComponent)
      },

      {
        path: 'suppliers',
        canActivate: [
          roleGuard([
            'super_admin',
            'store_manager'
          ])
        ],
        loadComponent: () =>
          import('./features/suppliers/suppliers.component')
            .then(m => m.SuppliersComponent)
      },

      {
        path: 'purchases',
        canActivate: [
          roleGuard([
            'super_admin',
            'store_manager'
          ])
        ],
        loadComponent: () =>
          import('./features/purchases/purchases.component')
            .then(m => m.PurchasesComponent)
      },

      {
        path: 'recipes',
        canActivate: [
          roleGuard([
            'super_admin',
            'store_manager',
            'kitchen_staff'
          ])
        ],
        loadComponent: () =>
          import('./features/recipes/recipes.component')
            .then(m => m.RecipesComponent)
      },

      {
        path: 'categories',
        canActivate: [
          roleGuard([
            'super_admin',
            'store_manager'
          ])
        ],
        loadComponent: () =>
          import('./features/category/category.component')
            .then(m => m.CategoryComponent)
      },

      {
        path: 'sales',
        canActivate: [
          roleGuard([
            'super_admin',
            'store_manager'
          ])
        ],
        loadComponent: () =>
          import('./features/sales/sales.component')
            .then(m => m.SalesComponent)
      },

      {
        path: 'users',
        canActivate: [
          roleGuard([
            'super_admin',
            'power_admin'
          ])
        ],
        loadComponent: () =>
          import('./features/users/users.component')
            .then(m => m.UsersComponent)
      },
      {
        path: 'org-profile',
        canActivate: [
          roleGuard([
            'super_admin'
          ])
        ],
        loadComponent: () =>
          import('./features/org-profile/org-profile.component')
            .then(m => m.OrgProfileComponent)
      },

      {
        path: 'outlets',
        canActivate: [
          roleGuard([
            'super_admin',
            'power_admin'
          ])
        ],
        loadComponent: () =>
          import('./features/outlets/outlet.component')
            .then(m => m.OutletComponent)
      },

      {
        path: 'pl-report',
        canActivate: [
          roleGuard([
            'super_admin',
            'store_manager',
            'accountant'
          ])
        ],
        loadComponent: () =>
          import('./pages/pl-report/pl-report.component')
            .then(m => m.PLReportComponent)
      },

      {
        path: 'expenses',
        canActivate: [
          roleGuard([
            'super_admin',
            'store_manager',
            'accountant'
          ])
        ],
        loadComponent: () =>
          import('./features/expenses/expenses.component')
            .then(m => m.ExpensesComponent)
      },

      {
        path: 'approvals',
        canActivate: [
          roleGuard([
            'power_admin'
          ])
        ],
        loadComponent: () =>
          import('./features/approvals/approvals.component')
            .then(m => m.ApprovalsComponent)
      }

    ]
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
