export function generateRandomNumberId() {
  return Math.floor(Math.random() * 100000000000) + 1;
}

export function formatDisplayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '' || value === '—') return '—';
  const str = String(value);
  const match = str.match(/^([^0-9-]*)(-?\d+(?:\.\d+)?)(.*)$/);
  if (!match) return str;
  const [, prefix, num, suffix] = match;
  const parsed = parseFloat(num);
  if (isNaN(parsed)) return str;
  const formatted = parsed.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return `${prefix}${formatted}${suffix}`;
}
