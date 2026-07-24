import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { baseUrlInterceptor } from './base-url.interceptor';
import { environment } from '../../../environments/environment';

describe('baseUrlInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([baseUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('prefixes /incomes requests with incomeApiUrl', () => {
    http.get('/incomes').subscribe();
    controller.expectOne(`${environment.incomeApiUrl}/incomes`).flush([]);
  });

  it('prefixes /expenses requests with expenseApiUrl', () => {
    http.get('/expenses/total').subscribe();
    controller.expectOne(`${environment.expenseApiUrl}/expenses/total`).flush({ total: 0 });
  });

  it('leaves unrelated URLs untouched', () => {
    http.get('/assets/x.json').subscribe();
    controller.expectOne('/assets/x.json').flush({});
  });
});
