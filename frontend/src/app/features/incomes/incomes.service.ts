import { Injectable, inject } from '@angular/core';

import { IncomesApiService } from '../../core/api/incomes-api.service';
import { ListStore } from '../../core/list-store';
import { Income, IncomeCreate } from '../../core/models/income';

/** Estado del feature Incomes; toda la mecánica vive en core/ListStore. */
@Injectable({ providedIn: 'root' })
export class IncomesService extends ListStore<Income, IncomeCreate> {
  protected readonly api = inject(IncomesApiService);
}
