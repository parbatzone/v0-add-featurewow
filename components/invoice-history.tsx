"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Trash2, Bell } from "lucide-react"
import { generateInvoicePDF } from "@/lib/pdf-generator"
import { sendPickupReadyMessage } from "@/lib/whatsapp-sender"
import { useToast } from "@/hooks/use-toast"

interface InvoiceHistoryProps {
  invoices: Array<{
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
  }>
  setInvoices: (invoices: any[]) => void
}

export function InvoiceHistory({ invoices, setInvoices }: InvoiceHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const { toast } = useToast()

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.customerPhone && invoice.customerPhone.includes(searchTerm)) ||
      (invoice.customerName && invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    const matchesType = typeFilter === "all" || invoice.type === typeFilter

    let matchesDate = true
    if (dateFilter === "today") {
      matchesDate = invoice.date === new Date().toISOString().split("T")[0]
    } else if (dateFilter === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      matchesDate = new Date(invoice.date) >= weekAgo
    } else if (dateFilter === "month") {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      matchesDate = new Date(invoice.date) >= monthAgo
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate
  })

  const markAsPaid = (invoiceId: string) => {
    setInvoices(
      invoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: "paid" as const, remaining: 0, advance: inv.subtotal } : inv,
      ),
    )
  }

  const deleteInvoice = (invoiceId: string) => {
    if (confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      setInvoices(invoices.filter((inv) => inv.id !== invoiceId))
    }
  }

  const notifyCustomer = (invoice: any) => {
    if (!invoice.customerPhone) {
      toast({
        title: "No Phone Number",
        description: "This invoice doesn't have a customer phone number.",
        variant: "destructive",
      })
      return
    }

    sendPickupReadyMessage(invoice.customerPhone, invoice)
    toast({
      title: "Notification Sent",
      description: "Customer notified via WhatsApp that order is ready for pickup.",
    })
  }

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.subtotal, 0)
  const pendingAmount = filteredInvoices
    .filter((inv) => inv.status === "pending")
    .reduce((sum, inv) => sum + inv.remaining, 0)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Invoice History
          </CardTitle>
          <CardDescription>Search and filter your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search by invoice ID, phone, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="quick">Quick Bill</SelectItem>
                <SelectItem value="detailed">Detailed Bill</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="flex gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">{filteredInvoices.length}</div>
              <div className="text-sm text-muted-foreground">Total Bills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">NPR {totalAmount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Amount</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">NPR {pendingAmount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{invoice.id}</h3>
                    <Badge variant={invoice.type === "quick" ? "secondary" : "outline"}>
                      {invoice.type === "quick" ? "Quick" : "Detailed"}
                    </Badge>
                    <Badge variant={invoice.status === "paid" ? "default" : "destructive"}>
                      {invoice.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {invoice.date} • {invoice.customerPhone || "No phone"} • {invoice.customerName || "No name"}
                  </div>
                  <div className="text-sm">{invoice.items.map((item) => item.name).join(", ")}</div>
                </div>

                <div className="text-right space-y-2">
                  <div>
                    <div className="text-lg font-bold">NPR {invoice.subtotal.toLocaleString()}</div>
                    {invoice.remaining > 0 && (
                      <div className="text-sm text-destructive">Pending: NPR {invoice.remaining.toLocaleString()}</div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-green-500/10 hover:bg-green-500/20 text-green-600 border-green-500/30"
                      onClick={() => notifyCustomer(invoice)}
                      disabled={!invoice.customerPhone}
                    >
                      <Bell className="w-4 h-4 mr-1" />
                      Arrived
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => generateInvoicePDF(invoice)}>
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                    {invoice.status === "pending" && (
                      <Button size="sm" onClick={() => markAsPaid(invoice.id)}>
                        Mark Paid
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => deleteInvoice(invoice.id)}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredInvoices.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
