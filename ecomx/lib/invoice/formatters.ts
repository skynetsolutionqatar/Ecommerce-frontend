const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function chunkWords(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ONES[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const r = n % 10;
    return `${TENS[t]}${r ? ` ${ONES[r]}` : ""}`.trim();
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const r = n % 100;
    return `${ONES[h]} Hundred${r ? ` ${chunkWords(r)}` : ""}`.trim();
  }
  const th = Math.floor(n / 1000);
  const r = n % 1000;
  return `${chunkWords(th)} Thousand${r ? ` ${chunkWords(r)}` : ""}`.trim();
}

export function amountToWords(amount: number): string {
  const n = Math.round(Number(amount ?? 0));
  return `${chunkWords(n)} Riyal${n === 1 ? "" : "s"}`;
}

export function fmtMoney(amount: number, currency = "QAR"): string {
  return `${Number(amount ?? 0).toFixed(2)} ${currency}`;
}

export function fmtInvoiceDate(date?: string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
