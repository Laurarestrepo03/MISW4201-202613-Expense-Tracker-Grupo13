/**
 * Traduce el 422 de FastAPI/Pydantic (array detail con loc/msg por campo)
 * a un mapa campo → mensaje que FormDialog aplica al formulario (§8).
 */
export function fieldErrorsFrom(error: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  for (const item of detailOf(error)) {
    const entry = entryOf(item);
    if (entry) {
      result[entry.key] = entry.message;
    }
  }
  return result;
}

function detailOf(error: unknown): unknown[] {
  const detail = (error as { error?: { detail?: unknown } })?.error?.detail;
  return Array.isArray(detail) ? detail : [];
}

function entryOf(item: unknown): { key: string; message: string } | null {
  const { loc, msg } = (item ?? {}) as { loc?: unknown; msg?: unknown };
  const path = Array.isArray(loc) ? loc : [];
  const key = String(path[path.length - 1] ?? '');
  return key ? { key, message: String(msg ?? 'Invalid value') } : null;
}
