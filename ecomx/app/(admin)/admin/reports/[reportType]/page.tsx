"use client";

import { memo } from "react";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { lazyClient } from "@/lib/lazy";
import { isReportType } from "@/lib/admin/reports.config";

const ReportPage = lazyClient(() => import("@/components/admin/reports/ReportPage"), {
  ssr: false,
});

function AdminReportTypePage() {
  const params = useParams();
  const reportType = params.reportType;

  if (typeof reportType !== "string" || !isReportType(reportType)) {
    notFound();
  }

  return <ReportPage reportType={reportType} />;
}

export default memo(AdminReportTypePage);
