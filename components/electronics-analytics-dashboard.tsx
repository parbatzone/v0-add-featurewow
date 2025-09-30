"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, TrendingUp } from "lucide-react"

interface AnalyticsDashboardProps {
  invoices: any[]
}

export function ElectronicsAnalyticsDashboard({ invoices }: AnalyticsDashboardProps) {
  const monthlyRevenue = invoices.reduce(
    (acc, inv) => {
      const month = inv.date.substring(0, 7)
      acc[month] = (acc[month] || 0) + inv.subtotal
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <Card className="glass-effect border-border/50 decorative-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-space-grotesk">
          <BarChart className="w-5 h-5 text-primary" />
          Analytics Dashboard
        </CardTitle>
        <CardDescription>Track your electronics shop performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Monthly Revenue</span>
          </div>
          <div className="space-y-2">
            {Object.entries(monthlyRevenue)
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 6)
              .map(([month, revenue]) => (
                <div key={month} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">{month}</span>
                  <span className="font-semibold">NPR {revenue.toLocaleString()}</span>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
