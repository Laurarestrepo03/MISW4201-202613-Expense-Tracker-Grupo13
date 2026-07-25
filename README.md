# Expense Tracker

## Tabla de contenido
1. [Apliación origen](#aplicación-origen)
2. [Aplicación modernizada](#aplicación-modernizada)

## Aplicación origen
La aplicación legada (Java Swing) vive **congelada en `legacy/`** como artefacto de
comparación de la modernización: es solo lectura y no se edita ni se compila desde el
trabajo nuevo. A continuación el paso a paso para ejecutarla, y el listado de funcionalidades.

### Ejecución de la aplicación
**Instalaciones previas**
1. [Visual Studio Code](https://code.visualstudio.com/download)
2. Extension Pack for Java, en Visual Studio Code
3. [JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) 

**Ejecución**
1. Abrir la carpeta del proyecto en Visual Studio.
2. Dirigirse el archivo `Main.java`. Este se encuentra en `legacy/src/main/ui`
3. Dar click en el botón de ejución localizado en la esquina superior derecha.
4. Listo, podrá utilizar la aplicación en la ventana emergente.

<img height="400" alt="Captura de pantalla 2026-06-15 234120" src="https://github.com/user-attachments/assets/88df0532-53aa-4717-9f1a-09cf6c350f4b" />

### Funcionalidades
**Dashboard**
- Balance total calculado a partir de los ingresos, gastos y contribuciones a las metas de ahorro. 
- Total de los ingresos 
- Total de los gastos
- Avance de la última meta de ahorro creada

**Expenses**
- Listado de gastos, con su título, monto, fecha y notas
- Creación de un gasto
- Eliminación de un gasto

**Incomes**
- Listado de ingresos, con su origen y monto
- Creación de un ingreso
- Eliminación de un ingreso

**Saving goals**
- Listado de metas de ahorro, con su título, monto ahorrado, monto de la meta y estado
- Creación de una meta de ahorro
- Contribución a una meta de ahorro
- Eliminación de una meta de ahorro

**Manejo de archivos**
- Creación de un nuevo archivo para las finanzas
- Carga de un archivo existente
- Guardado de las modificaciones

## Aplicación modernizada

La aplicación de escritorio monolítica (Java Swing, un solo proceso, datos en
`data.json`) se migró a una arquitectura web distribuida:

- **Frontend**: SPA en Angular (componentes standalone, signals, Router y SCSS
  con design tokens). Tres vistas: Dashboard de solo lectura, CRUD de Expenses
  y CRUD de Incomes.
- **Backend**: dos microservicios FastAPI **independientes** —`income-service`
  y `expense-service`—, cada uno con su propia Lambda y su propia tabla
  DynamoDB. No comparten tabla ni código.
- **Alcance**: Saving Goals no se migró; el equipo lo descartó por decisión
  unánime para concentrar la migración en los dos requisitos de negocio.
- **Balance**: como los microservicios son independientes, no existe un
  endpoint de balance. El Dashboard lo compone en el cliente restando el total
  de gastos al total de ingresos, y arma "Recent Transactions" mezclando ambas
  listas.

```
MISW4201-202613-Expense-Tracker-Grupo13/
├── legacy/        # app Java Swing original, congelada como referencia de paridad
├── backend/
│   ├── income-service/    # FastAPI + income-table    (local :8001)
│   └── expense-service/   # FastAPI + expense-table   (local :8002)
├── frontend/      # SPA Angular  (local :4200)
│   ├── docs/      # arquitectura, paridad funcional y precondiciones
│   └── src/app/   # core (contrato y estado) · shared (componentes) · features (3 rutas)
└── front_design/  # definición visual del rediseño
```

### Ejecutar localmente

Requisitos: Node 22, Python 3.13 y credenciales de AWS con las tablas
`income-table` y `expense-table` en `us-east-1`.

**income-service**

```bash
cd backend/income-service
pip install -r requirements.txt uvicorn
uvicorn app.main:app --port 8001
```

**expense-service**

```bash
cd backend/expense-service
pip install -r requirements.txt uvicorn
uvicorn app.main:app --port 8002
```

**frontend**

```bash
cd frontend
npm ci
npm start
```

La aplicación queda en `http://localhost:4200`. En desarrollo el servidor de
Angular enruta `/incomes` y `/expenses` hacia los dos microservicios locales.
