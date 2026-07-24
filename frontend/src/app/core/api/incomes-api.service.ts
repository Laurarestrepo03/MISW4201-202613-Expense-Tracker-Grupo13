import { Injectable } from '@angular/core';

import { CrudApiService } from './crud-api.service';
import { Income, IncomeCreate } from '../models/income';

/** income-service (dev :8001 vía proxy; prod API Gateway del environment). */
@Injectable({ providedIn: 'root' })
export class IncomesApiService extends CrudApiService<Income, IncomeCreate> {
  protected readonly resource = '/incomes';
}
