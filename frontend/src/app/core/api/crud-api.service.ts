import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TotalOut } from '../models/total';

/**
 * CRUD común contra un recurso del contrato (§8). Los dos microservicios
 * exponen endpoints espejo; esta base existe UNA vez y cada servicio de
 * core/api/ solo declara su recurso (0 duplicación en el front).
 */
export abstract class CrudApiService<TOut, TCreate> {
  protected abstract readonly resource: string;
  private readonly http = inject(HttpClient);

  list(): Observable<TOut[]> {
    return this.http.get<TOut[]>(this.resource);
  }

  create(data: TCreate): Observable<TOut> {
    return this.http.post<TOut>(this.resource, data);
  }

  total(): Observable<TotalOut> {
    return this.http.get<TotalOut>(`${this.resource}/total`);
  }

  /** DELETE devuelve el objeto eliminado (200, no 204) — contrato real §8. */
  remove(id: string): Observable<TOut> {
    return this.http.delete<TOut>(`${this.resource}/${id}`);
  }
}
