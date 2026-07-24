import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { INCOME_FIELDS } from './income-fields';
import { IncomesService } from './incomes.service';
import { EntityColumn } from '../../shared/entity-table/entity-column';
import { ListPageComponent } from '../../shared/list-page/list-page.component';
import { ListPageTexts } from '../../shared/list-page/list-page-config';

const TEXTS: ListPageTexts = {
  heading: 'List of Incomes',
  subheading: 'Manage and track your income sources.',
  addLabel: 'Add Income',
  dialogTitle: 'Add an Income',
  submitLabel: 'Add Income',
  emptyMessage: 'You have not registered any incomes yet.',
};

// Remove rojo con deshabilitado, como en Expenses: normalización documentada (§3.2)
const COLUMNS: EntityColumn[] = [
  { key: 'source', header: 'Source', icon: 'work' },
  { key: 'amount', header: 'Amount ($)', align: 'right', format: 'currency', tone: 'success' },
];

/** Ruta /incomes: solo configura la ListPage compartida (EntityTable + Add/Remove). */
@Component({
  selector: 'app-incomes-page',
  imports: [ListPageComponent],
  template: `
    <app-list-page
      [texts]="texts"
      [columns]="columns"
      [fields]="fields"
      [store]="store"
      labelKey="source"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomesPageComponent {
  protected readonly texts = TEXTS;
  protected readonly columns = COLUMNS;
  protected readonly fields = INCOME_FIELDS;
  protected readonly store = inject(IncomesService);
}
