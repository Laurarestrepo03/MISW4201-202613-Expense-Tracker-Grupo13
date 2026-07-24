import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { ExpensesApiService } from '../../core/api/expenses-api.service';
import { IncomesApiService } from '../../core/api/incomes-api.service';
import { Expense } from '../../core/models/expense';
import { Income } from '../../core/models/income';
import { TotalOut } from '../../core/models/total';
import { TransactionItem } from '../../shared/transaction-list/transaction-item';

const RECENT_COUNT = 5;

interface DashboardData {
  incomeTotal: TotalOut;
  expenseTotal: TotalOut;
  incomes: Income[];
  expenses: Expense[];
}

/**
 * ÚNICA lógica de negocio permitida en el front (ARQUITECTURA §1): los
 * microservicios son independientes y no existe endpoint de dashboard, así
 * que aquí se compone balance = totalIncome − totalExpenses y se mezclan
 * las Recent Transactions de las dos listas. Nada más.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly incomesApi = inject(IncomesApiService);
  private readonly expensesApi = inject(ExpensesApiService);

  readonly loading = signal(false);
  readonly totalIncome = signal(0);
  readonly totalExpenses = signal(0);
  readonly balance = computed(() => this.totalIncome() - this.totalExpenses());
  readonly transactions = signal<TransactionItem[]>([]);

  /** Re-fetch de los totales al navegar al Dashboard (PARIDAD §2.2). */
  load(): void {
    this.loading.set(true);
    forkJoin({
      incomeTotal: this.incomesApi.total(),
      expenseTotal: this.expensesApi.total(),
      incomes: this.incomesApi.list(),
      expenses: this.expensesApi.list(),
    }).subscribe({
      next: (data) => this.apply(data),
      error: () => this.loading.set(false),
    });
  }

  private apply(data: DashboardData): void {
    this.totalIncome.set(data.incomeTotal.total);
    this.totalExpenses.set(data.expenseTotal.total);
    this.transactions.set(recentTransactions(data.incomes, data.expenses));
    this.loading.set(false);
  }
}

/** Mezcla ambas listas, ordena por fecha descendente y toma las últimas N (§8). */
function recentTransactions(incomes: Income[], expenses: Expense[]): TransactionItem[] {
  const merged: TransactionItem[] = [
    ...incomes.map((income) => asTransaction(income.id, income.source, income, 'income')),
    ...expenses.map((expense) => asTransaction(expense.id, expense.title, expense, 'expense')),
  ];
  return merged
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, RECENT_COUNT);
}

function asTransaction(
  id: string,
  title: string,
  source: { date: string; amount: number },
  kind: TransactionItem['kind'],
): TransactionItem {
  return { id: `${kind}-${id}`, title, date: source.date, amount: source.amount, kind };
}
