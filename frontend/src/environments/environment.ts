// Producción: URLs de API Gateway de cada Lambda (las define P3·Infra).
// Dos base URLs SIEMPRE: los microservicios son independientes (ARQUITECTURA §9).
export const environment = {
  incomeApiUrl: 'https://TODO-income-api-gateway.example.com',
  expenseApiUrl: 'https://TODO-expense-api-gateway.example.com',
};
