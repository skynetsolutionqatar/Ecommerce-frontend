import type { Metadata } from "next";
import ThemeProvider from "@/components/ThemeProvider";
import QueryProvider from "@/components/QueryProvider";
import AuthInitializer from "@/components/AuthInitializer";
import { getClientConfig } from "@/config/clients";
import { urbanist } from "@/lib/fonts";
import { themeToCssProperties } from "@/lib/theme-css";
import "./globals.css";

const client = getClientConfig();

export const metadata: Metadata = {
  title: `${client.name} — POS & IT Hardware Store Qatar`,
  description: "Shop POS systems, printers, scanners, and atACC ERP solutions from Skynet Solution Qatar. Qatar VAT certified. Free installation.",
  keywords: "POS Qatar, Skynet, atACC ERP, thermal printer, barcode scanner, Doha, Qatar",
  openGraph: {
    title: `${client.name} — POS & IT Hardware`,
    description: "Qatar's trusted POS and ERP partner since 2012.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full ${urbanist.variable}`}
      data-client={client.id}
      style={themeToCssProperties(client.theme)}
    >
      <body
        className={`${urbanist.className} flex min-h-full flex-col overflow-x-hidden font-sans antialiased`}
        style={{ background: "#f1f3f6" }}
      >
        <QueryProvider>
          <AuthInitializer>
            <ThemeProvider clientId={client.id}>{children}</ThemeProvider>
          </AuthInitializer>
        </QueryProvider>
      </body>
    </html>
  );
}
