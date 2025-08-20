"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Phone } from "lucide-react"

interface CustomerManagementProps {
  customers: Array<{
    phone: string
    name: string
    totalBills: number
    totalAmount: number
    lastVisit: string
  }>
  invoices: Array<{
    id: string
    customerPhone?: string
    subtotal: number
    date: string
    status: "paid" | "pending"
  }>
}

export function CustomerManagement({ customers, invoices }: CustomerManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)

  const filteredCustomers = customers.filter(
    (customer) => customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || customer.phone.includes(searchTerm),
  )

  const getCustomerInvoices = (phone: string) => {
    return invoices.filter((inv) => inv.customerPhone === phone)
  }

  const selectedCustomerData = selectedCustomer ? customers.find((c) => c.phone === selectedCustomer) : null

  const selectedCustomerInvoices = selectedCustomer ? getCustomerInvoices(selectedCustomer) : []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Customer Management
          </CardTitle>
          <CardDescription>Manage your customer database and view their purchase history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Search customers by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />

            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{customers.length}</div>
                <div className="text-sm text-muted-foreground">Total Customers</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">
                  NPR {customers.reduce((sum, c) => sum + c.totalAmount, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{customers.reduce((sum, c) => sum + c.totalBills, 0)}</div>
                <div className="text-sm text-muted-foreground">Total Bills</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer List */}
        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.phone}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCustomer === customer.phone ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedCustomer(customer.phone)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">NPR {customer.totalAmount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{customer.totalBills} bills</div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredCustomers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No customers found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCustomerData ? (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedCustomerData.name}</h3>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {selectedCustomerData.phone}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-xl font-bold">{selectedCustomerData.totalBills}</div>
                      <div className="text-xs text-muted-foreground">Total Bills</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-xl font-bold">NPR {selectedCustomerData.totalAmount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Total Spent</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-xl font-bold">{selectedCustomerData.lastVisit}</div>
                      <div className="text-xs text-muted-foreground">Last Visit</div>
                    </div>
                  </div>
                </div>

                {/* Purchase History */}
                <div>
                  <h4 className="font-semibold mb-3">Purchase History</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedCustomerInvoices.map((invoice) => (
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
                    ))}

                    {selectedCustomerInvoices.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No purchase history</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Customer</h3>
                <p className="text-muted-foreground">
                  Choose a customer from the list to view their details and purchase history
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
