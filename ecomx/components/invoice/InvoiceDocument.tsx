"use client";

import type { ReactNode } from "react";
import { Document, Image, Page, Text, View } from "@react-pdf/renderer";

import type { InvoicePayload } from "@/types/invoice.types";
import {
  amountToWords,
  fmtInvoiceDate,
  fmtMoney,
} from "@/lib/invoice/invoice-formatters";
import { COL, colDesc, S } from "@/lib/invoice/invoice-styles";
import { InvoiceHeader } from "@/components/invoice/InvoiceHeader";
import {
  invoicePageCount,
  itemStartIndex,
  paginateOrderItems,
} from "@/lib/invoice/paginate-items";
import type { ApiOrder } from "@/types/order.types";

function PageWatermark() {
  return (
    <View style={S.watermark} fixed>
      <View style={S.watermarkInner}>
        <Text style={S.watermarkBrand}>SKYNET</Text>
      </View>
    </View>
  );
}

function DocFooter({
  company,
  page,
  total,
}: {
  company: InvoicePayload["company"];
  page: number;
  total: number;
}) {
  return (
    <View style={S.footer} fixed>
      <Text style={S.footContact}>
        {company.phone} · {company.whatsapp} · {company.email} ·{" "}
        {company.website}
      </Text>
      <Text style={S.footPage}>
        Page {page} of {total}
      </Text>
    </View>
  );
}

function MetaLine({
  labelEn,
  labelAr,
  value,
  last,
}: {
  labelEn: string;
  labelAr: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[S.metaLine, last ? S.metaLineLast : {}]}>
      <View style={S.metaLabelCol}>
        <Text style={S.metaKey}>{labelEn}</Text>
        <Text style={S.metaKeyAr}>{labelAr}</Text>
      </View>
      <Text style={S.metaVal}>{value || "—"}</Text>
    </View>
  );
}

function TableHeadCell({
  width,
  label,
  align = "left",
}: {
  width: number | typeof colDesc;
  label: string;
  align?: "left" | "center" | "right";
}) {
  const wStyle = typeof width === "number" ? { width } : { ...colDesc };
  const alignStyle =
    align === "center" ? S.thCenter : align === "right" ? S.thRight : {};

  return (
    <View style={wStyle}>
      <Text style={[S.th, alignStyle]}>{label}</Text>
    </View>
  );
}

function TableCell({
  width,
  children,
  align = "left",
  bold,
}: {
  width: number | typeof colDesc;
  children: ReactNode;
  align?: "left" | "center" | "right";
  bold?: boolean;
}) {
  const wStyle = typeof width === "number" ? { width } : { ...colDesc };
  const alignStyle =
    align === "center"
      ? S.tdCenter
      : align === "right"
      ? bold
        ? S.tdBold
        : S.tdRight
      : {};

  return (
    <View style={wStyle}>
      {typeof children === "string" ? (
        <Text style={[bold ? S.tdBold : S.td, alignStyle]}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

function TermsSection({
  titleEn,
  titleAr,
  items,
  startIndex = 0,
  hideTitle = false,
  sectionStyle,
}: {
  titleEn: string;
  titleAr: string;
  items: { en: string; ar: string }[];
  startIndex?: number;
  hideTitle?: boolean;
  sectionStyle?: object;
}) {
  return (
    <View style={[S.termSection, { ...sectionStyle }]}>
      {!hideTitle ? (
        <View style={S.termTitle}>
          <View style={S.termTitleLeft}>
            <View style={S.termTitleBar} />
            <Text style={S.termTitleEn}>{titleEn}</Text>
          </View>
          <Text style={S.termTitleAr}>{titleAr}</Text>
        </View>
      ) : null}
      <View style={S.termList}>
        {items.map((item, i) => (
          <View key={`${titleEn}-${startIndex + i}`} style={S.termItem}>
            <Text style={S.termNumTxt}>{startIndex + i + 1}.</Text>
            <Text style={S.termEn}>{item.en}</Text>
            <Text style={S.termAr}>{item.ar}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ItemsTable({
  items,
  startIndex,
  currency,
}: {
  items: ApiOrder["items"];
  startIndex: number;
  currency: string;
}) {
  return (
    <View style={S.tableWrap}>
      <View style={S.tableHead}>
        <TableHeadCell width={COL.no} label="#" align="center" />
        <TableHeadCell width={colDesc} label="Description" />
        <TableHeadCell width={COL.qty} label="Qty" align="center" />
        <TableHeadCell width={COL.unit} label="Unit Price" align="right" />
        <TableHeadCell width={COL.total} label="Amount" align="right" />
      </View>

      {items.map((item, idx) => {
        const subtotal = item.subtotal ?? item.price * item.quantity;
        const isLast = idx === items.length - 1;
        const rowIndex = startIndex + idx;
        return (
          <View
            key={`item-${rowIndex}-${item.sku?.trim() || item.name}`}
            wrap={false}
            style={[
              S.trow,
              rowIndex % 2 === 1 ? S.trowAlt : {},
              isLast ? S.trowLast : {},
            ]}
          >
            <TableCell width={COL.no} align="center">
              <Text style={S.tdNum}>{rowIndex + 1}</Text>
            </TableCell>
            <TableCell width={colDesc}>
              <Text style={S.td}>{item.name}</Text>
              {item.sku ? <Text style={S.tdMuted}>SKU: {item.sku}</Text> : null}
            </TableCell>
            <TableCell width={COL.qty} align="center">
              {String(item.quantity)}
            </TableCell>
            <TableCell width={COL.unit} align="right">
              {fmtMoney(item.price, currency)}
            </TableCell>
            <TableCell width={COL.total} align="right" bold>
              {fmtMoney(subtotal, currency)}
            </TableCell>
          </View>
        );
      })}
    </View>
  );
}

function InvoiceSummary({
  order,
  bank,
  company,
  currency,
  invoiceNumber,
  terms,
  subRows,
}: {
  order: ApiOrder;
  bank: InvoicePayload["bank"];
  company: InvoicePayload["company"];
  currency: string;
  invoiceNumber: string;
  terms: InvoicePayload["terms"];
  subRows: { label: string; value: string }[];
}) {
  return (
    <>
      <View style={S.warranty} wrap={false}>
        <Text style={S.warrantyTxt}>{terms.warranty}</Text>
      </View>

      <View style={S.bottomRow} wrap={false}>
        <View style={S.bankCard}>
          <View style={S.bankHead}>
            <Text style={S.bankHeadEn}>Bank Transfer</Text>
            <Text style={S.bankHeadAr}>التحويل البنكي</Text>
          </View>
          <View style={S.bankBody}>
            {(
              [
                ["Bank", bank.name],
                ["Beneficiary", bank.beneficiary],
                ["Account", bank.account],
                ["SWIFT", bank.swift],
                ["Currency", bank.currency],
              ] as [string, string][]
            ).map(([k, v]) => (
              <View key={k} style={S.bankRow}>
                <Text style={S.bankKey}>{k}</Text>
                <Text style={S.bankVal}>{v}</Text>
              </View>
            ))}
            <View style={S.bankRow}>
              <Text style={S.bankKey}>IBAN</Text>
              <Text style={S.bankIban}>{bank.iban}</Text>
            </View>
            <Text style={S.payNote}>
              100% advance payment before delivery. Ref:{" "}
              <Text style={S.payRef}>{invoiceNumber}</Text>
            </Text>
          </View>
        </View>

        <View style={S.totalsCol}>
          <View style={S.totalsBox}>
            <View style={S.totalsInner}>
              {subRows.map(({ label, value }) => (
                <View key={label} style={S.totLine}>
                  <Text style={S.totLbl}>{label}</Text>
                  <Text style={S.totVal}>{value}</Text>
                </View>
              ))}
              <View style={S.totGrand}>
                <View>
                  <Text style={S.totGrandLbl}>Total Due</Text>
                  <Text style={S.totGrandLblAr}>المبلغ الإجمالي</Text>
                </View>
                <Text style={S.totGrandVal}>
                  {fmtMoney(order.totalAmount, currency)}
                </Text>
              </View>
            </View>
          </View>
          <Text style={S.totWords}>{amountToWords(order.totalAmount)}</Text>
        </View>
      </View>

      <View style={S.assist}>
        <Text style={S.assistTxt}>
          Need assistance? {company.phone} · {company.email}
        </Text>
      </View>
    </>
  );
}

function splitTerms<T>(items: T[]): [T[], T[]] {
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

export function InvoiceDocument({ data }: { data: InvoicePayload }) {
  const {
    order,
    company,
    bank,
    terms,
    currency,
    invoiceNumber,
    logoUrl,
    bannerBgUrl,
    qrDataUrl,
  } = data;
  const addr = order.deliveryAddress;
  const invDate = fmtInvoiceDate(order.deliveredAt ?? order.createdAt);

  const subRows: { label: string; value: string }[] = [
    { label: "Subtotal", value: fmtMoney(order.subtotal ?? 0, currency) },
    ...(order.discountAmount
      ? [
          {
            label: "Discount",
            value: `- ${fmtMoney(order.discountAmount, currency)}`,
          },
        ]
      : []),
    ...(order.shippingCharge
      ? [{ label: "Delivery charge", value: fmtMoney(order.shippingCharge, currency) }]
      : []),
    ...(order.taxAmount
      ? [{ label: "Tax (VAT)", value: fmtMoney(order.taxAmount, currency) }]
      : []),
  ];

  const paymentLabel =
    order.paymentMethod === "cash_on_delivery"
      ? "Cash on Delivery"
      : order.paymentMethod ?? "—";

  const addressLine = [
    addr.line1,
    addr.line2,
    addr.city,
    addr.state,
    addr.country,
  ]
    .filter(Boolean)
    .join(", ");

  const [deliveryLeft, deliveryRight] = splitTerms(terms.delivery);
  const { firstPage, continuations } = paginateOrderItems(order.items);
  const totalPages = invoicePageCount(order.items);
  const hasContinuations = continuations.length > 0;
  const termsPage = totalPages;

  const summaryProps = {
    order,
    bank,
    company,
    currency,
    invoiceNumber,
    terms,
    subRows,
  };

  return (
    <Document title={invoiceNumber} author={company.nameEn}>
      <Page size="A4" style={S.page}>
        <PageWatermark />
        <InvoiceHeader
          company={company}
          logoUrl={logoUrl}
          bannerBgUrl={bannerBgUrl}
        />

        <View style={[S.body, S.pageContent]}>
          <View style={S.titleRow}>
            <View style={S.titleLeft}>
              <Text style={S.docType}>Tax Invoice</Text>
              <Text style={S.docTypeAr}>فاتورة ضريبية</Text>
              <Text style={S.docSub}>Order {order.orderNumber}</Text>
            </View>
            <View style={S.invBadge}>
              <Text style={S.invBadgeLbl}>INVOICE NO.</Text>
              <Text style={S.invBadgeNum}>{invoiceNumber}</Text>
            </View>
          </View>

          <View style={S.cardRow}>
            <View style={S.card}>
              <View style={S.cardHead}>
                <Text style={S.cardHeadEn}>BILL TO</Text>
                <Text style={S.cardHeadAr}>فاتورة إلى</Text>
              </View>
              <View style={S.cardBody}>
                <Text style={S.billName}>{addr.fullName}</Text>
                <Text style={S.billLine}>{addressLine}</Text>
                {addr.phone ? (
                  <Text style={S.billLine}>Tel: {addr.phone}</Text>
                ) : null}
              </View>
            </View>

            <View style={[S.card, S.cardLast]}>
              <View style={S.cardHead}>
                <Text style={S.cardHeadEn}>INVOICE DETAILS</Text>
                <Text style={S.cardHeadAr}>تفاصيل الفاتورة</Text>
              </View>
              <View style={S.cardBody}>
                <MetaLine
                  labelEn="Invoice Date"
                  labelAr="تاريخ الفاتورة"
                  value={invDate}
                />
                <MetaLine
                  labelEn="Due Date"
                  labelAr="تاريخ الاستحقاق"
                  value={invDate}
                />
                <MetaLine
                  labelEn="Delivery Date"
                  labelAr="تاريخ التسليم"
                  value={fmtInvoiceDate(order.deliveredAt)}
                />
                <MetaLine
                  labelEn="Payment Method"
                  labelAr="طريقة الدفع"
                  value={paymentLabel}
                  last
                />
              </View>
            </View>
          </View>

          <ItemsTable items={firstPage} startIndex={0} currency={currency} />

          {hasContinuations ? (
            <Text style={S.contNote}>Items continued on next page…</Text>
          ) : (
            <InvoiceSummary {...summaryProps} />
          )}
        </View>

        <DocFooter company={company} page={1} total={totalPages} />
      </Page>

      {continuations.map((chunk, i) => {
        const pageNum = 2 + i;
        const isLastItemPage = i === continuations.length - 1;
        const startIndex = itemStartIndex(firstPage.length, i, continuations);

        return (
          <Page key={`items-${pageNum}`} size="A4" style={S.page}>
            <PageWatermark />
            <InvoiceHeader
              company={company}
              logoUrl={logoUrl}
              bannerBgUrl={bannerBgUrl}
            />

            <View style={[S.contBody, S.pageContent]}>
              <Text style={S.contNote}>
                {invoiceNumber} — items {startIndex + 1}–
                {startIndex + chunk.length} of {order.items.length}
              </Text>
              <ItemsTable
                items={chunk}
                startIndex={startIndex}
                currency={currency}
              />
              {isLastItemPage ? <InvoiceSummary {...summaryProps} /> : null}
            </View>

            <DocFooter company={company} page={pageNum} total={totalPages} />
          </Page>
        );
      })}

      <Page size="A4" style={S.page} wrap={false}>
        <PageWatermark />
        <InvoiceHeader
          company={company}
          logoUrl={logoUrl}
          bannerBgUrl={bannerBgUrl}
        />

        <View style={[S.p2Shell, S.pageContent]}>
          <View style={S.p2Main}>
            <View style={S.termsGrid}>
              <View style={S.termsCol}>
                <TermsSection
                  titleEn="Sales Terms"
                  titleAr="شروط البيع"
                  items={terms.sales}
                />
                <TermsSection
                  titleEn="Delivery Terms"
                  titleAr="شروط التسليم"
                  items={deliveryLeft}
                  sectionStyle={S.termsSectionGap}
                />
              </View>
              <View style={[S.termsCol, S.termsColLast]}>
                <TermsSection
                  titleEn=""
                  titleAr=""
                  items={deliveryRight}
                  startIndex={deliveryLeft.length}
                  hideTitle
                />
                <TermsSection
                  titleEn="Payment Terms"
                  titleAr="شروط الدفع"
                  items={terms.payment}
                  sectionStyle={S.termsSectionGap}
                />
              </View>
            </View>
          </View>

          <View style={S.sigRow} wrap={false}>
            <View style={S.qrBlock}>
              {qrDataUrl ? <Image style={S.qrImg} src={qrDataUrl} /> : null}
              <Text style={S.qrLbl}>{invoiceNumber}</Text>
            </View>

            <View style={S.sigBlock}>
              <View style={S.sigLine} />
              <Text style={S.sigCapEn}>Customer Signature</Text>
              <Text style={S.sigCapAr}>توقيع العميل</Text>
            </View>

            <View style={[S.sigBlock, S.sigBlockAuth, S.sigBlockLast]}>
              <View style={S.stamp}>
                <View style={S.stampInner}>
                  <Text style={S.stampName}>
                    {company.nameEn.toUpperCase()}
                  </Text>
                  <Text style={S.stampWeb}>{company.website}</Text>
                </View>
              </View>
              <View style={S.sigLine} />
              <Text style={S.sigCapEn}>Authorized Signature</Text>
              <Text style={S.sigCapAr}>توقيع معتمد</Text>
            </View>
          </View>
        </View>

        <DocFooter company={company} page={termsPage} total={totalPages} />
      </Page>
    </Document>
  );
}

export default InvoiceDocument;
