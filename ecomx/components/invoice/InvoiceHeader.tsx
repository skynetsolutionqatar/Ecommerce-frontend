import type { ReactNode } from "react";
import { Circle, Image, Path, Svg, Text, View } from "@react-pdf/renderer";

import type { InvoiceCompany } from "@/types/invoice.types";
import {
  HDR,
  splitCompanyTitle,
  splitTagline,
} from "@/lib/invoice/header-wave";
import { INVOICE_HEADER_BANNER } from "@/lib/invoice/invoice-utils";
import { S, T } from "@/lib/invoice/invoice-styles";

function ContactRow({
  label,
  accent,
  children,
}: {
  label: string;
  accent?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={S.hdrContactItem}>
      <View style={S.hdrContactIcon}>{children}</View>
      <Text style={[S.hdrContactText, accent ? S.hdrContactAccent : {}]}>
        {label}
      </Text>
    </View>
  );
}

function PhoneIcon() {
  return (
    <Svg width={9} height={9} viewBox="0 0 10 10">
      <Path
        d="M2.2 1.5h1.4l.7 1.6-1 0.7c.4.9 1.1 1.6 2 2l.7-1 1.6.7v1.4c0 .3-.2.5-.5.5C3.9 8.6 1.4 6.1 1.4 3c0-.3.2-.5.8-.5z"
        fill="#5b9bd5"
      />
    </Svg>
  );
}

function MailIcon() {
  return (
    <Svg width={9} height={9} viewBox="0 0 10 10">
      <Path
        d="M1.2 2.8h7.6v4.4H1.2V2.8zm0-.8c-.4 0-.8.4-.8.8v4.4c0 .4.4.8.8.8h7.6c.4 0 .8-.4.8-.8V2.8c0-.4-.4-.8-.8-.8H1.2zm3.8 2.5L1.8 3.2h6.4L5 4.5z"
        fill="#5b9bd5"
      />
    </Svg>
  );
}

function WebIcon() {
  return (
    <Svg width={9} height={9} viewBox="0 0 10 10">
      <Circle
        cx={5}
        cy={5}
        r={3.6}
        stroke="#5b9bd5"
        strokeWidth={0.6}
        fill="none"
      />
      <Path
        d="M1.4 5h7.2M5 1.4c.9 1.2 1.4 2.6 1.4 3.6S5.9 7.4 5 8.6"
        stroke="#5b9bd5"
        strokeWidth={0.5}
        fill="none"
      />
    </Svg>
  );
}

/** Banner bg image + logo (left) + company details (right, sharp PDF text) */
export function InvoiceHeader({
  company,
  logoUrl,
  bannerBgUrl,
}: {
  company: InvoiceCompany;
  logoUrl: string;
  bannerBgUrl: string;
}) {
  const { pageW: w, height: h } = INVOICE_HEADER_BANNER;
  const [titleMain, titleCountry] = splitCompanyTitle(company.nameEn);
  const [taglineMain, taglineSub] = splitTagline(company.taglineEn);

  return (
    <View
      style={[
        S.pageContent,
        { borderBottomColor: T.teal, borderBottomWidth: 2 },
      ]}
    >
      <View style={[S.hdrBannerWrap, { width: w, height: h }]}>
        <Image
          src={bannerBgUrl}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: w,
            height: h,
            objectFit: "cover",
          }}
        />

        <View
          style={{
            position: "absolute",
            top: 0,
            left: HDR.logoLeft,
            width: HDR.logoWidth,
            height: h,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            src={logoUrl}
            style={{
              width: HDR.logoWidth,
              height: HDR.logoHeight,
              objectFit: "contain",
            }}
          />
        </View>

        <View
          style={{
            position: "absolute",
            top: 0,
            left: HDR.contentLeft,
            right: HDR.contentRight,
            height: h,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={S.hdrTitleMain}>{titleMain}</Text>
          {titleCountry ? (
            <Text style={S.hdrTitleCountry}>{titleCountry}</Text>
          ) : null}
          <Text style={S.hdrTitleAr}>{company.nameAr}</Text>
          <Text style={S.hdrTitleTag}>{taglineMain}</Text>
          {taglineSub ? (
            <Text style={S.hdrTitleTagSub}>{taglineSub}</Text>
          ) : null}
        </View>

        <View
          style={{
            position: "absolute",
            top: 0,
            right: HDR.contactRight,
            width: HDR.contactWidth,
            height: h,
            justifyContent: "center",
          }}
        >
          <ContactRow label={company.phone}>
            <PhoneIcon />
          </ContactRow>
          <ContactRow label={company.email}>
            <MailIcon />
          </ContactRow>
          <ContactRow label={company.website} accent>
            <WebIcon />
          </ContactRow>
        </View>
      </View>
    </View>
  );
}
