/**
 * Valor para <input type="datetime-local" /> (interpretación en hora LOCAL del navegador).
 * No usar `new Date().toISOString().slice(0, 16)` como mínimo/valor: eso es UTC y desplaza horas.
 */
export function toDatetimeLocalValue(d: Date): string {
  const z = new Date(d);
  z.setMinutes(z.getMinutes() - z.getTimezoneOffset());
  return z.toISOString().slice(0, 16);
}

/** Convierte "YYYY-MM-DDTHH:mm" (o con segundos) del datetime-local (local) a ISO UTC para la API. */
export function datetimeLocalToIsoUtc(value: string): string {
  const m = value?.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return new Date(value).toISOString();
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const h = Number(m[4]);
  const mi = Number(m[5]);
  const sec = m[6] !== undefined ? Number(m[6]) : 0;
  return new Date(y, mo - 1, d, h, mi, sec, 0).toISOString();
}
