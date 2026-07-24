import { signal } from '@angular/core';
import { Observable, catchError, finalize, forkJoin, tap, throwError } from 'rxjs';

import { CrudApiService } from './api/crud-api.service';
import { fieldErrorsFrom } from './api/validation-errors';

/**
 * Estado de un feature de lista (signals): items, cargando, mutación en
 * vuelo y errores 422 por campo. Existe UNA vez; Expenses e Incomes solo
 * declaran su API — el patrón ExpensesPanel/IncomePanel del legado no se repite.
 * Tras cada mutación el estado local se actualiza con la respuesta del API
 * (sin re-fetch: no estorba la prueba de carga).
 */
export abstract class ListStore<TOut extends { id: string }, TCreate> {
  protected abstract readonly api: CrudApiService<TOut, TCreate>;

  readonly items = signal<readonly TOut[]>([]);
  readonly loading = signal(false);
  readonly mutating = signal(false);
  readonly fieldErrors = signal<Record<string, string>>({});

  load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  add(data: TCreate): Observable<TOut> {
    this.mutating.set(true);
    this.fieldErrors.set({});
    return this.api.create(data).pipe(
      tap((created) => this.items.update((items) => [...items, created])),
      catchError((error: unknown) => {
        this.fieldErrors.set(fieldErrorsFrom(error));
        return throwError(() => error);
      }),
      finalize(() => this.mutating.set(false)),
    );
  }

  /** N DELETE individuales en paralelo tras una única confirmación (§8). */
  removeMany(ids: string[]): Observable<TOut[]> {
    this.mutating.set(true);
    return forkJoin(ids.map((id) => this.api.remove(id))).pipe(
      tap((removed) => {
        const gone = new Set(removed.map((item) => item.id));
        this.items.update((items) => items.filter((item) => !gone.has(item.id)));
      }),
      finalize(() => this.mutating.set(false)),
    );
  }
}
