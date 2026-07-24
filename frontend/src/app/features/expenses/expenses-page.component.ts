import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { EXPENSE_FIELDS } from './expense-fields';
import { ExpensesService } from './expenses.service';
import { EntityColumn } from '../../shared/entity-table/entity-column';
import { ListPageComponent } from '../../shared/list-page/list-page.component';
import { ListPageTexts } from '../../shared/list-page/list-page-config';

const TEXTS: ListPageTexts = {
  heading: 'List of Expenses',
  subheading: 'Manage and track your recurring and one-time expenses.',
  addLabel: 'Add',
  dialogTitle: 'Add an Expense',
  submitLabel: 'Add Expense',
  emptyMessage: 'You have not registered any expenses yet.',
};

const COLUMNS: EntityColumn[] = [
  { key: 'title', header: 'Title' },
  { key: 'amount', header: 'Amount ($)', align: 'right', format: 'currency' },
  { key: 'date', header: 'Date', secondary: true },
  { key: 'note', header: 'Notes', secondary: true },
];

/** Ruta /expenses: solo configura la ListPage compartida (EntityTable + Add/Remove). */
@Component({
  selector: 'app-expenses-page',
  imports: [ListPageComponent],
  template: `
    <app-list-page
      [texts]="texts"
      [columns]="columns"
      [fields]="fields"
      [store]="store"
      labelKey="title"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensesPageComponent {
  protected readonly texts = TEXTS;
  protected readonly columns = COLUMNS;
  protected readonly fields = EXPENSE_FIELDS;
  protected readonly store = inject(ExpensesService);
}
