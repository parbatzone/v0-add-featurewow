"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, FileText, Users, TrendingUp } from "lucide-react"

interface DashboardStatsProps {
  invoices: any[]
  customers: any[]
}

export function ElectronicsDashboardStats({ invoices, customers }: DashboardStatsProps) {
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.subtotal, 0)
  const todayRevenue = invoices
    .filter((inv) => inv.date === new Date().toISOString().split("T")[0])
    .reduce((sum, inv) => sum + inv.subtotal, 0)
  const pendingAmount = invoices.filter((inv) => inv.status === "pending").reduce((sum, inv) => sum + inv.remaining, 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="glass-effect border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">NPR {totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">All time sales</p>
        </CardContent>
      </Card>

      <Card className="glass-effect border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">NPR {todayRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Sales for today</p>
        </CardContent>
      </Card>

      <Card className="glass-effect border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{invoices.length}</div>
          <p className="text-xs text-muted-foreground">All invoices</p>
        </CardContent>
      </Card>

      <Card className="glass-effect border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">NPR {pendingAmount.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Outstanding payments</p>
        </CardContent>
      </Card>
    </div>
  )
}
