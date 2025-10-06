"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { generateElectronicsInvoicePDF } from "@/lib/electronics-pdf-generator"
import { sendElectronicsWhatsAppMessage } from "@/lib/electronics-whatsapp-sender"
import { Download, Send } from "lucide-react"

interface QuickBillFormProps {
  onSubmit: (invoice: any) => void
}

export function ElectronicsQuickBillForm({ onSubmit }: QuickBillFormProps) {
  const [customerPhone, setCustomerPhone] = useState("")
  const [subtotal, setSubtotal] = useState("")
  const [advance, setAdvance] = useState("")
  const [status, setStatus] = useState<"paid" | "pending">("pending")
  const [lastInvoice, setLastInvoice] = useState<any>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const subtotalNum = Number.parseFloat(subtotal)
    const advanceNum = Number.parseFloat(advance)

    if (isNaN(subtotalNum) || isNaN(advanceNum)) {
      alert("Please enter valid numbers")
      return
    }

    const invoice = {
      type: "quick" as const,
      customerPhone: customerPhone || undefined,
      items: [],
      subtotal: subtotalNum,
      advance: advanceNum,
      remaining: subtotalNum - advanceNum,
      status,
    }

    onSubmit(invoice)
    setLastInvoice({ ...invoice, id: `ELEC-${Date.now()}`, date: new Date().toISOString().split("T")[0] })

    setCustomerPhone("")
    setSubtotal("")
    setAdvance("")
    setStatus("pending")
  }

  const handleSendWhatsApp = () => {
    if (!lastInvoice) return
    sendElectronicsWhatsAppMessage(lastInvoice)
    // Clear the last invoice after sending to prevent duplicate sends
    setTimeout(() => setLastInvoice(null), 2000)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Customer Phone (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="98XXXXXXXX"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtotal">Total Amount *</Label>
            <Input
              id="subtotal"
              type="number"
              placeholder="5000"
              value={subtotal}
              onChange={(e) => setSubtotal(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="advance">Advance Payment *</Label>
            <Input
              id="advance"
              type="number"
              placeholder="2000"
              value={advance}
              onChange={(e) => setAdvance(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Status</Label>
            <RadioGroup value={status} onValueChange={(value: any) => setStatus(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pending" id="pending" />
                <Label htmlFor="pending">Pending</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paid" id="paid" />
                <Label htmlFor="paid">Paid</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <Button type="submit" className="w-full">
          Generate Invoice
        </Button>
      </form>

      {lastInvoice && (
        <div className="flex gap-2 p-4 bg-muted rounded-lg">
          <Button onClick={() => generateElectronicsInvoicePDF(lastInvoice)} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          {lastInvoice.customerPhone && (
            <Button onClick={handleSendWhatsApp} variant="default" className="flex-1 bg-green-600 hover:bg-green-700">
              <Send className="w-4 h-4 mr-2" />
              Send via WhatsApp
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
