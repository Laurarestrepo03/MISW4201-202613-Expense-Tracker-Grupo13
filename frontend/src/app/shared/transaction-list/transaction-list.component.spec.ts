import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionListComponent } from './transaction-list.component';
import { TransactionItem } from './transaction-item';

const TRANSACTIONS: TransactionItem[] = [
  { id: 'i1', title: 'Freelance Project', date: '2026-07-20T10:00:00Z', amount: 2400, kind: 'income' },
  { id: 'e1', title: 'Groceries', date: '2026-07-19', amount: 120.5, kind: 'expense' },
];

describe('TransactionListComponent', () => {
  let fixture: ComponentFixture<TransactionListComponent>;

  const html = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionListComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TransactionListComponent);
    fixture.componentRef.setInput('transactions', TRANSACTIONS);
    await fixture.whenStable();
  });

  it('renders the "Recent Transactions" heading', () => {
    expect(html().querySelector('.transactions-card__title')?.textContent).toBe(
      'Recent Transactions',
    );
  });

  it('renders signed, colored amounts (+ green income, - red expense)', () => {
    const amounts = Array.from(html().querySelectorAll('.transaction__amount'));
    expect(amounts[0].textContent?.replace(/\s/g, '')).toBe('+$2,400.00');
    expect(amounts[0].classList.contains('is-income')).toBe(true);
    expect(amounts[1].textContent?.replace(/\s/g, '')).toBe('-$120.50');
    expect(amounts[1].classList.contains('is-income')).toBe(false);
  });

  it('shows an add chip for incomes and a remove chip for expenses', () => {
    const chips = Array.from(html().querySelectorAll('.icon-chip'));
    expect(chips[0].classList.contains('icon-chip--success')).toBe(true);
    expect(chips[0].textContent?.trim()).toBe('add');
    expect(chips[1].classList.contains('icon-chip--danger')).toBe(true);
    expect(chips[1].textContent?.trim()).toBe('remove');
  });

  it('formats the date for display', () => {
    expect(html().querySelector('.transaction__date')?.textContent).toContain('Jul 20, 2026');
  });
});
