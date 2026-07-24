import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { httpErrorInterceptor, SERVER_ERROR_MESSAGE } from './http-error.interceptor';
import { ErrorBannerService } from '../error-banner.service';

describe('httpErrorInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let banner: ErrorBannerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    banner = TestBed.inject(ErrorBannerService);
  });

  afterEach(() => controller.verify());

  it('shows the global banner on 5xx', () => {
    http.get('/expenses').subscribe({ error: () => undefined });
    controller
      .expectOne('/expenses')
      .flush('boom', { status: 500, statusText: 'Internal Server Error' });
    expect(banner.message()).toBe(SERVER_ERROR_MESSAGE);
  });

  it('shows the global banner on network failure (status 0)', () => {
    http.get('/incomes').subscribe({ error: () => undefined });
    controller.expectOne('/incomes').error(new ProgressEvent('error'));
    expect(banner.message()).toBe(SERVER_ERROR_MESSAGE);
  });

  it('does NOT show the banner on 4xx (the feature handles it)', () => {
    let received: number | undefined;
    http.get('/expenses/nope').subscribe({ error: (e) => (received = e.status) });
    controller.expectOne('/expenses/nope').flush(
      { detail: 'Expense not found' },
      { status: 404, statusText: 'Not Found' },
    );
    expect(banner.message()).toBeNull();
    expect(received).toBe(404);
  });
});
