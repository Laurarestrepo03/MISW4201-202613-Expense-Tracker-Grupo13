import { TestBed } from '@angular/core/testing';

import { ErrorBannerService } from './error-banner.service';

describe('ErrorBannerService', () => {
  let service: ErrorBannerService;

  beforeEach(() => {
    service = TestBed.inject(ErrorBannerService);
  });

  it('starts hidden (message null)', () => {
    expect(service.message()).toBeNull();
  });

  it('show() exposes the message', () => {
    service.show('Unable to reach the server. Try again.');
    expect(service.message()).toBe('Unable to reach the server. Try again.');
  });

  it('dismiss() hides the message', () => {
    service.show('boom');
    service.dismiss();
    expect(service.message()).toBeNull();
  });
});
