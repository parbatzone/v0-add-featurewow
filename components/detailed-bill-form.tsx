"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, FileText, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateInvoicePDF } from "@/lib/pdf-generator"

interface DetailedBillFormProps {
  onSubmit: (invoice: any) => void
  customers: Array<{
    phone: string
    name: string
    totalBills: number
    totalAmount: number
    lastVisit: string
  }>
}

interface Item {
  name: string
  quantity: number
  rate: number
  total: number
}

export function DetailedBillForm({ onSubmit, customers }: DetailedBillFormProps) {
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [items, setItems] = useState<Item[]>([{ name: "", quantity: 1, rate: 0, total: 0 }])
  const [advance, setAdvance] = useState("")
  const [discount, setDiscount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const discountAmount = Number.parseFloat(discount || "0")
  const finalTotal = subtotal - discountAmount
  const advanceAmount = Number.parseFloat(advance || "0")
  const remaining = finalTotal - advanceAmount

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, rate: 0, total: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof Item, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    if (field === "quantity" || field === "rate") {
      newItems[index].total = newItems[index].quantity * newItems[index].rate
    }

    setItems(newItems)
  }

  const handleCustomerPhoneChange = (phone: string) => {
    setCustomerPhone(phone)
    const existingCustomer = customers.find((c) => c.phone === phone)
    if (existingCustomer) {
      setCustomerName(existingCustomer.name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.some((item) => !item.name || item.rate <= 0)) {
      toast({
        title: "Error",
        description: "Please fill in all item details",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    const invoice = {
      type: "detailed" as const,
      customerPhone: customerPhone || undefined,
      customerName: customerName || undefined,
      items: items.filter((item) => item.name && item.rate > 0),
      subtotal: finalTotal,
      advance: advanceAmount,
      remaining: remaining,
      status: remaining <= 0 ? ("paid" as const) : ("pending" as const),
      discount: discountAmount,
    }

    onSubmit(invoice)

    toast({
      title: "Success!",
      description: "Detailed bill created successfully",
    })

    // Reset form
    setCustomerPhone("")
    setCustomerName("")
    setItems([{ name: "", quantity: 1, rate: 0, total: 0 }])
    setAdvance("")
    setDiscount("")
    setIsSubmitting(false)
  }

  const handleDownloadPDF = () => {
    if (items.some((item) => !item.name || item.rate <= 0)) return

    const invoice = {
      id: `PREVIEW-${Date.now()}`,
      type: "detailed" as const,
      customerPhone: customerPhone || undefined,
      customerName: customerName || undefined,
      items: items.filter((item) => item.name && item.rate > 0),
      subtotal: finalTotal,
      advance: advanceAmount,
      remaining: remaining,
      date: new Date().toISOString().split("T")[0],
      status: remaining <= 0 ? ("paid" as const) : ("pending" as const),
      discount: discountAmount,
    }

    generateInvoicePDF(invoice)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer-phone">Customer Phone</Label>
              <Input
                id="customer-phone"
                placeholder="98XXXXXXXX"
                value={customerPhone}
                onChange={(e) => handleCustomerPhoneChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-name">Customer Name</Label>
              <Input
                id="customer-name"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Items & Services</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="grid gap-4 md:grid-cols-5 items-end p-4 border rounded-lg">
              <div className="space-y-2 md:col-span-2">
                <Label>Product/Service Name</Label>
                <Input
                  placeholder="e.g., Passport Photo"
                  value={item.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label>Rate (NPR)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.rate}
                  onChange={(e) => updateItem(index, "rate", Number.parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <Label className="text-sm text-muted-foreground">Total</Label>
                  <div className="font-semibold">NPR {item.total.toLocaleString()}</div>
                </div>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="discount">Discount (NPR)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="advance">Advance Paid (NPR)</Label>
              <Input
                id="advance"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={advance}
                onChange={(e) => setAdvance(e.target.value)}
              />
            </div>
          </div>

          {subtotal > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">NPR {subtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-primary">
                      <span>Discount:</span>
                      <span className="font-medium">- NPR {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Final Total:</span>
                    <span className="font-medium">NPR {finalTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Advance Paid:</span>
                    <span className="font-medium">NPR {advanceAmount.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Remaining Balance:</span>
                    <span className={remaining > 0 ? "text-destructive" : "text-primary"}>
                      NPR {remaining.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <Badge variant={remaining <= 0 ? "default" : "destructive"}>
                      {remaining <= 0 ? "PAID" : "PENDING"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting || items.some((item) => !item.name || item.rate <= 0)}
          className="flex-1"
        >
          <FileText className="w-4 h-4 mr-2" />
          {isSubmitting ? "Creating..." : "Create Detailed Bill"}
        </Button>

        {subtotal > 0 && !items.some((item) => !item.name || item.rate <= 0) && (
          <Button type="button" variant="outline" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Preview PDF
          </Button>
        )}
      </div>
    </form>
  )
}
