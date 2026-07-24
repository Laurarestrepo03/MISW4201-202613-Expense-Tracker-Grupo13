/**
 * Traduce el 422 de FastAPI/Pydantic (array detail con loc/msg por campo)
 * a un mapa campo → mensaje que FormDialog aplica al formulario (§8).
 */
export function fieldErrorsFrom(error: unknown): Record<string, string> {
  const detail = (error as { error?: { detail?: unknown } })?.error?.detail;
  if (!Array.isArray(detail)) {
    return {};
  }
  const result: Record<string, string> = {};
  for (const item of detail) {
    const loc: unknown[] = Array.isArray(item?.loc) ? item.loc : [];
    const key = String(loc[loc.length - 1] ?? '');
    if (key) {
      result[key] = String(item?.msg ?? 'Invalid value');
    }
  }
  return result;
}
