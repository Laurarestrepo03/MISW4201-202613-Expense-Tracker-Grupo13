import { FormControl } from '@angular/forms';

import { INCOME_FIELDS } from './income-fields';

/** Cada PRE-XX = 1 validador ejecutable + este test que lo ejercita (PARIDAD §3). */
const control = (key: string, value: unknown) => {
  const field = INCOME_FIELDS.find((f) => f.key === key)!;
  return new FormControl(value, field.validators ?? []);
};

describe('Income preconditions', () => {
  it('PRE-05: source requerido, no vacío tras trim, máx 200', () => {
    expect(control('source', '').invalid).toBe(true);
    expect(control('source', '   ').invalid).toBe(true);
    expect(control('source', 'a'.repeat(201)).invalid).toBe(true);
    expect(control('source', 'a'.repeat(200)).valid).toBe(true);
    expect(control('source', 'Freelance Project').valid).toBe(true);
  });

  it('PRE-06: amount numérico y mayor que 0 (unificado a > 0)', () => {
    expect(control('amount', '').invalid).toBe(true);
    expect(control('amount', 0).invalid).toBe(true);
    expect(control('amount', -100).invalid).toBe(true);
    expect(control('amount', 0.01).valid).toBe(true);
    expect(control('amount', 2400).valid).toBe(true);
  });

  it('el formulario de income NO tiene campo fecha (la sella el servidor)', () => {
    expect(INCOME_FIELDS.map((f) => f.key)).toEqual(['source', 'amount']);
  });
});
