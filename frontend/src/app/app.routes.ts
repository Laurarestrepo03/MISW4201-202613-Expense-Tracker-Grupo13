import { Routes } from '@angular/router';

/** 3 rutas lazy: Dashboard (solo lectura), Expenses e Incomes. Nada más. */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard-page.component').then(
        (m) => m.DashboardPageComponent,
      ),
  },
  {
    path: 'expenses',
    loadComponent: () =>
      import('./features/expenses/expenses-page.component').then((m) => m.ExpensesPageComponent),
  },
  {
    path: 'incomes',
    loadComponent: () =>
      import('./features/incomes/incomes-page.component').then((m) => m.IncomesPageComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
