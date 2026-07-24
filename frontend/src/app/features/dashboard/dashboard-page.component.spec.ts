import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPageComponent } from './dashboard-page.component';

describe('DashboardPageComponent', () => {
  let fixture: ComponentFixture<DashboardPageComponent>;
  let controller: HttpTestingController;

  const html = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    controller = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DashboardPageComponent);
    await fixture.whenStable();
  });

  it('muestra "Welcome!" y el estado de carga mientras llegan los datos', () => {
    expect(html().querySelector('h1')?.textContent).toBe('Welcome!');
    expect(html().querySelector('.page-status')?.textContent).toContain('Loading');
  });

  it('pinta las 3 stat cards con los totales y el balance compuesto', async () => {
    controller.expectOne('/incomes/total').flush({ total: 8000 });
    controller.expectOne('/expenses/total').flush({ total: 3000 });
    controller
      .expectOne('/incomes')
      .flush([{ id: '1', source: 'Salary', amount: 5000, date: '2026-07-20T09:00:00Z' }]);
    controller.expectOne('/expenses').flush([]);
    await fixture.whenStable();
    const labels = Array.from(html().querySelectorAll('.stat-card__label')).map(
      (l) => l.textContent,
    );
    const values = Array.from(html().querySelectorAll('.stat-card__value')).map((v) =>
      v.textContent?.trim(),
    );
    expect(labels).toEqual(['Current Balance', 'Total Income', 'Total Expenses']);
    expect(values).toEqual(['$5,000.00', '$8,000.00', '$3,000.00']);
    expect(html().querySelectorAll('.transaction').length).toBe(1);
  });
});
