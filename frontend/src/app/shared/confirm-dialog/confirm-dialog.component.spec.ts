import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  const html = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ConfirmDialogComponent] }).compileComponents();
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.componentRef.setInput('lines', [
      'Confirm removal of Rent: $1,200.00',
      'Confirm removal of Gym: $30.00',
    ]);
    await fixture.whenStable();
  });

  it('renders one line per selected item', () => {
    const lines = Array.from(html().querySelectorAll('.confirm-line')).map((l) =>
      l.textContent?.trim(),
    );
    expect(lines).toEqual([
      'Confirm removal of Rent: $1,200.00',
      'Confirm removal of Gym: $30.00',
    ]);
  });

  it('emits confirmed on Remove', () => {
    let confirmed = false;
    fixture.componentInstance.confirmed.subscribe(() => (confirmed = true));
    html().querySelector<HTMLButtonElement>('.btn--danger')!.click();
    expect(confirmed).toBe(true);
  });

  it('emits cancelled on Cancel', () => {
    let cancelled = false;
    fixture.componentInstance.cancelled.subscribe(() => (cancelled = true));
    html().querySelector<HTMLButtonElement>('.btn--text')!.click();
    expect(cancelled).toBe(true);
  });

  it('disables Remove while the delete is in flight', async () => {
    fixture.componentRef.setInput('pending', true);
    await fixture.whenStable();
    expect(html().querySelector<HTMLButtonElement>('.btn--danger')!.disabled).toBe(true);
  });
});
