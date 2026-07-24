/**
 * Movimiento de "Recent Transactions": lo arma el servicio del dashboard
 * mezclando GET /expenses + GET /incomes (única lógica permitida en el front).
 */
export interface TransactionItem {
  id: string;
  title: string;
  /** Fecha ISO del backend (date de expense; timestamp sellado de income). */
  date: string;
  amount: number;
  kind: 'income' | 'expense';
}
