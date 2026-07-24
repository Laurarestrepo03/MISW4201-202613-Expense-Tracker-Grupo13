import { TestBed } from '@angular/core/testing';

import { ErrorBannerComponent } from './error-banner.component';
import { ErrorBannerService } from '../../core/error-banner.service';

describe('ErrorBannerComponent', () => {
  let service: ErrorBannerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ErrorBannerComponent] }).compileComponents();
    service = TestBed.inject(ErrorBannerService);
  });

  it('is hidden when there is no error', async () => {
    const fixture = TestBed.createComponent(ErrorBannerComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.error-banner')).toBeNull();
  });

  it('shows the message when the service reports an error', async () => {
    const fixture = TestBed.createComponent(ErrorBannerComponent);
    service.show('Unable to reach the server. Try again.');
    await fixture.whenStable();
    const text = fixture.nativeElement.querySelector('.error-banner__text');
    expect(text?.textContent).toBe('Unable to reach the server. Try again.');
  });

  it('dismisses on close button click', async () => {
    const fixture = TestBed.createComponent(ErrorBannerComponent);
    service.show('boom');
    await fixture.whenStable();
    fixture.nativeElement.querySelector('.error-banner__close').click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.error-banner')).toBeNull();
    expect(service.message()).toBeNull();
  });
});
