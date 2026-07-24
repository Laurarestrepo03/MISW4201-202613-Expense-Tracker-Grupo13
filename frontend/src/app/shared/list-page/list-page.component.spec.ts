import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { ListPageComponent } from './list-page.component';
import { ListPageStore, ListPageTexts } from './list-page-config';
import { EntityRow } from '../entity-table/entity-column';

const TEXTS: ListPageTexts = {
  heading: 'List of Expenses',
  subheading: 'Manage and track your recurring and one-time expenses.',
  addLabel: 'Add',
  dialogTitle: 'Add an Expense',
  submitLabel: 'Add Expense',
  emptyMessage: 'You have not registered any expenses yet.',
};

class FakeStore implements ListPageStore {
  readonly items = signal<readonly EntityRow[]>([]);
  readonly loading = signal(false);
  readonly mutating = signal(false);
  readonly fieldErrors = signal<Record<string, string>>({});
  loadCalls = 0;
  added: unknown[] = [];
  removed: string[][] = [];
  readonly addResult = new Subject<unknown>();
  readonly removeResult = new Subject<unknown>();

  load(): void {
    this.loadCalls++;
  }

  add(data: never): Subject<unknown> {
    this.added.push(data);
    return this.addResult;
  }

  removeMany(ids: string[]): Subject<unknown> {
    this.removed.push(ids);
    return this.removeResult;
  }
}

describe('ListPageComponent', () => {
  let fixture: ComponentFixture<ListPageComponent>;
  let store: FakeStore;

  const html = () => fixture.nativeElement as HTMLElement;
  const removeButton = () => html().querySelector<HTMLButtonElement>('.btn--danger')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ListPageComponent] }).compileComponents();
    store = new FakeStore();
    fixture = TestBed.createComponent(ListPageComponent);
    fixture.componentRef.setInput('texts', TEXTS);
    fixture.componentRef.setInput('columns', [
      { key: 'title', header: 'Title' },
      { key: 'amount', header: 'Amount ($)', align: 'right', format: 'currency' },
    ]);
    fixture.componentRef.setInput('fields', [{ key: 'title', label: 'Title', type: 'text' }]);
    fixture.componentRef.setInput('store', store);
    fixture.componentRef.setInput('labelKey', 'title');
    await fixture.whenStable();
  });

  it('loads the list on init and renders heading/subtitle', () => {
    expect(store.loadCalls).toBe(1);
    expect(html().querySelector('.page-title')?.textContent).toBe('List of Expenses');
    expect(html().querySelector('.page-subtitle')?.textContent).toContain('one-time expenses');
  });

  it('shows the loading state', async () => {
    store.loading.set(true);
    await fixture.whenStable();
    expect(html().querySelector('.page-status')?.textContent).toContain('Loading');
    expect(html().querySelector('app-entity-table')).toBeNull();
  });

  it('shows the empty state with the configured message when there are no items', () => {
    expect(html().querySelector('.empty-state__message')?.textContent).toBe(
      'You have not registered any expenses yet.',
    );
  });

  it('shows the table when there are items, and Remove stays disabled without selection', async () => {
    store.items.set([{ id: '1', title: 'Rent', amount: 1200 } as EntityRow]);
    await fixture.whenStable();
    expect(html().querySelector('app-entity-table')).not.toBeNull();
    expect(removeButton().disabled).toBe(true);
  });

  it('opens the form dialog, submits and closes on success', async () => {
    html().querySelector<HTMLButtonElement>('.btn--primary')!.click();
    await fixture.whenStable();
    expect(html().querySelector('.dialog h2')?.textContent).toBe('Add an Expense');
    const input = html().querySelector<HTMLInputElement>('#title')!;
    input.value = 'Rent';
    input.dispatchEvent(new Event('input'));
    html().querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();
    expect(store.added).toEqual([{ title: 'Rent' }]);
    store.addResult.next({});
    store.addResult.complete();
    await fixture.whenStable();
    expect(html().querySelector('app-form-dialog')).toBeNull();
  });

  it('confirms removal listing each selected item and clears the selection', async () => {
    store.items.set([
      { id: '1', title: 'Rent', amount: 1200 } as EntityRow,
      { id: '2', title: 'Gym', amount: 30 } as EntityRow,
    ]);
    await fixture.whenStable();
    html().querySelectorAll<HTMLInputElement>('tbody input[type="checkbox"]')[0].click();
    await fixture.whenStable();
    removeButton().click();
    await fixture.whenStable();
    expect(html().querySelector('.confirm-line')?.textContent).toBe(
      'Confirm removal of Rent: $1,200.00',
    );
    html().querySelector<HTMLButtonElement>('.dialog .btn--danger')!.click();
    expect(store.removed).toEqual([['1']]);
    store.removeResult.next([]);
    store.removeResult.complete();
    await fixture.whenStable();
    expect(html().querySelector('app-confirm-dialog')).toBeNull();
    expect(removeButton().disabled).toBe(true);
  });
});
