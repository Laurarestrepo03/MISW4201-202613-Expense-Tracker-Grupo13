import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

import { EntityRow } from '../entity-table/entity-column';

/**
 * Contrato que ListPage espera del servicio del feature (lo cumple
 * core/ListStore). El feature conserva la lógica; ListPage solo presenta.
 */
export interface ListPageStore {
  readonly items: Signal<readonly EntityRow[]>;
  readonly loading: Signal<boolean>;
  readonly mutating: Signal<boolean>;
  readonly fieldErrors: Signal<Record<string, string>>;
  load(): void;
  add(data: never): Observable<unknown>;
  removeMany(ids: string[]): Observable<unknown>;
}

/** Textos de la vista de lista (inglés, exactamente como el mock). */
export interface ListPageTexts {
  heading: string;
  subheading: string;
  addLabel: string;
  dialogTitle: string;
  submitLabel: string;
  emptyMessage: string;
}
