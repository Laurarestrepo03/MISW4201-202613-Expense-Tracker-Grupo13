// Producción: URLs de API Gateway de cada Lambda (las define P3·Infra).
// Dos base URLs SIEMPRE: los microservicios son independientes (ARQUITECTURA §9).
export const environment = {
  incomeApiUrl: 'https://a9pby5oi1m.execute-api.us-east-1.amazonaws.com/qa',
  expenseApiUrl: 'https://a9pby5oi1m.execute-api.us-east-1.amazonaws.com/qa',
};
