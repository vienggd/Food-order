// Baht text ("55", "55.5", "55.00") to integer satang, or an error message. Integer maths only.
export function bahtToSatang(text: string): { satang: number } | { error: string } {
  const m = /^(\d{1,4})(?:\.(\d*))?$/.exec(text.trim());
  if (!m) return { error: "Enter a price between ฿0.01 and ฿1,000.00." };
  const dec = m[2] ?? "";
  if (dec.length > 2) return { error: "Use at most 2 decimal places." };
  const satang = Number(m[1]) * 100 + Number(dec.padEnd(2, "0"));
  if (satang < 1 || satang > 100000) return { error: "Enter a price between ฿0.01 and ฿1,000.00." };
  return { satang };
}
