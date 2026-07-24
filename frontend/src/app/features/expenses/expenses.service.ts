import { Injectable, inject } from '@angular/core';

import { ExpensesApiService } from '../../core/api/expenses-api.service';
import { ListStore } from '../../core/list-store';
import { Expense, ExpenseCreate } from '../../core/models/expense';

/** Estado del feature Expenses; toda la mecánica vive en core/ListStore. */
@Injectable({ providedIn: 'root' })
export class ExpensesService extends ListStore<Expense, ExpenseCreate> {
  protected readonly api = inject(ExpensesApiService);
}
