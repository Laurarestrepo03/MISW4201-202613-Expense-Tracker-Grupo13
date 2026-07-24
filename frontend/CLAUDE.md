# CLAUDE.md — Frontend Angular · Expense Tracker modernizado

## Contexto (leer primero)

Este es el frontend Angular de la modernización del **CPSC 210 Expense Tracker** (legado Java Swing,
curso MISW Modernización de Software, Grupo 13). Es una **migración total** con paridad funcional
del alcance migrado: la lógica de referencia es la del legado, documentada en
`docs/PARIDAD-Y-PRECONDICIONES.md`. La estructura, decisiones técnicas, el mapa legado → Angular
y los design tokens están en `docs/ARQUITECTURA.md`.

**Lee ambos documentos antes de crear o modificar cualquier componente.** No son opcionales:
son el contrato de este repositorio.

**El backend YA EXISTE** en `backend/` de este repo: dos microservicios FastAPI independientes
(`income-service` puerto 8001, `expense-service` puerto 8002), cada uno con su Lambda y su
tabla DynamoDB. Su contrato real está transcrito en `docs/ARQUITECTURA.md` §8. Ante cualquier
duda sobre un endpoint, campo o código de estado: **leer el código del backend
(`backend/*/app/routers/`, `backend/*/app/models/schemas.py`) — nunca inventar ni suponer.**
El backend no se modifica desde el trabajo de front; si algo falta (p. ej. CORS), se levanta
al equipo.

## Alcance (decisión unánime del equipo, 2026-07-24)

- **La funcionalidad de Saving Goals queda DESCARTADA** — no se migra. No crear componentes,
  servicios, rutas, modelos ni tests de goals bajo ninguna circunstancia.
- Lo que SÍ se construye: **Dashboard** (solo lectura), **CRUD de Expenses** y **CRUD de Incomes**.
  Tres rutas, nada más.
- El contrato OpenAPI es del equipo: el front **no lo modifica**. Si falta algo, se documenta y se
  levanta al equipo — no se improvisa un endpoint.
- Nada nuevo fuera de la lista de paridad sin acuerdo del equipo.
- El código legado Java (carpeta `legacy/` del repo) es **solo lectura**: sirve como
  referencia de paridad; jamás se edita, se compila ni se importa nada de él.

## Diseño (fuente de verdad visual)

- El diseño final está en **`front_design/Modern Ledger.html`** (raíz del repo). Ese archivo es la
  **definición visual, NO la implementación**: es un prototipo empaquetado con estilos inline.
- **PROHIBIDO copiar su HTML, JS o estilos inline** al código Angular — replicar ese markup
  monolítico destruiría Code Health y la métrica de duplicación.
- La traducción correcta: tokens SCSS + especificación de componentes en
  `docs/ARQUITECTURA.md` §3 (Diseño). Si un detalle visual no está ahí, se consulta el mock,
  se extrae como token/regla, y se agrega al doc — nunca se hardcodea.
- Tipografía **Geist**, íconos **Material Symbols Outlined**, primario `#0037B0`
  (hover `#1D4ED8`). Paleta completa en ARQUITECTURA.

## Métricas que gobiernan este código (no negociables)

El éxito de la modernización se mide con CodeScene y una prueba de carga. El recorte de alcance
(sin goals) **no relaja ninguna métrica** — aplican igual sobre todo el código que exista:

1. **Code Health ≥ 9.0** y **0 archivos en nivel "Attention"** (línea base del legado: 9.02 global,
   peor archivo `ExpenseAppUI.java` en 7.78).
2. **0 duplicación de código** entre módulos (el legado tenía 23 funciones duplicadas).
3. **100 % de precondiciones ejecutables** sobre el alcance migrado (PRE-01 a PRE-06 de la tabla;
   las de goals quedaron descartadas junto con la funcionalidad).
4. La prueba de carga del backend (`POST /expenses`, latencia promedio ≤ 1 s) **no debe ser
   afectada** por el comportamiento del front.

## Reglas duras (derivadas de las métricas)

- Funciones ≤ 25 líneas · complejidad ciclomática ≤ 8 · anidamiento ≤ 3 · ≤ 4 parámetros.
- Archivos ≤ 250 líneas. Si un componente va a crecer más, divídelo ANTES de continuar.
- **PROHIBIDO copiar-pegar entre features.** Las dos vistas de lista (Expenses, Incomes) usan el
  componente compartido `EntityTable`; los modales usan `FormDialog` / `ConfirmDialog`
  compartidos. El legado degradó su salud con paneles Swing casi idénticos (`ExpensesPanel`,
  `IncomePanel`, `GoalsPanel`): con dos listas el riesgo de duplicar es el mismo — no lo repitas.
- **No recrear un `ExpenseAppUI`**: ninguna clase orquesta todas las vistas. Cada feature es
  autónoma; la composición la hace el Router.
- Componentes = presentación. **PROHIBIDO `HttpClient` en componentes**: siempre a través de un
  servicio de `core/api/` inyectado (DI).
- Validaciones SOLO desde la tabla de `docs/PARIDAD-Y-PRECONDICIONES.md` (espejo del contrato
  OpenAPI). No inventes reglas ni omitas ninguna. Cada validador tiene su test unitario.
- Estilos con design tokens (variables SCSS/CSS definidas en un solo lugar); prohibido hardcodear
  colores o tamaños dentro de componentes.
- Sin lógica de negocio en el front, con UNA excepción documentada (ARQUITECTURA §1): como los
  microservicios son independientes y no existe endpoint de dashboard, el servicio del feature
  dashboard compone `balance = totalIncome − totalExpenses` (de `/incomes/total` y
  `/expenses/total`) y mezcla las "Recent Transactions" de las dos listas. Nada más: cualquier
  otra regla vive en el backend.

## Textos de interfaz

En inglés, exactamente como el mock: "Welcome!", "Current Balance", "Total Income",
"Total Expenses", "Recent Transactions", "List of Expenses", "List of Incomes", "Add",
"Add Income", "Add an Expense", "Add an Income", "Remove", "Cancel".
Formato de moneda: en-US, 2 decimales, separador de miles (`$55,000.00`), cifras tabulares.

## Escalabilidad (no estorbar la prueba de carga)

- 1 acción de usuario = 1 request. Deshabilitar el botón de submit mientras hay una petición en
  vuelo (evita dobles POST).
- Sin polling, sin reintentos automáticos, sin prefetch agresivo.
- Tras una mutación, actualizar el estado local con la respuesta del API; re-fetch de la lista
  solo cuando la vista lo necesita.
- Paginación de tablas: en cliente, dentro de `EntityTable` (los datos son pequeños; no genera
  requests extra).
- Assets estáticos con hash en el nombre (build por defecto) para caché de CloudFront.

## Flujo de trabajo

- Antes de dar por terminada CUALQUIER tarea: `npm run lint` y `npm test` en verde. Si tocaste
  configuración o rutas, también `npm run build`.
- **Validación de métricas obligatoria**: al terminar cada feature (o cambio sustancial),
  invoca el subagente **`validador-metricas`** (definido en `.claude/agents/`) para auditar lo
  construido contra las métricas objetivo (CodeScene y escalabilidad). Todo FAIL que reporte
  se corrige ANTES de dar la tarea por terminada; los WARN se anotan y se comunican. Nunca
  cierres una tarea con FAILs abiertos.
- Commits pequeños: un feature o fix por commit.
- Si una instrucción puntual entra en conflicto con este archivo, avisa antes de romper la regla.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm ci` | instalar dependencias |
| `npm start` | dev server (apunta al mock o API según `environment`) |
| `npm run lint` | ESLint con gates de complejidad/tamaño + detección de duplicados |
| `npm test` | unit tests en modo headless (una pasada, sin watch) |
| `npm run build` | build de producción |
