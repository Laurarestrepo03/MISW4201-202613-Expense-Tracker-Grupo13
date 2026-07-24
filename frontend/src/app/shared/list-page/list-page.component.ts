import { ChangeDetectionStrategy, Component, OnInit, computed, input, signal } from '@angular/core';

import { confirmRemovalLines } from './confirm-removal-lines';
import { ListPageStore, ListPageTexts } from './list-page-config';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { EntityColumn } from '../entity-table/entity-column';
import { EntityTableComponent } from '../entity-table/entity-table.component';
import { DialogField } from '../form-dialog/dialog-field';
import { FormDialogComponent } from '../form-dialog/form-dialog.component';

/**
 * Vista de lista completa (título + Add/Remove + tabla + diálogos + estados).
 * Existe UNA vez: Expenses e Incomes solo aportan textos, columnas, campos
 * y su servicio — el patrón duplicado del legado no se reedita.
 */
@Component({
  selector: 'app-list-page',
  imports: [
    EntityTableComponent,
    FormDialogComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
  ],
  templateUrl: './list-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListPageComponent implements OnInit {
  readonly texts = input.required<ListPageTexts>();
  readonly columns = input.required<EntityColumn[]>();
  readonly fields = input.required<DialogField[]>();
  readonly store = input.required<ListPageStore>();
  /** Campo usado en las líneas de confirmación (title/source). */
  readonly labelKey = input.required<string>();

  protected readonly selection = signal<string[]>([]);
  protected readonly adding = signal(false);
  protected readonly confirming = signal(false);

  protected readonly confirmLines = computed(() =>
    confirmRemovalLines(this.store().items(), this.selection(), this.labelKey()),
  );

  ngOnInit(): void {
    this.store().load();
  }

  protected submit(value: Record<string, unknown>): void {
    this.store()
      .add(value as never)
      .subscribe({
        next: () => this.adding.set(false),
        error: () => undefined,
      });
  }

  protected remove(): void {
    this.store()
      .removeMany(this.selection())
      .subscribe({
        next: () => {
          this.confirming.set(false);
          this.selection.set([]);
        },
        error: () => this.confirming.set(false),
      });
  }
}
