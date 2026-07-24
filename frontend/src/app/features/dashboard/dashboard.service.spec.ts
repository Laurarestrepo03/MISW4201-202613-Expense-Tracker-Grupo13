import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DashboardService } from './dashboard.service';

describe('DashboardService (única lógica permitida en el front)', () => {
  let service: DashboardService;
  let controller: HttpTestingController;

  const flushAll = (over?: { incomes?: unknown[]; expenses?: unknown[] }) => {
    controller.expectOne('/incomes/total').flush({ total: 8000 });
    controller.expectOne('/expenses/total').flush({ total: 3000 });
    controller.expectOne('/incomes').flush(over?.incomes ?? []);
    controller.expectOne('/expenses').flush(over?.expenses ?? []);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DashboardService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('compone balance = totalIncome − totalExpenses desde los dos /total', () => {
    service.load();
    expect(service.loading()).toBe(true);
    flushAll();
    expect(service.totalIncome()).toBe(8000);
    expect(service.totalExpenses()).toBe(3000);
    expect(service.balance()).toBe(5000);
    expect(service.loading()).toBe(false);
  });

  it('mezcla incomes+expenses, ordena por fecha desc y limita a 5', () => {
    service.load();
    flushAll({
      incomes: [
        { id: '1', source: 'Salary', amount: 5000, date: '2026-07-20T09:00:00Z' },
        { id: '2', source: 'Freelance', amount: 800, date: '2026-07-01T09:00:00Z' },
      ],
      expenses: [
        { id: '3', title: 'Rent', amount: 1200, date: '2026-07-22', note: '' },
        { id: '4', title: 'Gas', amount: 45, date: '2026-07-10', note: '' },
        { id: '5', title: 'Gym', amount: 30, date: '2026-07-05', note: '' },
        { id: '6', title: 'Coffee', amount: 6, date: '2026-06-01', note: '' },
      ],
    });
    const transactions = service.transactions();
    expect(transactions.length).toBe(5);
    expect(transactions.map((t) => t.title)).toEqual(['Rent', 'Salary', 'Gas', 'Gym', 'Freelance']);
    expect(transactions[0].kind).toBe('expense');
    expect(transactions[1].kind).toBe('income');
  });

  it('apaga loading si alguna petición falla y cancela las demás (forkJoin)', () => {
    service.load();
    controller.expectOne('/incomes/total').flush('boom', { status: 500, statusText: 'Error' });
    const pending = controller.match(() => true);
    pending.forEach((request) => expect(request.cancelled).toBe(true));
    expect(service.loading()).toBe(false);
    expect(service.balance()).toBe(0);
  });
});
