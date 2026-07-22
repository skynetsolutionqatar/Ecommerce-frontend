"use client";

import { Suspense, memo, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DASHBOARD_DATA, getDashboardData, type TimeRange } from "@/lib/admin/data";
import { adminType } from "@/lib/admin/typography";
import { lazyClient } from "@/lib/lazy";
import StatCard from "./StatCard";
import TimeRangeTabs from "./TimeRangeTabs";
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
  return <div className="h-[240px] animate-pulse rounded-lg bg-gray-100" />;
}

function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>(DASHBOARD_DATA.defaultTimeRange);

  const data = useMemo(() => getDashboardData(timeRange), [timeRange]);

  return (
    <div className="relative min-h-full bg-[#f1f3f6] p-4 md:p-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={adminType.pageTitle}>{data.overview.title}</h1>
            <p className={adminType.pageDescription}>{data.overview.subtitle}</p>
          </div>
          <TimeRangeTabs
            ranges={data.timeRanges}
            value={timeRange}
            onChange={setTimeRange}
          />
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </section>

        {/* Revenue area + sales donut */}
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

        {/* Labeled pie + order status donut + bar chart */}
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

        {/* Area + line + performance */}
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

        {/* Orders table */}
        <section>
          <RecentOrdersTable
            title={data.recentOrders.title}
            viewAllLabel={data.recentOrders.viewAllLabel}
            viewAllHref={data.recentOrders.viewAllHref}
            columns={data.recentOrders.columns}
            rows={data.recentOrders.rows}
          />
        </section>

        {/* Low stock — full width, no scroll */}
        <section>
          <LowStockTable
            title={data.lowStock.title}
            viewAllLabel={data.lowStock.viewAllLabel}
            viewAllHref={data.lowStock.viewAllHref}
            columns={data.lowStock.columns}
            rows={data.lowStock.rows}
          />
        </section>

        {/* Recent transactions */}
        <section>
          <RecentTransactionsTable
            title={data.recentTransactions.title}
            viewAllLabel={data.recentTransactions.viewAllLabel}
            viewAllHref={data.recentTransactions.viewAllHref}
            columns={data.recentTransactions.columns}
            rows={data.recentTransactions.rows}
          />
        </section>
      </div>

      <button
        type="button"
        aria-label="Quick action"
        className="fixed bottom-8 right-8 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-900 text-white shadow-lg transition hover:bg-emerald-800"
      >
        <Plus size={22} />
      </button>
    </div>
  );
}

export default memo(AdminDashboard);
