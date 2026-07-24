# Arquitectura del frontend — Expense Tracker modernizado

> Documento de referencia estructural. `CLAUDE.md` tiene las reglas imperativas;
> `PARIDAD-Y-PRECONDICIONES.md` tiene el comportamiento esperado. Este documento explica el
> **cómo está organizado** y el **porqué** de cada decisión.

## 1. Contexto del sistema y alcance

Migración total del CPSC 210 Expense Tracker (Java Swing, monousuario, persistencia en
`data.json`) hacia una arquitectura web serverless:

```
                             ┌──────────────────────┐        ┌──────────────────┐
                    HTTPS ─► │  income-service      │ boto3► │  income-table    │
┌─────────────────┐          │  (FastAPI + Mangum,  │        │  PK "INCOME"     │
│  Angular SPA    │          │   Lambda propia)     │        └──────────────────┘
│  S3 + CloudFront│          └──────────────────────┘
└─────────────────┘          ┌──────────────────────┐        ┌──────────────────┐
                    HTTPS ─► │  expense-service     │ boto3► │  expense-table   │
                             │  (FastAPI + Mangum,  │        │  PK "EXPENSE"    │
                             │   Lambda propia)     │        └──────────────────┘
```

El backend **ya está implementado** en `backend/` de este repo: son **dos microservicios
independientes** (`income-service` y `expense-service`), cada uno con su FastAPI, su Lambda y
su tabla DynamoDB propia — no comparten tabla ni código. La SPA solo habla HTTPS con ambos.

Consecuencia clave para el front: **no existe endpoint de dashboard ni de balance**. Por
decisión de la arquitectura de microservicios, el balance lo compone el front:
`balance = total de /incomes/total − total de /expenses/total` (así está documentado en el
propio código del backend). Esa composición aritmética —y la mezcla de "Recent Transactions"
a partir de las dos listas— es la **única** lógica permitida en el front, encapsulada en el
servicio del feature dashboard. Todas las demás reglas viven en el backend.

**Alcance (decisión unánime del equipo, 2026-07-24): la funcionalidad de Saving Goals se
DESCARTA — no se migra.** El alcance del front son tres vistas: Dashboard (solo lectura),
CRUD de Expenses y CRUD de Incomes.

### Por qué el descarte de goals NO afecta las métricas de CodeScene

Esto quedó verificado y es importante tenerlo presente al medir:

- **Code Health ≥ 9.0 / 0 Attention / 0 duplicación** son propiedades del código que existe,
  no un conteo de funcionalidades. Menos alcance = menos superficie donde degradarse; los
  umbrales no cambian.
- **El riesgo de duplicación persiste con 2 listas**: en el legado la duplicación vivía entre
  `ExpensesPanel` e `IncomePanel` (y `GoalsPanel`). Quitar goals no elimina el riesgo entre las
  dos que quedan — por eso `EntityTable` sigue siendo obligatorio.
- **Precondiciones 100 %**: el universo medible pasa de 11 a 6 (PRE-01…PRE-06). El 100 % se
  calcula sobre las precondiciones del alcance migrado; las 5 de goals (PRE-07…PRE-11) quedan
  registradas como **descartadas junto con la funcionalidad** en PARIDAD §5, para que en la
  matriz de paridad cuenten como "descarte deliberado", nunca como "faltante".
- **Prueba de carga**: se mide sobre `POST /expenses`, que sigue intacto en el alcance.

**⚠ Riesgo conocido de duplicación (backend, para P1/P4)**: los dos microservicios son
espejos casi idénticos por diseño ("no comparten código entre sí" — decisión de independencia
de despliegue). CodeScene puede marcar esa similitud entre `income-service/` y
`expense-service/` como duplicación entre módulos, amenazando la meta de 0. El equipo debe
decidir antes de la medición final: documentar la excepción (duplicación aceptada entre
servicios independientes, medir por servicio) o extraer una librería compartida. El front no
puede acogerse a esa excepción: dentro del front la duplicación sigue siendo 0 estricto.
**Resolución registrada en §11.3** (excepción documentada + medición por componente).

## 2. Stack y decisiones

| Decisión | Elección | Por qué |
|---|---|---|
| Framework | Angular (versión estable actual), componentes standalone | Requisito de la propuesta (componentes, Router, DI) |
| Estado | Signals en servicios por feature; **sin** NgRx ni librería global | Los datos son 2 listas pequeñas + un dashboard; una store global es sobre-ingeniería que baja Code Health |
| Formularios | Reactive Forms con `Validators` | Las precondiciones deben ser ejecutables y testeables una a una |
| HTTP | `HttpClient` + interceptores (baseUrl, errores) solo en `core/` | Un solo punto de manejo de errores; componentes limpios |
| Estilos | SCSS propio con design tokens extraídos del mock `front_design/Modern Ledger.html` | Sin librería de componentes pesada; fidelidad al diseño final |
| Idioma UI | Inglés (paridad con legado y con el mock) | Los textos del legado y del diseño son en inglés |
| Tests | Unit tests de validadores/servicios/componentes con el runner por defecto del CLI | Evidencia del 100 % de precondiciones |

## 3. Diseño — fuente de verdad: `front_design/Modern Ledger.html`

El mock "Modern Ledger" (prototipado en Stitch y afinado en Claude design) es la **definición
visual** del front. No es implementación: es un bundle de prototipo con estilos inline, y
copiarlo al código Angular está prohibido (destruiría las métricas). Lo que sigue es la
extracción normativa de ese mock — si un detalle no está aquí, se consulta el mock, se agrega
aquí como token/regla y solo entonces se implementa.

### 3.1 Design tokens (extraídos del mock — valores exactos)

```scss
// Color
--color-primary: #0037B0;        // botones primarios, marca, tab activa, focus
--color-primary-hover: #1D4ED8;  // hover de acciones primarias; card de Balance
--color-primary-tint: #CAD3FF;   // texto/label sobre fondos primarios
--color-selection: #DBEAFE;      // fila seleccionada en tablas
--color-bg: #F7F9FF;             // fondo de página y filas zebra alternas
--color-surface: #FFFFFF;        // cards, tablas, navbar, modales
--color-surface-alt: #F1F4FB;    // hover sutil, banda de footer del modal Income
--color-border: #E5E8EF;         // bordes de cards, divisores, thead
--color-border-input: #C4C5D7;   // bordes de inputs y botones de paginación
--color-border-row: #EEF1F8;     // divisor entre filas de tabla
--color-text: #181C21;
--color-text-muted: #516070;     // labels, subtítulos, thead
--color-text-secondary: #434655; // celdas secundarias (date, notes)
--color-disabled: #747686;
--color-success: #006A48;        // montos de ingresos y transacciones positivas
--color-danger: #BA1A1A;         // botón Remove, montos de gastos, banner de error

// Tipografía: 'Geist', sans-serif (pesos 400/500/600/700)
// Íconos: Material Symbols Outlined (add, delete, close, error, work, ...)
// Cifras monetarias SIEMPRE con font-variant-numeric: tabular-nums

// Radios
--radius-control: 8px;   // botones, inputs, card de tabla
--radius-card: 12px;     // stat cards y cards del dashboard
--radius-modal: 16px;
--radius-pagination: 6px;
--radius-full: 9999px;   // chips circulares de íconos, botón close

// Sombras
--shadow-card: 0 2px 4px rgba(29, 78, 216, 0.05);
--shadow-modal: 0 10px 15px rgba(0, 0, 0, 0.10);
// Overlay de modal: rgba(24, 28, 33, 0.5) + backdrop-filter: blur(2px)

// Layout
// contenedor máx 1280px centrado; padding main 24px 32px 48px; gap 24px
// navbar: 64px de alto, sticky, fondo blanco, borde inferior --color-border
// filas de tabla: 48px; columna checkbox: 48px; checkbox accent-color primario 16px
```

### 3.2 Especificación por pieza (lo que el mock define)

**Navbar** (compartida): marca "Expense Tracker" 24px/700 en `--color-primary`; 3 links
(Dashboard, Expenses, Incomes). Activo: color primario, peso 600, borde inferior 2px primario.
Inactivo: `--color-text-muted`, peso 400.

**Dashboard**: `h1` "Welcome!" 48px/700. Grid de 3 stat cards (radius 12px):
*Current Balance* (fondo `#1D4ED8`, texto blanco, label 12px uppercase en `--color-primary-tint`,
valor 32px/600) · *Total Income* (card blanca, valor en `--color-success`) · *Total Expenses*
(card blanca, valor en `--color-danger`). Debajo, card **Recent Transactions**: lista de
movimientos con ícono circular (`add`/`remove` sobre fondo tenue), título 14px/600, fecha
12px muted, monto con signo (`+$2,400.00` verde / `-$120.50` rojo) en tabular-nums.

**Vistas de lista** (Expenses e Incomes — MISMO patrón, un solo `EntityTable`):
encabezado con `h2` 32px/600 ("List of Expenses" / "List of Incomes") + subtítulo 14px muted
("Manage and track your recurring and one-time expenses." / "…income sources.");
botones a la derecha: **Add** primario (ícono `add`; en Incomes el label es "Add Income") y
**Remove** en `--color-danger` (ícono `delete`; deshabilitado sin selección: opacity 0.5 +
cursor not-allowed). Tabla dentro de card blanca radius 8px: thead 12px/500 uppercase muted,
filas 48px con divisor `--color-border-row`, zebra alterna en `--color-bg`, fila seleccionada
en `--color-selection`, checkboxes con accent primario, montos alineados a la derecha
(en Incomes en `--color-success`; en Incomes cada source lleva ícono circular). Footer de
paginación: "Showing X to Y of Z entries" + botones Prev/Next (borde `--color-border-input`,
radius 6px, deshabilitado con opacity 0.5).

**Modales** (`FormDialog`): overlay oscuro con blur; card 448px máx, radius 16px,
`--shadow-modal`; título 20px/600 + botón close circular; labels 12px/500 muted sobre inputs
(borde `--color-border-input`, radius 8px, padding 8×12, font 16px; focus: borde primario +
ring de 1px primario). *Add an Expense*: Title (placeholder "e.g. Grocery Shopping"),
Amount ($) numérico step 0.01 (placeholder "0.00"), Date (date picker nativo), Note (optional)
textarea de 3 filas. *Add an Income*: Source (placeholder "e.g. Freelance Project"),
Amount ($). Footer a la derecha: Cancel (botón de texto) + acción primaria
("Add Expense" / "Add Income").

**Banner de error** (global): franja roja `--color-danger` de 40px sobre la navbar, ícono
`error`, texto "Unable to reach the server. Try again.", botón close.

**Responsive** (el mock lo define): ≤900px stats en 2 columnas; ≤640px todo a 1 columna y
navbar apilada. Tablas con `overflow-x: auto` en su card.

**Normalización documentada**: el mock pinta el botón Remove de Incomes en gris
(`#EBEEF5`/`#747686`) mientras que en Expenses es rojo. Para mantener UN solo `EntityTable` y
proteger la métrica de duplicación, se normaliza al patrón de Expenses (Remove rojo con estado
deshabilitado) en ambas vistas. Registrado como desviación consciente del mock.

## 4. Estructura de carpetas

### 4.1 Organización del repositorio (monorepo)

El repo contiene el legado, el backend y el frontend en carpetas hermanas — una por
época/capa. El legado NO se borra (es el artefacto de comparación de la modernización y el
primer commit 03c759a lo preserva), pero se **mueve a `legacy/`** con `git mv` antes de crear
el frontend:

```
MISW4201-202613-Expense-Tracker-Grupo13/
├── legacy/                       # app Java Swing original, CONGELADA (solo lectura, nunca se edita)
│   ├── src/  ├── lib/  ├── data/
│   ├── checkstyle.xml  └── UML_Design_Diagram.png
├── backend/
│   ├── income-service/           # FastAPI + Lambda + income-table  (dev :8001)
│   └── expense-service/          # FastAPI + Lambda + expense-table (dev :8002)
├── frontend/                     # proyecto Angular (ng new frontend --style=scss --routing)
│   ├── CLAUDE.md                 # ← copiado del harness
│   ├── docs/                     # ← ARQUITECTURA.md, PARIDAD-Y-PRECONDICIONES.md
│   ├── proxy.conf.json           # proxy dev → 8001/8002 (mitiga CORS solo en dev, ver §11.1)
│   └── src/app/                  # estructura de 4.2
├── front_design/                 # Modern Ledger.html — definición visual (intocable)
├── 2026-07-23-harness-front/     # fuente del harness (archivo histórico tras la copia)
├── .claude/agents/               # validador-metricas (aplica a todo el repo)
└── README.md                     # mapa del monorepo y cómo correr cada parte
```

**Por qué `legacy/` y no la raíz** — es una decisión de MÉTRICA, no solo de orden: si el
Java queda suelto en la raíz, el análisis CodeScene del repo lo incluye y `ExpenseAppUI.java`
(7.78) aparecería como archivo en "Attention" en la medición final, rompiendo la meta con
código fuera del alcance. Con `legacy/` aislado, P4 configura los componentes CodeScene así:
`legacy/` (componente de referencia — muestra el antes/después dentro del mismo análisis),
`frontend/`, `backend/income-service/`, `backend/expense-service/` (componentes modernizados,
sobre los que se evalúan las metas ≥ 9.0 / 0 Attention / 0 duplicación, según §11.3).
Mover con `git mv` preserva el rastreo como renames, y la comparación declarada en la
Entrega 2 es por métricas estáticas, así que el movimiento no daña ningún análisis.

### 4.2 Estructura interna del proyecto Angular

```
src/app/
  core/                      # singleton, se importa una sola vez
    api/                     # UN servicio HTTP por recurso del contrato
      dashboard-api.service.ts
      expenses-api.service.ts
      incomes-api.service.ts
    interceptors/            # base URL, manejo de errores HTTP
    models/                  # interfaces TS espejo de los esquemas OpenAPI
  shared/                    # componentes reutilizables SIN lógica de negocio
    entity-table/            # tabla genérica con selección y paginación (pieza anti-duplicación)
    form-dialog/             # modal de formulario genérico
    confirm-dialog/          # modal de confirmación de borrado
    stat-card/               # tarjeta de cifra del dashboard
    transaction-list/        # lista "Recent Transactions" del dashboard
    error-banner/            # franja roja global de error
    empty-state/             # estado vacío de listas
  features/                  # una carpeta por ruta; lazy-loaded
    dashboard/
    expenses/
    incomes/
  app.routes.ts              # /dashboard  /expenses  /incomes
```

Regla de dependencias: `features → shared → core`. Nunca al revés, y nunca feature → feature.
**No existe (ni existirá) nada de goals en este árbol.**

## 5. La pieza anti-duplicación: `EntityTable`

En el legado, `ExpensesPanel` e `IncomePanel` eran copias casi idénticas del mismo patrón
(título + botones + JTable + selección) — ahí vivía la duplicación que CodeScene marcó.
Aquí ese patrón existe **una sola vez**, con el estilo del mock ya incorporado:

```html
<app-entity-table
  [columns]="columns"          <!-- [{ key, header, align?, format? ('currency'|'text'), icon? }] -->
  [rows]="items()"             <!-- signal del servicio del feature -->
  [selectable]="true"          <!-- checkboxes multi-selección -->
  [pageSize]="5"               <!-- paginación en cliente (footer "Showing X to Y of Z entries") -->
  (selectionChange)="onSelection($event)" />
```

Cada feature aporta: configuración de columnas, su servicio de datos y los handlers de los
botones. Nada más. Si al construir un feature sientes la tentación de copiar la tabla "porque
esta vista es un poquito distinta", la respuesta es extender `EntityTable` con una opción, no
duplicarla. Lo mismo aplica a `FormDialog` (Add an Expense / Add an Income) y `ConfirmDialog`.

## 6. Flujo de datos por feature

```
Componente (presentación, signals)
   └── FeatureService (estado del feature: signal<T[]>, loading, error)
         └── XApiService de core/api (HttpClient tipado contra el contrato)
               └── Interceptores (baseUrl por environment, errores → error-banner)
```

- Tras una mutación exitosa, el `FeatureService` actualiza su signal con la respuesta del API.
- Errores HTTP: el interceptor los traduce a un estado que `error-banner` muestra
  ("Unable to reach the server. Try again."); sin reintentos automáticos.

## 7. Mapa legado → Angular (ancla de paridad)

| Legado (Java Swing) | Nuevo (Angular) |
|---|---|
| `Main.java` → `ExpenseAppUI` (JFrame) | `main.ts` → `AppComponent` (shell con navbar) |
| `JTabbedPane` con 4 pestañas | Router con **3 rutas** + navbar superior |
| `Dashboard` (inner class) | `features/dashboard` — compone `balance = totalIncome − totalExpenses` desde los dos microservicios (única lógica permitida en el front) |
| `ExpensesPanel` (inner class) | `features/expenses` = `EntityTable` + Add/Remove |
| `IncomePanel` (inner class) | `features/incomes` = `EntityTable` + Add/Remove |
| `GoalsPanel` (inner class) | **DESCARTADO** — decisión unánime del equipo (2026-07-24); no se migra |
| `JOptionPane` (popups de alta/confirmación) | `FormDialog` / `ConfirmDialog` compartidos |
| `Ledger` (balance y reglas) | **Backend** (el front no replica esta lógica) |
| `JsonReader`/`JsonWriter`/`data.json` | Servicios HTTP contra el API (persistencia automática en servidor) |
| Menú File → New/Load/Save | Obsoleto: la persistencia es automática por request. Ver decisiones pendientes |
| `EventLog`/`Event` (log en consola al salir) | Fuera del alcance del front (observabilidad = CloudWatch en backend) |
| — (no existía) | Paginación de tablas y "Recent Transactions": elementos nuevos definidos por el mock |

## 8. Contrato API REAL (fuente de verdad: el código en `backend/` — verificado 2026-07-24)

El backend ya existe; este contrato NO es propuesta, es lo implementado. Ante cualquier duda,
**leer el código del backend** (`backend/*/app/routers/`, `backend/*/app/models/schemas.py`)
— nunca inventar ni suponer.

### income-service (dev local: puerto 8001)

| Método y ruta | Respuesta | Notas |
|---|---|---|
| `POST /incomes` | `201` → `{id, source, amount, date}` | body: `{source, amount}`. **La fecha NO se envía: el servidor la sella** (ISO UTC) |
| `GET /incomes` | `200` → `IncomeOut[]` | |
| `GET /incomes/total` | `200` → `{total}` | insumo del balance del dashboard |
| `GET /incomes/{id}` | `200` / `404 {"detail": "Income not found"}` | |
| `DELETE /incomes/{id}` | `200` → **el objeto eliminado** / `404` | no es 204 |
| `GET /health` | `{"status": "ok"}` | |

### expense-service (dev local: puerto 8002)

| Método y ruta | Respuesta | Notas |
|---|---|---|
| `POST /expenses` | `201` → `{id, title, amount, date, note}` | body: `{title, amount, date, note?}`; `date` tipo `date` ISO; `note` opcional (default `""`) |
| `GET /expenses` | `200` → `ExpenseOut[]` | |
| `GET /expenses/total` | `200` → `{total}` | insumo del balance del dashboard |
| `GET /expenses/{id}` | `200` / `404 {"detail": "Expense not found"}` | |
| `DELETE /expenses/{id}` | `200` → **el objeto eliminado** / `404` | no es 204 |
| `GET /health` | `{"status": "ok"}` | |

### Validaciones Pydantic del backend (espejo para los formularios)

| Campo | Regla backend |
|---|---|
| `title` / `source` | requerido, `min_length=1`, `max_length=200` |
| `amount` | requerido, `ge=0` (el front es MÁS estricto: `> 0`, fiel a `Expense.java`; discrepancia registrada) |
| `date` (expense) | tipo `date` ISO requerido |
| `note` | opcional, `max_length=500`, default `""` |

Errores: `422` de FastAPI/Pydantic (array `detail` con `loc`/`msg` por campo — el front lo
mapea al formulario); `404` con `{"detail": string}`; `5xx`/red → `error-banner` genérico.

**Sin goals, sin `/dashboard`, sin `/import`, sin batch**: eliminación múltiple = N `DELETE`
individuales en paralelo tras una única confirmación. "Recent Transactions" del dashboard se
deriva en el front mezclando `GET /expenses` + `GET /incomes` ordenados por fecha (los últimos
N) — no hay endpoint que lo entregue.

## 9. Entornos y despliegue

- Hay **dos base URLs** (una por microservicio). En `environment`:
  `incomeApiUrl` y `expenseApiUrl`.
- `environment.development.ts` → backend local real: `http://localhost:8001` (incomes) y
  `http://localhost:8002` (expenses), con `uvicorn` según `backend/README.md`. Ya no se
  necesita mock Prism: el backend existe.
- `environment.ts` (prod) → URLs de API Gateway de cada Lambda.
- Cada servicio de `core/api/` toma su base URL del environment; el interceptor no adivina
  rutas.
- Build de producción → S3 + CloudFront (pipeline responsabilidad de P3·Infra). El front solo
  garantiza: rutas del Router funcionan con fallback a `index.html`, assets con hash.
- Fuente Geist e íconos Material Symbols: empaquetados localmente en el build (self-hosted),
  no desde CDN — CloudFront los sirve con el resto de assets.

## 10. Calidad: gates automáticos (el brazo enforcement del harness)

Los `.md` dicen la regla; estos gates la hacen inescapable en CI. Configurar desde el primer
commit, no al final:

```jsonc
// ESLint (proxy local de los factores de Code Health de CodeScene)
"complexity": ["error", 8],
"max-lines": ["error", 250],
"max-lines-per-function": ["error", 30],
"max-depth": ["error", 3],
"max-params": ["error", 4]
```

- `jscpd` con umbral 0 % de duplicados sobre `src/` (protege la métrica de 0 duplicación).
- CI (por P3): `lint` + `test` + `jscpd` obligatorios en cada PR; CodeScene analiza el repo
  con el componente del frontend.

## 11. Correcciones acordadas (ADR-lite) — qué se hace y POR QUÉ

Registradas el 2026-07-24, **antes** de la implementación del front y de la medición final —
el timing es parte de la decisión: son adjudicaciones declaradas a priori, no excusas a
posteriori. Cuando se implemente la arquitectura, estas tres correcciones deben entenderse
así:

### 11.1 CORS: habilitar `CORSMiddleware` en cada microservicio FastAPI

- **Problema**: ninguno de los dos FastAPI configura CORS. La política same-origin del
  navegador bloqueará toda petición de la SPA (localhost:4200 → 8001/8002 en dev;
  CloudFront → API Gateway en prod, son orígenes distintos). El backend no lo ha notado
  porque pytest/Postman/Swagger no pasan por un navegador — el fallo aparecería en la
  primera integración real, como error críptico en consola.
- **Decisión**: agregar `CORSMiddleware` en `app/main.py` de AMBOS servicios, con
  `allow_origins` explícito leído de variable de entorno (dev: `http://localhost:4200`;
  prod: el dominio de CloudFront). Prohibido `allow_origins=["*"]`.
- **Por qué en FastAPI y no en API Gateway**: la alternativa de resolverlo en el gateway no
  cubre el desarrollo local (contra uvicorn no hay gateway → seguiría bloqueado en dev y se
  necesitaría el middleware igual); en cambio el middleware funciona idéntico en dev y prod,
  vive junto al código que otorga el permiso, y FastAPI maneja solo el preflight `OPTIONS`.
- **Costo aceptado**: ~5 líneas más duplicadas entre los dos servicios (cubiertas por la
  excepción de 11.3); si algún día front y API comparten dominio tras CloudFront, el
  middleware queda redundante (inofensivo).
- **Ejecuta**: P1. Mientras llega, el front desarrolla con proxy del Angular CLI
  (`proxy.conf.json` → 8001/8002), que evita CORS solo en dev; NO es la solución de prod.

### 11.2 Validación de monto: alinear backend a `gt=0` (rechazar monto 0)

- **Problema**: el backend valida `amount ge=0` (acepta $0) y el front `min(0.01)` (exige
  > 0). No es un descuido de nadie: **el legado se contradecía a sí mismo** —
  `Expense.java: REQUIRES amount > 0` vs `Ledger.java: REQUIRES amount >= 0` — y cada capa
  moderna copió un REQUIRES distinto. La discrepancia de hoy es la fotocopia de una
  inconsistencia de especificación del legado.
- **Decisión**: adjudicar la contradicción a favor de la **clase de dominio** (`Expense.java`,
  la fuente más específica): un movimiento de $0 no es un movimiento. Backend cambia `ge=0`
  → `gt=0` en los schemas de ambos servicios; el front mantiene `min(0.01)`.
- **Por qué importa**: la validación del front es cortesía (se salta con `curl`); la del
  backend es ley. Si discrepan, la verdad efectiva del sistema es la más laxa — hoy el
  sistema real acepta gastos de $0 que la UI jamás permitiría crear. Además, la métrica
  "100 % precondiciones ejecutables" exige que el REQUIRES canónico (`> 0`) se ejecute en
  ambas líneas de defensa, no a medias.
- **Costo aceptado**: cambia el comportamiento observable del API (un `{"amount": 0}` que
  antes recibía 201 ahora recibe 422) — sin impacto porque aún no hay consumidores.
- **Ejecuta**: P1 (2 caracteres × 2 archivos). Si se rechaza o se aplaza, el front sigue
  siendo la línea estricta y esta discrepancia queda registrada como conocida (PARIDAD §3).

### 11.3 Duplicación espejo entre microservicios: excepción documentada + medición por componente

- **Problema**: `income-service` y `expense-service` son espejos estructurales (mismo
  `dynamo_client.py`, routers y schemas paralelos) por la decisión deliberada de
  independencia ("no comparten tabla ni código"). CodeScene no lee intenciones: marcará esa
  similitud como duplicación entre módulos, amenazando la meta declarada "0 duplicación".
- **La tensión real**: chocan dos principios correctos. *Share-nothing* de microservicios
  (independencia total de despliegue; evitar el acoplamiento por librería común que produce
  "monolitos distribuidos") contra DRY/la métrica. Y las dos duplicaciones NO son la misma
  enfermedad: la del legado (paneles Swing en el mismo proceso, mismo compilado) era descuido
  con costo directo; la de los microservicios es **redundancia deliberada, precio pagado por
  independencia** — "prefer duplication over the wrong abstraction".
- **Decisión**: NO extraer librería compartida (contradiría la decisión arquitectónica del
  equipo, acoplaría los despliegues y re-empaquetaría ambas Lambdas a esta altura del
  calendario). En su lugar: (a) este ADR declara la excepción; (b) P4 configura CodeScene con
  componentes separados — `frontend/`, `backend/income-service/`, `backend/expense-service/`
  (coherente con la medición por componentes de la línea base de la Entrega 2); (c) la meta
  "0 duplicación" se interpreta como **0 duplicación DENTRO de cada componente**.
- **Alcance estricto de la excepción**: cubre ÚNICAMENTE el espejo entre los dos
  microservicios. Dentro de cada servicio, y en TODO el frontend, el 0 sigue siendo 0
  absoluto. El agente `validador-metricas` refleja exactamente esto: espejo entre servicios
  = WARN arquitectónico reportado siempre; cualquier otra duplicación = FAIL bloqueante.
- **Costo aceptado (decirlo da credibilidad, no quitarla)**: la duplicación real sigue
  existiendo con su costo real — un bug en `dynamo_client.py` se corrige dos veces. Es un
  trade-off asumido, no un problema ignorado.
- **Ejecuta**: equipo (acta de la decisión) + P4 (configuración de componentes en CodeScene),
  ANTES de la medición final.

## 12. Decisiones resueltas y pendientes menores

**Resueltas por el backend real (2026-07-24):**
- ~~`recentTransactions`~~ → lo deriva el front (no hay endpoint de dashboard).
- ~~Longitudes máximas~~ → title/source 200, note 500 (Pydantic).
- ~~Batch delete~~ → no existe; N `DELETE` individuales.
- ~~Mock Prism~~ → innecesario; backend local real con uvicorn (8001/8002).

**Pendientes menores:**
1. Tamaño de página de `EntityTable` (el mock muestra 5; confirmar o parametrizar).
2. ¿Se expone en UI un "reset" equivalente al menú File → New del legado? (requiere endpoint).
