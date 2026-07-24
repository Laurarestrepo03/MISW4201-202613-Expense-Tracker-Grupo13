/** Espejo de IncomeOut (backend/income-service/app/models/schemas.py). */
export interface Income {
  id: string;
  source: string;
  amount: number;
  /** Timestamp ISO (UTC) sellado por el servidor al crear — NO lo envía el front. */
  date: string;
}

/** Espejo de IncomeCreate: body del POST /incomes (sin fecha). */
export interface IncomeCreate {
  source: string;
  amount: number;
}
