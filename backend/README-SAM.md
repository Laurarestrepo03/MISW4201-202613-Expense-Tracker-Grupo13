# Despliegue con AWS SAM

Este directorio contiene las plantillas SAM para desplegar los microservicios de Expense Tracker en AWS Lambda con DynamoDB.

## Prerequisitos

1. Instalar [AWS CLI](https://aws.amazon.com/cli/)
2. Instalar [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
3. Configurar credenciales AWS: `aws configure`

## Estructura

```
backend/
├── template.yaml              # Plantilla SAM principal
├── samconfig.toml            # Configuración de SAM CLI
├── expense-service/          # Código del microservicio de gastos
│   ├── app/
│   └── requirements.txt
└── income-service/           # Código del microservicio de ingresos
    ├── app/
    └── requirements.txt
```

## Recursos Creados

### DynamoDB Tables
- **expense-table**: Tabla para almacenar gastos
  - PK: `EXPENSE` (constante)
  - SK: `{fecha}#{id}` (permite ordenar por fecha)
  
- **income-table**: Tabla para almacenar ingresos
  - PK: `INCOME` (constante)
  - SK: `{timestamp}#{id}` (permite ordenar cronológicamente)

### Lambda Functions
- **expense-service**: Microservicio de gastos (FastAPI + Mangum)
- **income-service**: Microservicio de ingresos (FastAPI + Mangum)

### API Gateway
- **expense-tracker-api**: API Gateway REST con CORS configurado
  - Rutas de gastos: `/expenses/*`
  - Rutas de ingresos: `/incomes/*`
  - Health checks: `/health`

## Comandos de Despliegue

### 1. Validar la plantilla
```bash
sam validate
```

### 2. Construir la aplicación
```bash
sam build
```

### 3. Desplegar en AWS (Desarrollo)
```bash
sam deploy --guided
```

Para despliegues posteriores:
```bash
sam deploy
```
