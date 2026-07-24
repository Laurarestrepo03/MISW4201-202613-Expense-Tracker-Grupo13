import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';

import { EntityColumn, EntityRow } from './entity-column';

/**
 * Tabla genérica de listas (pieza anti-duplicación, ARQUITECTURA §5):
 * columnas configurables, multi-selección, zebra, fila seleccionada y
 * paginación en cliente. Expenses e Incomes la comparten tal cual.
 */
@Component({
  selector: 'app-entity-table',
  imports: [CurrencyPipe],
  templateUrl: './entity-table.component.html',
  styleUrl: './entity-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityTableComponent {
  readonly columns = input.required<EntityColumn[]>();
  readonly rows = input.required<readonly EntityRow[]>();
  readonly selectable = input(false);
  readonly pageSize = input(5);

  readonly selectionChange = output<string[]>();

  // Selección y página se reinician cuando cambia la lista; tras una mutación
  // el feature también limpia su copia, así ambos lados quedan consistentes.
  protected readonly selected = linkedSignal<readonly EntityRow[], ReadonlySet<string>>({
    source: this.rows,
    computation: () => new Set<string>(),
  });
  protected readonly page = linkedSignal<readonly EntityRow[], number>({
    source: this.rows,
    computation: () => 0,
  });

  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.rows().length / this.pageSize())),
  );

  protected readonly pagedRows = computed(() => {
    const start = this.page() * this.pageSize();
    return this.rows().slice(start, start + this.pageSize());
  });

  protected readonly rangeLabel = computed(() => {
    const total = this.rows().length;
    const start = total === 0 ? 0 : this.page() * this.pageSize() + 1;
    const end = Math.min((this.page() + 1) * this.pageSize(), total);
    return `Showing ${start} to ${end} of ${total} entries`;
  });

  protected readonly allSelected = computed(
    () => this.rows().length > 0 && this.selected().size === this.rows().length,
  );

  protected isSelected(id: string): boolean {
    return this.selected().has(id);
  }

  protected toggleRow(id: string): void {
    const next = new Set(this.selected());
    if (!next.delete(id)) {
      next.add(id);
    }
    this.updateSelection(next);
  }

  protected toggleAll(): void {
    const next = this.allSelected()
      ? new Set<string>()
      : new Set(this.rows().map((row) => row.id));
    this.updateSelection(next);
  }

  protected amount(row: EntityRow, key: string): number {
    return Number(row[key]);
  }

  protected text(row: EntityRow, key: string): string {
    const value = row[key];
    return value == null ? '' : String(value);
  }

  protected goTo(offset: number): void {
    const target = this.page() + offset;
    this.page.set(Math.min(Math.max(target, 0), this.pageCount() - 1));
  }

  private updateSelection(next: ReadonlySet<string>): void {
    this.selected.set(next);
    this.selectionChange.emit([...next]);
  }
}
