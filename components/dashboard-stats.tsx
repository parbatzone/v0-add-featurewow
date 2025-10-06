"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, Users, FileText, Clock } from "lucide-react"

interface DashboardStatsProps {
  invoices: Array<{
    id: string
    type: "quick" | "detailed"
    subtotal: number
    remaining: number
    date: string
    status: "paid" | "pending"
    customerPhone: string
    customerName: string
  }>
  customers: Array<{
    phone: string
    name: string
    totalBills: number
    totalAmount: number
    lastVisit: string
  }>
}

export function DashboardStats({ invoices, customers }: DashboardStatsProps) {
  const today = new Date().toISOString().split("T")[0]
  const thisMonth = new Date().toISOString().slice(0, 7)

  const todayInvoices = invoices.filter((inv) => inv.date === today)
  const thisMonthInvoices = invoices.filter((inv) => inv.date.startsWith(thisMonth))

  const todaysSales = todayInvoices.reduce((sum, inv) => sum + inv.subtotal, 0)
  const monthlyRevenue = thisMonthInvoices.reduce((sum, inv) => sum + inv.subtotal, 0)
  const pendingAmount = invoices.filter((inv) => inv.status === "pending").reduce((sum, inv) => sum + inv.remaining, 0)
  const totalCustomers = customers.length

  const recentInvoices = invoices.slice(0, 5)

  const topCustomers = customers
    .map((customer) => {
      // Calculate totals from current invoices only
      const customerInvoices = invoices.filter(
        (inv) => inv.customerPhone === customer.phone || inv.customerName === customer.name,
      )
      const totalAmount = customerInvoices.reduce((sum, inv) => sum + inv.subtotal, 0)
      const totalBills = customerInvoices.length

      return {
        ...customer,
        totalAmount,
        totalBills,
      }
    })
    .filter((customer) => customer.totalBills > 0) // Only show customers with current invoices
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">NPR {todaysSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{todayInvoices.length} bills today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">NPR {monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{thisMonthInvoices.length} bills this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">NPR {pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter((inv) => inv.status === "pending").length} pending bills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Invoices
            </CardTitle>
            <CardDescription>Latest billing activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInvoices.length > 0 ? (
                recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{invoice.id}</div>
                      <div className="text-sm text-muted-foreground">{invoice.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">NPR {invoice.subtotal.toLocaleString()}</div>
                      <Badge variant={invoice.status === "paid" ? "default" : "destructive"} className="text-xs">
                        {invoice.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No invoices yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Customers
            </CardTitle>
            <CardDescription>Customers by total spending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCustomers.map((customer) => (
                <div key={customer.phone} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">{customer.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">NPR {customer.totalAmount.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{customer.totalBills} bills</div>
                  </div>
                </div>
              ))}
              {topCustomers.length === 0 && <p className="text-muted-foreground text-center py-4">No customers yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
