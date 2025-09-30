"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { generateElectronicsInvoicePDF } from "@/lib/electronics-pdf-generator"
import { Search, Download, Trash2 } from "lucide-react"

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

interface InvoiceHistoryProps {
  invoices: Invoice[]
  setInvoices: (invoices: Invoice[]) => void
}

export function ElectronicsInvoiceHistory({ invoices, setInvoices }: InvoiceHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerPhone?.includes(searchTerm) ||
      inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const deleteInvoice = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      setInvoices(invoices.filter((inv) => inv.id !== id))
    }
  }

  return (
    <Card className="glass-effect border-border/50 decorative-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-space-grotesk">
          <Search className="w-5 h-5 text-primary" />
          Invoice History
        </CardTitle>
        <CardDescription>Search and view all past invoices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search by invoice ID, phone, or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="space-y-3">
          {filteredInvoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No invoices found</p>
          ) : (
            filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{invoice.id}</span>
                      <Badge variant={invoice.status === "paid" ? "default" : "destructive"}>{invoice.status}</Badge>
                      <Badge variant="outline">{invoice.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {invoice.customerName || "Walk-in"} {invoice.customerPhone && `• ${invoice.customerPhone}`}
                    </p>
                    <p className="text-sm">
                      Total: NPR {invoice.subtotal.toLocaleString()} • Remaining: NPR{" "}
                      {invoice.remaining.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">{invoice.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => generateElectronicsInvoicePDF(invoice)} size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => deleteInvoice(invoice.id)} size="sm" variant="destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
