import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';

import { FormDialogComponent } from './form-dialog.component';
import { DialogField } from './dialog-field';

const FIELDS: DialogField[] = [
  {
    key: 'title',
    label: 'Title',
    type: 'text',
    placeholder: 'e.g. Grocery Shopping',
    validators: [Validators.required],
    errorMessages: { required: 'Title is required.' },
  },
  {
    key: 'amount',
    label: 'Amount ($)',
    type: 'number',
    step: '0.01',
    validators: [Validators.required, Validators.min(0.01)],
    errorMessages: { required: 'Amount is required.', min: 'Amount must be greater than 0.' },
  },
];

describe('FormDialogComponent', () => {
  let fixture: ComponentFixture<FormDialogComponent>;

  const html = () => fixture.nativeElement as HTMLElement;
  const submitButton = () => html().querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const setValue = (id: string, value: string) => {
    const input = html().querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FormDialogComponent] }).compileComponents();
    fixture = TestBed.createComponent(FormDialogComponent);
    fixture.componentRef.setInput('title', 'Add an Expense');
    fixture.componentRef.setInput('fields', FIELDS);
    fixture.componentRef.setInput('submitLabel', 'Add Expense');
    await fixture.whenStable();
  });

  it('renders title, labels and placeholders from config', () => {
    expect(html().querySelector('h2')?.textContent).toBe('Add an Expense');
    const labels = Array.from(html().querySelectorAll('label')).map((l) => l.textContent?.trim());
    expect(labels).toEqual(['Title', 'Amount ($)']);
    expect(html().querySelector<HTMLInputElement>('#title')?.placeholder).toBe(
      'e.g. Grocery Shopping',
    );
    expect(html().querySelector<HTMLInputElement>('#amount')?.step).toBe('0.01');
  });

  it('does NOT emit submitted when invalid, and shows field errors', async () => {
    let emitted = false;
    fixture.componentInstance.submitted.subscribe(() => (emitted = true));
    submitButton().click();
    await fixture.whenStable();
    expect(emitted).toBe(false);
    const errors = Array.from(html().querySelectorAll('.form-field__error')).map((e) =>
      e.textContent?.trim(),
    );
    expect(errors).toEqual(['Title is required.', 'Amount is required.']);
  });

  it('emits the raw value when valid', async () => {
    let value: Record<string, unknown> | undefined;
    fixture.componentInstance.submitted.subscribe((v) => (value = v));
    setValue('title', 'Groceries');
    setValue('amount', '42.50');
    submitButton().click();
    await fixture.whenStable();
    expect(value).toEqual({ title: 'Groceries', amount: 42.5 });
  });

  it('disables the submit button while pending (request in flight)', async () => {
    fixture.componentRef.setInput('pending', true);
    await fixture.whenStable();
    expect(submitButton().disabled).toBe(true);
  });

  it('emits closed from the close button and from Cancel', () => {
    let closes = 0;
    fixture.componentInstance.closed.subscribe(() => closes++);
    html().querySelector<HTMLButtonElement>('.dialog__close')!.click();
    html().querySelector<HTMLButtonElement>('.btn--text')!.click();
    expect(closes).toBe(2);
  });

  it('maps backend fieldErrors (422) onto the form', async () => {
    setValue('title', 'x');
    fixture.componentRef.setInput('fieldErrors', {
      title: 'String should have at most 200 characters',
    });
    await fixture.whenStable();
    expect(html().querySelector('.form-field__error')?.textContent?.trim()).toBe(
      'String should have at most 200 characters',
    );
  });
});
