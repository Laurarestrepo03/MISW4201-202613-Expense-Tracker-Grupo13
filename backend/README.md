# Expense Tracker - Backend

## Estructura

```
income-service/     # microservicio independiente: CR(U)D de Income + total
expense-service/     # microservicio independiente: CR(U)D de Expense + total
```

Cada uno se instala, se testea y se despliega **por separado**. No comparten tabla ni código entre sí.

## Instalar y correr tests (por servicio)

```bash
cd income-service   # o expense-service
pip install -r requirements.txt
pytest -v
```

> Nota: se recomienda crear un ambiente virtual antes de instalar los requerimientos.

## Correr localmente

```bash
cd income-service
pip install -r requirements.txt # si no se ha corrido antes
uvicorn app.main:app --reload --port 8001
```

```bash
cd expense-service
pip install -r requirements.txt # si no se ha corrido antes
uvicorn app.main:app --reload --port 8002
```

## Esquema de datos (una tabla por servicio, PK + SK compuesto)
| Servicio | Tabla | PK | SK | Atributos |
|---|---|---|---|---|
| income-service | `income-table` | `"INCOME"` (constante) | `<timestamp>#<id>` | id, source, amount, date |
| expense-service | `expense-table` | `"EXPENSE"` (constante) | `<fecha>#<id>` | id, title, amount, date, note |


## Endpoints

### income-service

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/incomes` | crear income |
| GET | `/incomes` | listar incomes |
| GET | `/incomes/total` | total de incomes |
| GET | `/incomes/{id}` | obtener un income |
| DELETE | `/incomes/{id}` | eliminar income |
| GET | `/health` | healthcheck |

### expense-service

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/expenses` | crear expense |
| GET | `/expenses` | listar expenses |
| GET | `/expenses/total` | total de expenses |
| GET | `/expenses/{id}` | obtener un expense |
| DELETE | `/expenses/{id}` | eliminar expense |
| GET | `/health` | healthcheck |
