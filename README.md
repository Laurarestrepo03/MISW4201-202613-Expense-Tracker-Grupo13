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

<!--
## Manage money responsibly

### Abstract

In order to start saving money, we have to understand where our income is being spent.
This expense tracker app will help to understand how the money is being spent, so we can make changes in 
spending habits and stay on top of finances. It aims to assist user in reducing their expenses and put more
money towards savings and emergency funds, and improve financial security. This application can be of use to
anyone who wants to have control of their money.

I wanted to create this app because I have always wanted to understand my spending habits and have been using
spreadsheets to simulate a budget app. This app will help me automate most of the basic budgeting and also provide an appealing user interface
to make budgeting easier.

### User Stories

- As a user, I want to add my income sources and view my available money.
- As a user, I want to see a breakdown of my spending's.
- As a user, I want to make notes on some of my transactions.
- As a user, I want to set up saving goals.
- As a user, I want to save my ledger data to a file.
- As a user, I want to load my ledger data from a file. 
- As a user, I want to delete any income, expense or saving goal.
- As a user, I want to be given the option to load my data.
- As a user, when I close the app, I want to save my data.

### Instructions

- You can generate the first required event related to adding expense to an expenses by clicking on Expenses tab.
  Once on expenses panel, click on "Add" button which will show a popup window.
  Type your info in this popup and click Yes. Now, your expense will be shown in expenses list.
  You can also choose to "Delete" an expense after clicking on an expense in the list and then confirming in the popup window.
- You can generate the second required event related to adding income to an income list by clicking on Incomes tab.
  Once on incomes panel, click on "Add" button which will show a popup window.
  Type your info in this popup and click Yes. Now, your income will be shown in incomes list.
  You can also choose to "Delete" an income after clicking on an income in the list and then confirming in the popup window.
- You can generate the third event related to adding saving goal to a goals by clicking on Saving Goals tab.
  Once on saving goals panel, click on "Add" button which will show a popup window.
  Type your info in this popup and click Yes. Now, your saving goal will be shown in saving goals list.
  Now, in the same tab, click on "Contribute" button next to "Add a Saving Goal" button.
  This will bring up another popup window, where you can choose a goal from combobox.
  Type in the amount to contribute to that goal and click OK.
  Now your saving goal will have its current amount increased by the contribution amount.
  You can also choose to "Delete" a saving goal after clicking on a goal in the list and then confirming in the popup window.
- You can locate my visual component by clicking on the dashboard tab.
  It is a logo of this application at top of the dashboard. I created this logo using an online tool called Figma.
- You can save the state of my application by clicking on "Save" in File menu.
  Your data is also synced after every creation of an object.
- You can reload the state of my application by clicking on "Load" in File menu.
-->
