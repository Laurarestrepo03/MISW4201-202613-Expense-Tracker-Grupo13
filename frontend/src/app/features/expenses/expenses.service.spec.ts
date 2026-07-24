import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ExpensesService } from './expenses.service';
import { Expense } from '../../core/models/expense';

const RENT: Expense = { id: '1', title: 'Rent', amount: 1200, date: '2026-07-01', note: '' };
const GYM: Expense = { id: '2', title: 'Gym', amount: 30, date: '2026-07-02', note: 'monthly' };

describe('ExpensesService (ListStore + CrudApi)', () => {
  let service: ExpensesService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ExpensesService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('load(): GET /expenses puebla items y apaga loading', () => {
    service.load();
    expect(service.loading()).toBe(true);
    controller.expectOne({ method: 'GET', url: '/expenses' }).flush([RENT]);
    expect(service.items()).toEqual([RENT]);
    expect(service.loading()).toBe(false);
  });

  it('add(): POST /expenses, agrega la respuesta al estado local sin re-fetch', () => {
    service.add({ title: 'Rent', amount: 1200, date: '2026-07-01' }).subscribe();
    expect(service.mutating()).toBe(true);
    const req = controller.expectOne({ method: 'POST', url: '/expenses' });
    expect(req.request.body).toEqual({ title: 'Rent', amount: 1200, date: '2026-07-01' });
    req.flush(RENT, { status: 201, statusText: 'Created' });
    expect(service.items()).toEqual([RENT]);
    expect(service.mutating()).toBe(false);
  });

  it('add(): un 422 llena fieldErrors con el detail de Pydantic', () => {
    service.add({ title: 'x'.repeat(201), amount: 1, date: '2026-07-01' }).subscribe({
      error: () => undefined,
    });
    controller.expectOne({ method: 'POST', url: '/expenses' }).flush(
      {
        detail: [
          { loc: ['body', 'title'], msg: 'String should have at most 200 characters' },
        ],
      },
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    expect(service.fieldErrors()).toEqual({
      title: 'String should have at most 200 characters',
    });
    expect(service.mutating()).toBe(false);
  });

  it('removeMany(): N DELETE en paralelo y filtra los eliminados del estado', () => {
    service.load();
    controller.expectOne({ method: 'GET', url: '/expenses' }).flush([RENT, GYM]);
    service.removeMany(['1', '2']).subscribe();
    controller.expectOne({ method: 'DELETE', url: '/expenses/1' }).flush(RENT);
    controller.expectOne({ method: 'DELETE', url: '/expenses/2' }).flush(GYM);
    expect(service.items()).toEqual([]);
    expect(service.mutating()).toBe(false);
  });
});
