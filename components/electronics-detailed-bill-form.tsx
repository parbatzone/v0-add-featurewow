"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card } from "@/components/ui/card"
import { generateElectronicsInvoicePDF } from "@/lib/electronics-pdf-generator"
import { sendElectronicsWhatsAppMessage } from "@/lib/electronics-whatsapp-sender"
import { Plus, Trash2, Download, Send } from "lucide-react"

interface DetailedBillFormProps {
  onSubmit: (invoice: any) => void
  customers: Array<{ phone: string; name: string }>
}

interface Item {
  name: string
  quantity: number
  rate: number
  total: number
}

export function ElectronicsDetailedBillForm({ onSubmit, customers }: DetailedBillFormProps) {
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [items, setItems] = useState<Item[]>([{ name: "", quantity: 1, rate: 0, total: 0 }])
  const [discount, setDiscount] = useState(0)
  const [advance, setAdvance] = useState(0)
  const [status, setStatus] = useState<"paid" | "pending">("pending")
  const [lastInvoice, setLastInvoice] = useState<any>(null)

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, rate: 0, total: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof Item, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    if (field === "quantity" || field === "rate") {
      newItems[index].total = newItems[index].quantity * newItems[index].rate
    }

    setItems(newItems)
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const finalTotal = subtotal - discount
  const remaining = finalTotal - advance

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (items.some((item) => !item.name || item.quantity <= 0 || item.rate <= 0)) {
      alert("Please fill in all item details correctly")
      return
    }

    const invoice = {
      type: "detailed" as const,
      customerPhone: customerPhone || undefined,
      customerName: customerName || undefined,
      items,
      subtotal: finalTotal,
      discount,
      advance,
      remaining,
      status,
    }

    onSubmit(invoice)
    setLastInvoice({ ...invoice, id: `ELEC-${Date.now()}`, date: new Date().toISOString().split("T")[0] })

    setCustomerPhone("")
    setCustomerName("")
    setItems([{ name: "", quantity: 1, rate: 0, total: 0 }])
    setDiscount(0)
    setAdvance(0)
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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Customer Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="98XXXXXXXX"
              value={customerPhone}
              onChange={(e) => {
                setCustomerPhone(e.target.value)
                const customer = customers.find((c) => c.phone === e.target.value)
                if (customer) setCustomerName(customer.name)
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Customer Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Products</Label>
            <Button type="button" onClick={addItem} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          {items.map((item, index) => (
            <Card key={index} className="p-4">
              <div className="grid gap-4 md:grid-cols-5">
                <div className="md:col-span-2 space-y-2">
                  <Label>Product Name</Label>
                  <Input
                    placeholder="e.g., LED TV 32 inch"
                    value={item.name}
                    onChange={(e) => updateItem(index, "name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rate (NPR)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={item.rate}
                    onChange={(e) => updateItem(index, "rate", Number.parseFloat(e.target.value))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total</Label>
                  <div className="flex items-center gap-2">
                    <Input value={`NPR ${item.total.toLocaleString()}`} disabled />
                    {items.length > 1 && (
                      <Button type="button" onClick={() => removeItem(index)} size="icon" variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="discount">Discount (NPR)</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(Number.parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="advance">Advance Payment (NPR)</Label>
            <Input
              id="advance"
              type="number"
              min="0"
              value={advance}
              onChange={(e) => setAdvance(Number.parseFloat(e.target.value) || 0)}
              required
            />
          </div>
        </div>

        <Card className="p-4 bg-muted">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>NPR {subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-destructive">
                <span>Discount:</span>
                <span>- NPR {discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Advance:</span>
              <span>NPR {advance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Remaining:</span>
              <span>NPR {remaining.toLocaleString()}</span>
            </div>
          </div>
        </Card>

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
