// Desarrollo: base URLs relativas → el dev-server proxya /incomes a :8001 y
// /expenses a :8002 (proxy.conf.json), evitando CORS solo en dev (ARQUITECTURA §11.1).
export const environment = {
  incomeApiUrl: '',
  expenseApiUrl: '',
};
