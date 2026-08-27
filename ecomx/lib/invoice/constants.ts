import type { InvoiceTerm } from "@/types/invoice.types";

export const INVOICE_COMPANY = {
  nameEn: "Skynet Solution W.L.L",
  nameAr: "سكاي نت سوليوشن ذ.م.م",
  taglineEn: "POS Hardware · ERP Software · IT Solutions",
  taglineAr: "أجهزة نقاط البيع · برمجيات ERP · حلول تقنية",
  addressEn: "Doha, Qatar",
  addressAr: "الدوحة، قطر",
  phone: "+974 4431 1525",
  whatsapp: "+974 4431 1525",
  email: "info@skynetintegration.com",
  website: "www.skynetqatar.com",
  brands: "Honeywell · Zebra · Datalogic · Synology · atACC · ZKTeco · Star Micronics",
};

export const INVOICE_BANK = {
  name: "Qatar National Bank (QNB)",
  beneficiary: "Skynet Solution W.L.L",
  iban: "QA12QNBA000000000261295520001",
  swift: "QNBAQAQAXXX",
  currency: "QAR",
};

export const SALES_TERMS: InvoiceTerm[] = [
  { en: "Returns accepted only in original condition with complete packaging.", ar: "يتم قبول المرتجعات فقط في حالتها الأصلية مع التغليف الكامل." },
  { en: "Replacement within 14 days for defective items from invoice date.", ar: "استبدال المنتجات المعيبة خلال 14 يوماً من تاريخ الفاتورة." },
  { en: "Custom or special-order items are non-returnable.", ar: "المنتجات المخصصة أو الطلبات الخاصة غير قابلة للإرجاع." },
  { en: "Product specs may vary slightly from catalogue images.", ar: "قد تختلف المواصفات قليلاً عن صور الكatalog." },
  { en: "Inspect goods upon delivery; report damage immediately.", ar: "افحص البضائع عند التسليم وأبلغ عن أي ضرر فوراً." },
  { en: "Installation quoted separately unless stated on invoice.", ar: "خدمات التركيب تُسعّر منفصلة ما لم تُذكر في الفاتورة." },
  { en: "Quotations valid for 7 calendar days only.", ar: "عروض الأسعار صالحة لمدة 7 أيام تقويمية فقط." },
  { en: "Third-party compatibility is the customer's responsibility.", ar: "توافق أنظمة الطرف الثالث على مسؤولية العميل." },
  { en: "Data handled per applicable Qatar privacy regulations.", ar: "البيانات تُعالج وفق لوائح الخصوصية في قطر." },
  { en: "Disputes subject to jurisdiction of Qatar courts.", ar: "النزاعات تخضع لاختصاص محاكم قطر." },
];

export const PAYMENT_TERMS: InvoiceTerm[] = [
  { en: "100% advance payment unless agreed otherwise in writing.", ar: "دفع 100% مقدماً ما لم يُتفق كتابياً على خلاف ذلك." },
  { en: "Refunds processed within 3 business days when approved.", ar: "المبالغ المستردة تُعالج خلال 3 أيام عمل عند الموافقة." },
  { en: "Uncollected goods stored 30 days; 5% fee applies after.", ar: "تخزين البضائع غير المستلمة 30 يوماً ثم رسوم 5%." },
  { en: "Payments payable to Skynet Solution W.L.L only.", ar: "المدفوعات لصالح سكاي نت سوليوشن ذ.م.م فقط." },
  { en: "Bank transfer charges borne by the customer.", ar: "رسوم التحويل البنكي على العميل." },
];

export const DELIVERY_TERMS: InvoiceTerm[] = [
  { en: "Original invoice required for warranty claims.", ar: "الفاتورة الأصلية مطلوبة لمطالبات الضمان." },
  { en: "Verify delivery at receipt; note shortages on delivery slip.", ar: "تحقق عند الاستلام؛ اذكر النقص في إيصال التسليم." },
  { en: "Site must have access, power, and network before install.", ar: "الموقع يجب أن يكون جاهزاً للوصول والكهرباء والشبكة." },
  { en: "Returns delivered to warehouse by customer.", ar: "المرتجعات تُسلّم للمستودع من قبل العميل." },
  { en: "No returns accepted after 3 days from delivery.", ar: "لا يُقبل الإرجاع بعد 3 أيام من التسليم." },
  { en: "Customer responsible for compatibility and site readiness.", ar: "العميل مسؤول عن التوافق وجاهزية الموقع." },
  { en: "Sign delivery slip; unsigned = accepted after 24 hours.", ar: "وقّع إيصال التسليم؛ بدون توقيع = مقبول بعد 24 ساعة." },
];

export const INVOICE_WARRANTY =
  "Warranty: 12-month service warranty from invoice date. Does not cover physical damage, misuse, or external factors.";

export function invoiceNumberFromOrder(orderNumber: string): string {
  const year = new Date().getFullYear();
  const seq =
    orderNumber.replace(/\D/g, "").slice(-5).padStart(5, "0") || "00001";
  return `INV/${year}/${seq}`;
}
