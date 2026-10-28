export const toArabicNum = (n: number, opts?: Intl.NumberFormatOptions): string =>
  n.toLocaleString("ar-SA", opts);

export const toArabicCurrency = (n: number): string =>
  `${toArabicNum(n)} ر.س`;

export const partStatus = (stock: number, minStock: number): string =>
  stock === 0 ? "نفاد" : stock < minStock ? "منخفض" : "متوفر";
