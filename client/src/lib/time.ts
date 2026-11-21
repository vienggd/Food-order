const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n: number) => String(n).padStart(2, "0");
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

// Local time as in docs/ui/ui-spec.md: today "10:15", yesterday "Yesterday 12:02", older "3 Nov 09:40".
export function formatPlacedTime(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (sameDay(d, now)) return hm;
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (sameDay(d, yesterday)) return `Yesterday ${hm}`;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${hm}`;
}
