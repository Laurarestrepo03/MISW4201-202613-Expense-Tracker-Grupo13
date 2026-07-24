import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatCardComponent } from './stat-card.component';

describe('StatCardComponent', () => {
  let fixture: ComponentFixture<StatCardComponent>;

  const html = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StatCardComponent] }).compileComponents();
    fixture = TestBed.createComponent(StatCardComponent);
    fixture.componentRef.setInput('label', 'Current Balance');
    fixture.componentRef.setInput('value', 55000);
    await fixture.whenStable();
  });

  it('renders the label and the en-US formatted value', () => {
    expect(html().querySelector('.stat-card__label')?.textContent).toBe('Current Balance');
    expect(html().querySelector('.stat-card__value')?.textContent?.trim()).toBe('$55,000.00');
  });

  it('defaults to the primary (blue) variant', () => {
    expect(html().querySelector('.stat-card--primary')).not.toBeNull();
  });

  it('applies the success and danger variants', async () => {
    fixture.componentRef.setInput('variant', 'success');
    await fixture.whenStable();
    expect(html().querySelector('.stat-card--success')).not.toBeNull();
    fixture.componentRef.setInput('variant', 'danger');
    await fixture.whenStable();
    expect(html().querySelector('.stat-card--danger')).not.toBeNull();
  });
});
