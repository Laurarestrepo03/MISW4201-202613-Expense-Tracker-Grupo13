import { FormControl } from '@angular/forms';

import { EXPENSE_FIELDS } from './expense-fields';

/** Cada PRE-XX = 1 validador ejecutable + este test que lo ejercita (PARIDAD §3). */
const control = (key: string, value: unknown) => {
  const field = EXPENSE_FIELDS.find((f) => f.key === key)!;
  return new FormControl(value, field.validators ?? []);
};

describe('Expense preconditions', () => {
  it('PRE-01: title requerido, no vacío tras trim, máx 200', () => {
    expect(control('title', '').invalid).toBe(true);
    expect(control('title', '   ').invalid).toBe(true);
    expect(control('title', 'a'.repeat(201)).invalid).toBe(true);
    expect(control('title', 'a'.repeat(200)).valid).toBe(true);
    expect(control('title', 'Groceries').valid).toBe(true);
  });

  it('PRE-02: amount numérico y mayor que 0', () => {
    expect(control('amount', '').invalid).toBe(true);
    expect(control('amount', 0).invalid).toBe(true);
    expect(control('amount', -5).invalid).toBe(true);
    expect(control('amount', 0.01).valid).toBe(true);
    expect(control('amount', 120.5).valid).toBe(true);
  });

  it('PRE-03: date requerida (formato ISO garantizado por el date picker)', () => {
    expect(control('date', '').invalid).toBe(true);
    expect(control('date', '2026-07-24').valid).toBe(true);
  });

  it('PRE-04: note opcional con máximo 500 caracteres', () => {
    expect(control('note', '').valid).toBe(true);
    expect(control('note', 'a'.repeat(501)).invalid).toBe(true);
    expect(control('note', 'a'.repeat(500)).valid).toBe(true);
  });
});
