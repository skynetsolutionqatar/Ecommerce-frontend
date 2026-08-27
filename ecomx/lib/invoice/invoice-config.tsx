/**
 * Skynet Solution Qatar — Invoice Configuration
 * Add this file at: lib/invoice/invoice-config.ts
 */

import type { InvoiceCompany, InvoiceBank, InvoiceTerms } from "@/types/invoice.types";

// ─── Company ──────────────────────────────────────────────────────────────────
export const SKYNET_COMPANY: InvoiceCompany = {
  nameEn:    "Skynet Solution Qatar",
  nameAr:    "سكاي نت سوليوشن قطر",
  taglineEn: "POS Systems · ERP Software · IT Hardware",
  taglineAr: "أنظمة نقاط البيع · برامج تخطيط الموارد · معدات تقنية",
  addressEn: "Doha, State of Qatar",
  addressAr: "الدوحة، دولة قطر",
  phone:     "+974 4431 1525",
  whatsapp:  "+974 4431 1525",
  email:     "info@skynetqatar.com",
  website:   "www.skynetqatar.com",
};

// ─── QNB Bank ─────────────────────────────────────────────────────────────────
export const SKYNET_BANK: InvoiceBank = {
  name:        "Qatar National Bank (QNB)",
  beneficiary: "Skynet Solution",
  account:     "0261295520001",
  iban:        "QA12 QNBA 0000 0000 0261 2955 2000 1",
  swift:       "QNBAQAQAXXX",
  currency:    "QAR – Qatari Riyal",
};

// ─── Terms & Conditions ───────────────────────────────────────────────────────
export const SKYNET_TERMS: InvoiceTerms = {
  warranty:
    "Warranty: All products carry a 12-month service warranty from invoice date. " +
    "Warranty is void in cases of physical damage, misuse, accidents, or external factors " +
    "beyond Skynet Solution's control.",

  sales: [
    {
      en: "Items must be returned in original condition and packaging. Damaged, used, or tampered goods will not be accepted.",
      ar: "يجب إعادة المنتجات بحالتها الأصلية وتغليفها. لن تُقبل البضائع التالفة أو المستعملة أو المفتوحة.",
    },
    {
      en: "Replacements are available within 14 days at actual value. Configured or software-activated devices are non-returnable.",
      ar: "يمكن استبدال المنتجات خلال 14 يومًا بقيمتها الفعلية. الأجهزة المُهيأة أو المُفعّلة ببرامج غير قابلة للإرجاع.",
    },
    {
      en: "Customers must inspect all devices upon delivery and report any physical damage or missing items immediately.",
      ar: "يجب على العملاء فحص الأجهزة فور الاستلام والإبلاغ عن أي تلف أو نقص في الحال.",
    },
    {
      en: "Once installed, mounted, or activated, returns or defect claims will not be accepted unless covered by warranty.",
      ar: "بعد التثبيت أو التركيب أو التفعيل، لن تُقبل طلبات الإرجاع إلا إذا كانت مشمولة بالضمان.",
    },
    {
      en: "Quotations and orders are valid for 7 days from issue date.",
      ar: "تسري عروض الأسعار والطلبات لمدة 7 أيام من تاريخ الإصدار.",
    },
    {
      en: "Skynet Solution is not responsible for compatibility issues with third-party software or hardware configurations.",
      ar: "لا تتحمل سكاي نت سوليوشن مسؤولية مشاكل التوافق مع برامج أو معدات طرف ثالث.",
    },
    {
      en: "Warranty covers manufacturer defects only and does not include accidental damage or improper usage.",
      ar: "يغطي الضمان عيوب الصنع فقط ولا يشمل الأضرار العرضية أو سوء الاستخدام.",
    },
    {
      en: "Customer information is kept strictly confidential and will not be shared with any third party.",
      ar: "تُحفظ معلومات العميل بسرية تامة ولن تُشارك مع أي طرف ثالث.",
    },
    {
      en: "The customer must sign the sales order. If not signed, it will be considered accepted after 24 hours.",
      ar: "يجب على العميل توقيع أمر الشراء. في حال عدم التوقيع، يُعتبر مقبولًا بعد 24 ساعة.",
    },
  ],

  payment: [
    {
      en: "100% advance payment is required before delivery.",
      ar: "يُشترط سداد 100% من قيمة الطلب مسبقًا قبل التسليم.",
    },
    {
      en: "Refunds are eligible within 3 days of purchase, provided the product is unused and in original packaging.",
      ar: "يمكن استرداد المبالغ خلال 3 أيام من الشراء شريطة أن يكون المنتج غير مستخدم وبتغليفه الأصلي.",
    },
    {
      en: "Product availability may change. Collection within 30 days is required, or a 5% monthly storage fee will apply.",
      ar: "قد يتغير توفر المنتج. يجب الاستلام خلال 30 يومًا، وإلا تُطبق رسوم تخزين شهرية بنسبة 5%.",
    },
    {
      en: "Payments must be made only to Skynet Solution Qatar authorized accounts.",
      ar: "يجب تسديد المبالغ لحسابات سكاي نت سوليوشن قطر المعتمدة فقط.",
    },
    {
      en: "Ownership of products remains with Skynet Solution Qatar until full payment is received.",
      ar: "تبقى ملكية المنتجات لدى سكاي نت سوليوشن قطر حتى استلام كامل المبلغ.",
    },
  ],

  delivery: [
    {
      en: "The original invoice is required for all returns, exchanges, and warranty claims.",
      ar: "الفاتورة الأصلية مطلوبة لجميع عمليات الإرجاع والاستبدال ومطالبات الضمان.",
    },
    {
      en: "Customers must verify delivered quantities at the time of delivery. Shortages reported after delivery will not be accepted.",
      ar: "يجب على العملاء التحقق من الكميات المُسلّمة لحظة الاستلام. لن يُقبل أي ادعاء بالنقص بعد ذلك.",
    },
    {
      en: "Customers must ensure proper access, electrical connections, and installation arrangements before the delivery date.",
      ar: "يجب على العميل ضمان توفر المداخل المناسبة والتوصيلات الكهربائية وترتيبات التركيب قبل موعد التسليم.",
    },
    {
      en: "Returns are not accepted after 3 days from the delivery date.",
      ar: "لا تُقبل المرتجعات بعد مرور 3 أيام من تاريخ التسليم.",
    },
    {
      en: "Customers are responsible for site readiness and installation feasibility prior to delivery.",
      ar: "يتحمل العميل مسؤولية جاهزية الموقع وإمكانية التركيب قبل تاريخ التسليم.",
    },
    {
      en: "The customer must sign the delivery receipt. If not signed, delivery is considered accepted 24 hours after completion.",
      ar: "يجب على العميل توقيع إيصال الاستلام. في حال عدم التوقيع، يُعتبر الاستلام مكتملًا بعد 24 ساعة.",
    },
  ],
};

// ─── Build invoice number from order number ───────────────────────────────────
// SKY-2026-00023 → INV/2026/00023
export const buildInvoiceNumber = (orderNumber: string): string => {
  const parts = orderNumber.split("-");
  if (parts.length === 3) return `INV/${parts[1]}/${parts[2]}`;
  return `INV/${orderNumber}`;
};