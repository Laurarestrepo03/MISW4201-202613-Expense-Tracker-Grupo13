import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { IncomesService } from './incomes.service';
import { Income } from '../../core/models/income';

describe('IncomesService (endpoints de income-service)', () => {
  let service: IncomesService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(IncomesService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('load() consulta GET /incomes', () => {
    const salary: Income = { id: '1', source: 'Salary', amount: 5000, date: '2026-07-01T00:00:00Z' };
    service.load();
    controller.expectOne({ method: 'GET', url: '/incomes' }).flush([salary]);
    expect(service.items()).toEqual([salary]);
  });

  it('add() hace POST /incomes con body SIN fecha y guarda la respuesta sellada', () => {
    service.add({ source: 'Freelance', amount: 2400 }).subscribe();
    const req = controller.expectOne({ method: 'POST', url: '/incomes' });
    expect(req.request.body).toEqual({ source: 'Freelance', amount: 2400 });
    const created: Income = {
      id: '9',
      source: 'Freelance',
      amount: 2400,
      date: '2026-07-24T18:00:00Z',
    };
    req.flush(created, { status: 201, statusText: 'Created' });
    expect(service.items()).toEqual([created]);
  });
});
