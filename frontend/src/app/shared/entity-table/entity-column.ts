/** Configuración de columna de EntityTable (ARQUITECTURA §5). */
export interface EntityColumn {
  key: string;
  header: string;
  align?: 'left' | 'right';
  format?: 'currency' | 'date' | 'text';
  /** Ícono Material Symbols en chip circular antes del valor (sources de Incomes). */
  icon?: string;
  /** Montos en verde (Incomes), según §3.2. */
  tone?: 'success';
  /** Celda secundaria (date, notes) en --color-text-secondary. */
  secondary?: boolean;
}

/** Fila mínima que acepta la tabla: cualquier recurso con id. */
export interface EntityRow {
  id: string;
}
