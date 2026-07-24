import { Injectable } from '@angular/core';

import { CrudApiService } from './crud-api.service';
import { Expense, ExpenseCreate } from '../models/expense';

/** expense-service (dev :8002 vía proxy; prod API Gateway del environment). */
@Injectable({ providedIn: 'root' })
export class ExpensesApiService extends CrudApiService<Expense, ExpenseCreate> {
  protected readonly resource = '/expenses';
}
