import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityTableComponent } from './entity-table.component';
import { EntityColumn, EntityRow } from './entity-column';

const COLUMNS: EntityColumn[] = [
  { key: 'title', header: 'Title' },
  { key: 'amount', header: 'Amount ($)', align: 'right', format: 'currency' },
];

interface TestRow extends EntityRow {
  title: string;
  amount: number;
}

const ROWS: TestRow[] = [
  { id: '1', title: 'Rent', amount: 1200 },
  { id: '2', title: 'Groceries', amount: 350.5 },
  { id: '3', title: 'Internet', amount: 60 },
  { id: '4', title: 'Gas', amount: 45 },
  { id: '5', title: 'Gym', amount: 30 },
];

describe('EntityTableComponent', () => {
  let fixture: ComponentFixture<EntityTableComponent>;

  const html = () => fixture.nativeElement as HTMLElement;
  const range = () => html().querySelector('.entity-table__range')?.textContent?.trim();
  const bodyRows = () => html().querySelectorAll('tbody tr');
  const pagerButtons = () => html().querySelectorAll<HTMLButtonElement>('.pager-btn');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EntityTableComponent] }).compileComponents();
    fixture = TestBed.createComponent(EntityTableComponent);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.componentRef.setInput('rows', ROWS);
    fixture.componentRef.setInput('selectable', true);
    fixture.componentRef.setInput('pageSize', 2);
    await fixture.whenStable();
  });

  it('renders the configured column headers', () => {
    const headers = Array.from(html().querySelectorAll('th')).map((th) => th.textContent?.trim());
    expect(headers).toEqual(['', 'Title', 'Amount ($)']);
  });

  it('formats currency cells as en-US with 2 decimals', () => {
    expect(html().querySelector('.amount')?.textContent?.trim()).toBe('$1,200.00');
  });

  it('formats date cells with the shared medium date format', async () => {
    fixture.componentRef.setInput('columns', [{ key: 'date', header: 'Date', format: 'date' }]);
    fixture.componentRef.setInput('rows', [{ id: '1', date: '2026-07-24' }]);
    await fixture.whenStable();
    expect(bodyRows()[0].textContent).toContain('Jul 24, 2026');
  });

  it('paginates client-side and shows "Showing X to Y of Z entries"', () => {
    expect(bodyRows().length).toBe(2);
    expect(range()).toBe('Showing 1 to 2 of 5 entries');
  });

  it('disables Prev on first page and navigates with Next', async () => {
    const [prev, next] = Array.from(pagerButtons());
    expect(prev.disabled).toBe(true);
    next.click();
    await fixture.whenStable();
    expect(range()).toBe('Showing 3 to 4 of 5 entries');
    next.click();
    await fixture.whenStable();
    expect(range()).toBe('Showing 5 to 5 of 5 entries');
    expect(bodyRows().length).toBe(1);
    expect(pagerButtons()[1].disabled).toBe(true);
  });

  it('emits selected ids and marks the row as selected', async () => {
    let selection: string[] = [];
    fixture.componentInstance.selectionChange.subscribe((ids) => (selection = ids));
    html().querySelectorAll<HTMLInputElement>('tbody input[type="checkbox"]')[0].click();
    await fixture.whenStable();
    expect(selection).toEqual(['1']);
    expect(bodyRows()[0].classList.contains('is-selected')).toBe(true);
  });

  it('select-all toggles every row across pages', async () => {
    let selection: string[] = [];
    fixture.componentInstance.selectionChange.subscribe((ids) => (selection = ids));
    html().querySelector<HTMLInputElement>('thead input[type="checkbox"]')!.click();
    await fixture.whenStable();
    expect(selection).toEqual(['1', '2', '3', '4', '5']);
    html().querySelector<HTMLInputElement>('thead input[type="checkbox"]')!.click();
    await fixture.whenStable();
    expect(selection).toEqual([]);
  });

  it('resets selection and page when rows change (post-mutation)', async () => {
    html().querySelectorAll<HTMLInputElement>('tbody input[type="checkbox"]')[0].click();
    pagerButtons()[1].click();
    await fixture.whenStable();
    fixture.componentRef.setInput('rows', ROWS.slice(0, 2));
    await fixture.whenStable();
    expect(range()).toBe('Showing 1 to 2 of 2 entries');
    expect(html().querySelectorAll('tbody tr.is-selected').length).toBe(0);
  });
});
