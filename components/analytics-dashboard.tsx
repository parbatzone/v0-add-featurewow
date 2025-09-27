"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  Calendar,
  BarChart3,
  PieChartIcon,
  LineChartIcon,
} from "lucide-react"

interface Invoice {
  id: string
  type: "quick" | "detailed"
  customerPhone?: string
  customerName?: string
  items: Array<{
    name: string
    quantity: number
    rate: number
    total: number
  }>
  subtotal: number
  advance: number
  remaining: number
  date: string
  status: "paid" | "pending"
}

interface AnalyticsDashboardProps {
  invoices: Invoice[]
}

export function AnalyticsDashboard({ invoices }: AnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  // Get available years from invoices
  const availableYears = useMemo(() => {
    const years = [...new Set(invoices.map((inv) => new Date(inv.date).getFullYear()))]
    return years.sort((a, b) => b - a)
  }, [invoices])

  // Filter invoices based on selected period
  const filteredInvoices = useMemo(() => {
    const now = new Date()
    const startDate = new Date()

    switch (selectedPeriod) {
      case "1month":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "3months":
        startDate.setMonth(now.getMonth() - 3)
        break
      case "6months":
        startDate.setMonth(now.getMonth() - 6)
        break
      case "1year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case "year":
        return invoices.filter((inv) => new Date(inv.date).getFullYear().toString() === selectedYear)
      default:
        return invoices
    }

    return invoices.filter((inv) => new Date(inv.date) >= startDate)
  }, [invoices, selectedPeriod, selectedYear])

  // Monthly revenue data
  const monthlyData = useMemo(() => {
    const monthlyStats = new Map()

    filteredInvoices.forEach((invoice) => {
      const date = new Date(invoice.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

      if (!monthlyStats.has(monthKey)) {
        monthlyStats.set(monthKey, {
          month: monthName,
          revenue: 0,
          bills: 0,
          paid: 0,
          pending: 0,
        })
      }

      const stats = monthlyStats.get(monthKey)
      stats.revenue += invoice.subtotal
      stats.bills += 1
      if (invoice.status === "paid") {
        stats.paid += invoice.subtotal
      } else {
        stats.pending += invoice.remaining
      }
    })

    return Array.from(monthlyStats.values()).sort((a, b) => a.month.localeCompare(b.month))
  }, [filteredInvoices])

  // Service/Product analysis
  const serviceData = useMemo(() => {
    const serviceStats = new Map()

    filteredInvoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        if (!serviceStats.has(item.name)) {
          serviceStats.set(item.name, {
            name: item.name,
            revenue: 0,
            quantity: 0,
            bills: 0,
          })
        }

        const stats = serviceStats.get(item.name)
        stats.revenue += item.total
        stats.quantity += item.quantity
        stats.bills += 1
      })
    })

    return Array.from(serviceStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }, [filteredInvoices])

  // Customer analysis
  const customerData = useMemo(() => {
    const customerStats = new Map()

    filteredInvoices.forEach((invoice) => {
      if (invoice.customerName) {
        const key = invoice.customerName
        if (!customerStats.has(key)) {
          customerStats.set(key, {
            name: invoice.customerName,
            phone: invoice.customerPhone || "",
            revenue: 0,
            bills: 0,
            lastVisit: invoice.date,
          })
        }

        const stats = customerStats.get(key)
        stats.revenue += invoice.subtotal
        stats.bills += 1
        if (new Date(invoice.date) > new Date(stats.lastVisit)) {
          stats.lastVisit = invoice.date
        }
      }
    })

    return Array.from(customerStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }, [filteredInvoices])

  // Payment status data for pie chart
  const paymentStatusData = useMemo(() => {
    const paid = filteredInvoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.subtotal, 0)
    const pending = filteredInvoices
      .filter((inv) => inv.status === "pending")
      .reduce((sum, inv) => sum + inv.remaining, 0)

    return [
      { name: "Paid", value: paid, color: "#22c55e" },
      { name: "Pending", value: pending, color: "#ef4444" },
    ]
  }, [filteredInvoices])

  // Summary statistics
  const summaryStats = useMemo(() => {
    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.subtotal, 0)
    const totalPending = filteredInvoices
      .filter((inv) => inv.status === "pending")
      .reduce((sum, inv) => sum + inv.remaining, 0)
    const totalBills = filteredInvoices.length
    const uniqueCustomers = new Set(filteredInvoices.map((inv) => inv.customerName).filter(Boolean)).size

    // Calculate growth compared to previous period
    const currentPeriodStart = new Date()
    const previousPeriodStart = new Date()

    switch (selectedPeriod) {
      case "1month":
        currentPeriodStart.setMonth(currentPeriodStart.getMonth() - 1)
        previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 2)
        break
      case "3months":
        currentPeriodStart.setMonth(currentPeriodStart.getMonth() - 3)
        previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 6)
        break
      case "6months":
        currentPeriodStart.setMonth(currentPeriodStart.getMonth() - 6)
        previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1)
        break
      default:
        currentPeriodStart.setFullYear(currentPeriodStart.getFullYear() - 1)
        previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 2)
    }

    const previousPeriodRevenue = invoices
      .filter((inv) => {
        const date = new Date(inv.date)
        return date >= previousPeriodStart && date < currentPeriodStart
      })
      .reduce((sum, inv) => sum + inv.subtotal, 0)

    const revenueGrowth =
      previousPeriodRevenue > 0 ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 : 0

    return {
      totalRevenue,
      totalPending,
      totalBills,
      uniqueCustomers,
      revenueGrowth,
      averageBillValue: totalBills > 0 ? totalRevenue / totalBills : 0,
    }
  }, [filteredInvoices, invoices, selectedPeriod])

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    paid: {
      label: "Paid",
      color: "hsl(var(--chart-2))",
    },
    pending: {
      label: "Pending",
      color: "hsl(var(--chart-3))",
    },
    bills: {
      label: "Bills",
      color: "hsl(var(--chart-4))",
    },
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-space-grotesk">Business Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights into your photo studio performance</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
              <SelectItem value="year">Specific Year</SelectItem>
            </SelectContent>
          </Select>

          {selectedPeriod === "year" && (
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">NPR {summaryStats.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {summaryStats.revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(summaryStats.revenueGrowth).toFixed(1)}% from previous period
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalBills}</div>
            <p className="text-xs text-muted-foreground">
              Avg: NPR {summaryStats.averageBillValue.toLocaleString()} per bill
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">NPR {summaryStats.totalPending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((summaryStats.totalPending / summaryStats.totalRevenue) * 100).toFixed(1)}% of total revenue
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.uniqueCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Avg: NPR{" "}
              {summaryStats.uniqueCustomers > 0
                ? (summaryStats.totalRevenue / summaryStats.uniqueCustomers).toLocaleString()
                : 0}{" "}
              per customer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="glass-effect">
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <LineChartIcon className="w-4 h-4" />
            Revenue Trends
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Services Analysis
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Top Customers
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4" />
            Payment Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Monthly Revenue Trends</CardTitle>
              <CardDescription>Revenue, paid amounts, and pending payments over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--color-revenue)"
                      strokeWidth={3}
                      name="Total Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="paid"
                      stroke="var(--color-paid)"
                      strokeWidth={2}
                      name="Paid Amount"
                    />
                    <Line
                      type="monotone"
                      dataKey="pending"
                      stroke="var(--color-pending)"
                      strokeWidth={2}
                      name="Pending Amount"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Top Services by Revenue</CardTitle>
              <CardDescription>Most profitable services and products</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" name="Revenue (NPR)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Top Customers by Revenue</CardTitle>
              <CardDescription>Your most valuable customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerData.map((customer, index) => (
                  <div
                    key={customer.name}
                    className="flex items-center justify-between p-4 border rounded-lg glass-effect"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.phone}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">NPR {customer.revenue.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{customer.bills} bills</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Payment Status Distribution</CardTitle>
                <CardDescription>Breakdown of paid vs pending amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: NPR ${value.toLocaleString()}`}
                      >
                        {paymentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `NPR ${Number(value).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Monthly Bills Count</CardTitle>
                <CardDescription>Number of bills generated each month</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="bills" fill="var(--color-bills)" name="Bills Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Transaction History Table */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Detailed Transaction History</CardTitle>
          <CardDescription>Complete record of all transactions in the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Invoice ID</th>
                    <th className="text-left p-2">Customer</th>
                    <th className="text-left p-2">Items</th>
                    <th className="text-right p-2">Amount</th>
                    <th className="text-right p-2">Advance</th>
                    <th className="text-right p-2">Remaining</th>
                    <th className="text-center p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.slice(0, 50).map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{invoice.date}</td>
                      <td className="p-2 font-mono text-xs">{invoice.id}</td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{invoice.customerName || "N/A"}</div>
                          <div className="text-xs text-muted-foreground">{invoice.customerPhone || "N/A"}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-xs">
                          {invoice.items
                            .slice(0, 2)
                            .map((item) => item.name)
                            .join(", ")}
                          {invoice.items.length > 2 && ` +${invoice.items.length - 2} more`}
                        </div>
                      </td>
                      <td className="p-2 text-right font-medium">NPR {invoice.subtotal.toLocaleString()}</td>
                      <td className="p-2 text-right">NPR {invoice.advance.toLocaleString()}</td>
                      <td className="p-2 text-right">
                        <span className={invoice.remaining > 0 ? "text-destructive" : "text-green-600"}>
                          NPR {invoice.remaining.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <Badge variant={invoice.status === "paid" ? "default" : "destructive"}>
                          {invoice.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredInvoices.length > 50 && (
              <div className="text-center text-sm text-muted-foreground">
                Showing first 50 transactions of {filteredInvoices.length} total
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
