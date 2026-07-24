# Paridad funcional y precondiciones — Expense Tracker modernizado

> Contrato funcional del frontend. Fuente: código legado real (`ExpenseAppUI.java`, `Ledger.java`,
> `Expense.java`, `Income.java`, commit 03c759a del repo del grupo), hallazgos de la Entrega 1 y
> el diseño final `front_design/Modern Ledger.html`. Las filas marcadas **✱ CORRECCIÓN** son
> defectos del legado que se corrigen deliberadamente: son mejoras documentadas, no regresiones.
> Todo lo demás del alcance migrado se preserva tal cual. Este documento es también la evidencia
> que P4·Calidad usa para la métrica de precondiciones.

## 0. Alcance: descarte de Saving Goals (decisión unánime, 2026-07-24)

La funcionalidad de **Saving Goals NO se migra** — el equipo decidió por unanimidad limitar la
migración a los dos requisitos: CRUD de Expenses y CRUD de Incomes (más el Dashboard de solo
lectura que los presenta). Consecuencias registradas para trazabilidad:

- Desaparecen del alcance: vista Saving Goals, modales Create/Contribute, endpoints `/goals` y
  `/contributions`, y las precondiciones PRE-07…PRE-11 de la versión anterior de este documento
  (name/goalAmount/contribution y sus reglas).
- En la **matriz de paridad final**, goals se reporta como **"descartado deliberadamente por
  decisión de equipo"** — nunca como funcionalidad faltante u olvidada.
- La fórmula de balance se simplifica (ver §1): ya no hay dinero apartado en metas.
- **Ninguna métrica de CodeScene se relaja** por este recorte (detalle en ARQUITECTURA §1): los
  umbrales aplican al código que exista, y el 100 % de precondiciones se mide sobre la tabla
  vigente de §3 (6 precondiciones).

## 1. Reglas de negocio del legado y quién las calcula ahora

Extraídas de `Ledger.java`, restringidas al alcance migrado:

- **Balance** es un acumulado: `+amount` al agregar ingreso; `−amount` al agregar gasto;
  al eliminar: gasto devuelve `+amount`, ingreso resta `−amount`.
  Equivale a: **`balance = Σingresos − Σgastos`**.
  **Quién lo calcula ahora**: el FRONT (servicio del feature dashboard), como
  `total de GET /incomes/total − total de GET /expenses/total` — los microservicios son
  independientes y no exponen balance (así lo documenta el propio código del backend).
  Es la única lógica de negocio permitida en el front.
- **Fecha de ingresos**: el legado no la pedía; el income-service la **sella en el servidor**
  (ISO UTC al crear). El formulario de income sigue siendo Source + Amount, sin campo fecha.
- Formato monetario en toda la app: en-US, 2 decimales, miles con coma (`$55,000.00`),
  cifras tabulares. En el dashboard y en Incomes los montos de ingreso van en verde
  (`#006A48`); los de gasto en rojo (`#BA1A1A`) cuando el diseño lo indica.

## 2. Paridad por vista

### 2.1 Shell / navegación

| Legado | Esperado en el nuevo |
|---|---|
| JFrame 700×600 con JTabbedPane: Dashboard, Expenses, Incomes, Saving Goals | Navbar superior blanca sticky con **3 rutas** (Dashboard, Expenses, Incomes); activa con color primario y subrayado 2px |
| Menú File → New / Load / Save + Exit con confirmación | Sin menú File: la persistencia es automática por request. "New" (reset) fuera de v1 salvo decisión del equipo |
| Al cerrar imprime EventLog en consola | Fuera del alcance del front (logs = CloudWatch del backend) |

### 2.2 Dashboard

| Legado | Esperado (según el mock) |
|---|---|
| Logo + "Welcome !" | `h1` "Welcome!" |
| Balance, Income, Expenses (cifras grandes, etiqueta gris) | 3 stat-cards: "Current Balance" (card azul, calculado en el front como `totalIncome − totalExpenses`), "Total Income" (`GET /incomes/total`, verde), "Total Expenses" (`GET /expenses/total`, rojo) |
| "Latest Saving Goal:" con progreso | **Eliminado con el descarte de goals.** El mock lo reemplaza por la card "Recent Transactions": el front mezcla `GET /expenses` + `GET /incomes`, ordena por fecha y muestra los últimos N con signo y color |
| Datos se refrescan tras cada mutación | Re-fetch de los totales al navegar al Dashboard |

### 2.3 Expenses ("List of Expenses")

| Legado | Esperado |
|---|---|
| Tabla: Title, Amount ($), Date, Notes | `EntityTable` con las mismas 4 columnas; Amount alineado a la derecha; zebra + selección azul; paginación en footer (elemento nuevo del mock) |
| Botones Add / Remove | Igual (con íconos `add`/`delete`); Remove deshabilitado sin selección **✱ CORRECCIÓN** (legado mostraba alerta y seguía → riesgo de crash) |
| Form "Add an Expense": campos Source(→título), Amount, Date texto libre "25 Dec, 2022", Note | `FormDialog`: **Title** (✱ CORRECCIÓN: el label del legado decía "Source" por error), Amount numérico step 0.01, **Date con date picker (ISO)** ✱ CORRECCIÓN, Note (optional) textarea |
| Validación: si hay campos vacíos muestra "failed"… **y aun así crea el gasto** y muestra "success" (else faltante) | ✱ CORRECCIÓN: formulario inválido **no se envía**; un solo mensaje de resultado |
| Monto no numérico → crash (`NumberFormatException` sin capturar) | ✱ CORRECCIÓN: input numérico; imposible enviar texto |
| Multi-selección posible pero Remove borra solo la primera fila | ✱ CORRECCIÓN: se eliminan **todas** las seleccionadas tras una única confirmación |
| Confirmación de borrado: "Confirm removal of {title}: ${amount}" | Mismo texto en `ConfirmDialog`; con N seleccionadas, listar los títulos |

### 2.4 Incomes ("List of Incomes")

| Legado | Esperado |
|---|---|
| Tabla: Source, Amount ($). Selección única | `EntityTable` con las 2 columnas; selección múltiple para consistencia; montos en verde; source con ícono circular (mock) |
| Form "Add an Income": Source, Amount | `FormDialog` igual (botón "Add Income"), con validaciones |
| Mismos bugs de validación/doble modal que Expenses | ✱ CORRECCIÓN: igual que en Expenses |

## 3. Precondiciones ejecutables (métrica: 100 % sobre el alcance migrado)

Cada fila = 1 validador en Reactive Forms + 1 test unitario que lo ejercita (inválido → bloquea,
válido → pasa). El backend valida lo mismo vía Pydantic; el front es la primera línea.
Convención de tests: `PRE-XX` en el nombre del spec para que P4 pueda auditar cobertura.

| ID | Campo | Regla | Origen | Validador |
|---|---|---|---|---|
| PRE-01 | Expense.title | requerido, no vacío tras trim, **máx 200** | `isEmpty()` en UI legado (roto) + Pydantic `min_length=1, max_length=200` | `required` + trim + `maxLength(200)` |
| PRE-02 | Expense.amount | numérico, > 0, 2 decimales máx | `REQUIRES: amount > 0` (`Expense.java`) | `required` + `min(0.01)` |
| PRE-03 | Expense.date | requerida, fecha válida ISO `yyyy-MM-dd` | texto libre en legado (defecto); el backend exige tipo `date` | `required` + date picker |
| PRE-04 | Expense.note | opcional; **máx 500** | Pydantic `max_length=500`, default `""` | `maxLength(500)` |
| PRE-05 | Income.source | requerido, no vacío tras trim, **máx 200** | `isEmpty()` en UI legado (roto) + Pydantic `min_length=1, max_length=200` | `required` + trim + `maxLength(200)` |
| PRE-06 | Income.amount | numérico, > 0 | `REQUIRES: amount >= 0` (`Ledger.java`); front unifica a > 0 | `required` + `min(0.01)` |

Notas:
- Las longitudes máximas vienen del backend real (`backend/*/app/models/schemas.py`) — ya no
  son pendientes de contrato.
- **Discrepancia registrada**: el backend acepta `amount = 0` (`ge=0`); el front exige `> 0`
  (fiel a `Expense.java: REQUIRES amount > 0`). El front es la línea estricta; se propuso a
  P1 alinear el backend a `gt=0`.
- Los montos usan step 0.01; los inputs numéricos impiden texto (elimina el crash por
  `NumberFormatException` del legado).
- Income NO tiene campo fecha en el formulario: la sella el servidor (ver §1).
- PRE-07…PRE-11 (goals y contribuciones) fueron **descartadas con la funcionalidad** (§0);
  no cuentan en el denominador de la métrica.
- Si el backend agrega o cambia una regla, se agrega la fila aquí ANTES de implementarla.

## 4. Estados de interfaz (paridad de UX, según el mock)

| Estado | Comportamiento |
|---|---|
| Lista vacía | Empty-state en la card de la tabla ("You have not registered any expenses yet." / equivalente en Incomes) con botón primario de alta |
| Cargando | Indicador discreto en la zona de la tabla; botones de mutación deshabilitados |
| Error de API | `error-banner` rojo sobre la navbar: "Unable to reach the server. Try again." con botón de cierre — sin reintento automático |
| Petición en vuelo | Botón submit del modal deshabilitado (evita dobles POST — protege la prueba de carga) |
| Sin selección | Remove deshabilitado (opacity 0.5, not-allowed) — reemplaza el popup "Choose an item in the list!" del legado |
| Paginación | Footer "Showing X to Y of Z entries" + Prev/Next; deshabilitados en los extremos |

## 5. Fuera de alcance del front v1

- **Saving Goals completo** — descartado por decisión unánime del equipo (2026-07-24); ver §0.
- Pantalla de importación de `data.json` (la migración se hace con script/endpoint `POST /import`
  por Infra); si el equipo la pide, se diseña aparte.
- Reset del ledger (menú File → New del legado) — pendiente de decisión de equipo.
- Autenticación (la app legada es monousuario; el contrato v1 no la incluye).
- Réplica del `EventLog` en consola del navegador.
