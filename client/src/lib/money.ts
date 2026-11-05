// Money is integer satang everywhere (15500 = ฿155.00). Integer math only, no float rounding.
export function formatBaht(satang: number): string {
  const baht = Math.trunc(satang / 100);
  const rest = String(satang % 100).padStart(2, "0");
  return `฿${baht}.${rest}`;
}
