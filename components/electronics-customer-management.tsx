"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

interface CustomerManagementProps {
  customers: Array<{
    phone: string
    name: string
    totalBills: number
    totalAmount: number
    lastVisit: string
  }>
  invoices: any[]
}

export function ElectronicsCustomerManagement({ customers, invoices }: CustomerManagementProps) {
  return (
    <Card className="glass-effect border-border/50 decorative-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-space-grotesk">
          <Users className="w-5 h-5 text-primary" />
          Customer Management
        </CardTitle>
        <CardDescription>View all your customers and their purchase history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {customers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No customers yet</p>
          ) : (
            customers.map((customer) => (
              <Card key={customer.phone} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{customer.name}</span>
                      <Badge variant="outline">{customer.phone}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {customer.totalBills} bills • NPR {customer.totalAmount.toLocaleString()} total
                    </p>
                    <p className="text-xs text-muted-foreground">Last visit: {customer.lastVisit}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
