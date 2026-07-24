import { EntityRow } from '../entity-table/entity-column';

const CURRENCY = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/**
 * "Confirm removal of {label}: ${amount}" — mismo texto del legado
 * (JOptionPane); con N seleccionadas, una línea por ítem (PARIDAD §2.3).
 */
export function confirmRemovalLines(
  rows: readonly EntityRow[],
  ids: readonly string[],
  labelKey: string,
): string[] {
  const wanted = new Set(ids);
  return rows
    .filter((row) => wanted.has(row.id))
    .map((row) => {
      const record = row as unknown as Record<string, unknown>;
      return `Confirm removal of ${String(record[labelKey])}: ${CURRENCY.format(Number(record['amount']))}`;
    });
}
