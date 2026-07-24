/** Espejo de ExpenseOut (backend/expense-service/app/models/schemas.py). */
export interface Expense {
  id: string;
  title: string;
  amount: number;
  /** Fecha ISO yyyy-MM-dd (tipo date de Pydantic). */
  date: string;
  note: string;
}

/** Espejo de ExpenseCreate: body del POST /expenses. */
export interface ExpenseCreate {
  title: string;
  amount: number;
  date: string;
  note?: string;
}
