"use client";

import { Suspense, memo, useState } from "react";
import Link from "next/link";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useDashboard } from "@/hooks/useDashboard";
import { ADMIN_ROUTES } from "@/lib/config";
import { adminType } from "@/lib/admin/typography";
import { colors } from "@/components/admin/utils/Colors";
import { lazyClient } from "@/lib/lazy";
import StatCard from "./StatCard";
import RecentTransactionsTable from "./RecentTransactionsTable";
import RecentOrdersTable from "./RecentOrdersTable";
import LowStockTable from "./LowStockTable";

const RevenueTrendChart = lazyClient(() => import("./RevenueTrendChart"), { ssr: false });
const SalesDonutChart = lazyClient(() => import("./SalesDonutChart"), { ssr: false });
const LabeledPieChart = lazyClient(() => import("./LabeledPieChart"), { ssr: false });
const OrderStatusDonutChart = lazyClient(() => import("./OrderStatusDonutChart"), { ssr: false });
const OrdersAreaChart = lazyClient(() => import("./OrdersAreaChart"), { ssr: false });
const CategoryBarChart = lazyClient(() => import("./CategoryBarChart"), { ssr: false });
const CustomerLineChart = lazyClient(() => import("./CustomerLineChart"), { ssr: false });
const PerformanceMetricsCard = lazyClient(() => import("./PerformanceMetricsCard"), { ssr: false });

function ChartFallback() {
  return <div className="h-[240px] animate-pulse rounded-lg bg-muted" />;
}

function AdminDashboard() {
  const [ordersPage, setOrdersPage] = useState(1);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [lowStockPage, setLowStockPage] = useState(1);

  const { data, isLoading, isPending, isError, error } = useDashboard({
    ordersPage,
    transactionsPage,
    lowStockPage,
  });

  if ((isLoading || isPending) && !data) {
    return (
      <div className="relative min-h-full p-4 md:p-6">
        <div className="mx-auto max-w-[1400px] space-y-6">
          <div className="h-16 animate-pulse rounded-lg bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <ChartFallback />
            <ChartFallback />
            <ChartFallback />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">
          {getApiErrorMessage(error, "Failed to load dashboard data.")}
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-full p-4 md:p-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <header>
          <h1 className={adminType.pageTitle}>{data.overview.title}</h1>
          <p className={adminType.pageDescription}>{data.overview.subtitle}</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Suspense fallback={<ChartFallback />}>
              <RevenueTrendChart
                title={data.revenueTrend.title}
                description={data.revenueTrend.description}
                points={data.revenueTrend.points}
              />
            </Suspense>
          </div>
          <div>
            <Suspense fallback={<ChartFallback />}>
              <SalesDonutChart
                title={data.salesDistribution.title}
                totalLabel={data.salesDistribution.totalLabel}
                totalValue={data.salesDistribution.totalValue}
                items={data.salesDistribution.items}
              />
            </Suspense>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Suspense fallback={<ChartFallback />}>
            <LabeledPieChart
              title={data.categoryPie.title}
              description={data.categoryPie.description}
              items={data.categoryPie.items}
            />
          </Suspense>
          <Suspense fallback={<ChartFallback />}>
            <OrderStatusDonutChart
              title={data.orderStatusDonut.title}
              totalLabel={data.orderStatusDonut.totalLabel}
              totalValue={data.orderStatusDonut.totalValue}
              items={data.orderStatusDonut.items}
            />
          </Suspense>
          <Suspense fallback={<ChartFallback />}>
            <CategoryBarChart
              title={data.categoryBar.title}
              description={data.categoryBar.description}
              points={data.categoryBar.points}
            />
          </Suspense>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Suspense fallback={<ChartFallback />}>
            <OrdersAreaChart
              title={data.ordersArea.title}
              description={data.ordersArea.description}
              points={data.ordersArea.points}
            />
          </Suspense>
          <Suspense fallback={<ChartFallback />}>
            <CustomerLineChart
              title={data.customerLine.title}
              description={data.customerLine.description}
              points={data.customerLine.points}
            />
          </Suspense>
          <Suspense fallback={<ChartFallback />}>
            <PerformanceMetricsCard metrics={data.performanceMetrics} />
          </Suspense>
        </section>

        {data.guestActivityInsights ? (
          <section className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className={adminType.sectionTitle}>Guest & visitor activity</h2>
                <p className={adminType.pageDescription}>
                  Anonymous storefront activity for the last 30 days.
                </p>
              </div>
              <Link
                href={ADMIN_ROUTES.guestActivity}
                className={`${adminType.badge} inline-flex w-fit items-center font-semibold ${colors.link}`}
              >
                View guest activity →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {data.guestActivityInsights.stats.map((stat) => (
                <StatCard key={stat.id} stat={stat} />
              ))}
            </div>
            <Suspense fallback={<ChartFallback />}>
              <CategoryBarChart
                title={data.guestActivityInsights.topViewedProducts.title}
                description={data.guestActivityInsights.topViewedProducts.description}
                points={data.guestActivityInsights.topViewedProducts.points}
                valueLabel="Views"
                formatValue={(value) => value.toLocaleString()}
              />
            </Suspense>
          </section>
        ) : null}

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className={adminType.sectionTitle}>Analytics & Reports</h2>
              <p className={adminType.pageDescription}>
                Traffic sources and campaign performance preview.
              </p>
            </div>
            <Link
              href={ADMIN_ROUTES.report("revenue")}
              className={`${adminType.badge} inline-flex w-fit items-center font-semibold ${colors.link}`}
            >
              Open reports →
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Suspense fallback={<ChartFallback />}>
              <LabeledPieChart
                title={data.utmSourceReport.title}
                description={data.utmSourceReport.description}
                items={data.utmSourceReport.items}
              />
            </Suspense>
            <Suspense fallback={<ChartFallback />}>
              <CategoryBarChart
                title={data.utmCampaignReport.title}
                description={data.utmCampaignReport.description}
                points={data.utmCampaignReport.points}
                valueLabel="Orders"
                formatValue={(value) => value.toLocaleString()}
              />
            </Suspense>
          </div>
        </section>

        <RecentOrdersTable
          title={data.recentOrders.title}
          viewAllLabel={data.recentOrders.viewAllLabel}
          viewAllHref={data.recentOrders.viewAllHref}
          rows={data.recentOrders.rows}
          pagination={data.recentOrders.pagination}
          onPageChange={setOrdersPage}
        />

        <LowStockTable
          title={data.lowStock.title}
          viewAllLabel={data.lowStock.viewAllLabel}
          viewAllHref={data.lowStock.viewAllHref}
          rows={data.lowStock.rows}
          pagination={data.lowStock.pagination}
          onPageChange={setLowStockPage}
        />

        <RecentTransactionsTable
          title={data.recentTransactions.title}
          viewAllLabel={data.recentTransactions.viewAllLabel}
          viewAllHref={data.recentTransactions.viewAllHref}
          rows={data.recentTransactions.rows}
          pagination={data.recentTransactions.pagination}
          onPageChange={setTransactionsPage}
        />
      </div>
    </div>
  );
}

export default memo(AdminDashboard);
