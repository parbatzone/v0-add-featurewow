"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, FileText, Download, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateInvoicePDF } from "@/lib/pdf-generator"
import { sendWhatsAppMessage } from "@/lib/whatsapp-sender"
import { sendEmailInvoice } from "@/lib/email-sender"

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
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [items, setItems] = useState<Item[]>([{ name: "", quantity: 1, rate: 0, total: 0 }])
  const [advance, setAdvance] = useState("")
  const [discount, setDiscount] = useState("")
  const [createOrderInfo, setCreateOrderInfo] = useState(false)
  const [photoNumber, setPhotoNumber] = useState("")
  const [isLabPhoto, setIsLabPhoto] = useState(false)
  const [addToOrders, setAddToOrders] = useState(false)
  const [sendViaEmail, setSendViaEmail] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastCreatedInvoice, setLastCreatedInvoice] = useState<any>(null)
  const { toast } = useToast()

  const handleNumberInputWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur()
  }

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
    
    // For name field, keep it as string. For numeric fields, convert to number
    if (field === "name") {
      newItems[index] = { ...newItems[index], [field]: value as string }
    } else {
      const numValue = typeof value === "string" ? parseFloat(value) || 0 : value
      newItems[index] = { ...newItems[index], [field]: numValue }
    }

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

    if (createOrderInfo && !photoNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter photo number for order info",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    const invoice = {
      id: `INV-${Date.now()}`,
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
      orderInfo: createOrderInfo
        ? {
            photoNumber: photoNumber.trim(),
            totalAmount: finalTotal,
            advance: advanceAmount,
          }
        : undefined,
      isLabPhoto,
      addToOrders,
    }

    if (isLabPhoto && customerName) {
      const labEntry = {
        id: Date.now().toString(),
        customerName,
        customerPhone: customerPhone || "",
        orderDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        photoType: items.map((item) => item.name).join(", "),
        quantity: items.reduce((sum, item) => sum + item.quantity, 0),
        notes: `Auto-created from invoice ${invoice.id || "INV-" + Date.now()} - Total: NPR ${finalTotal.toLocaleString()}`,
        status: "pending" as const,
        labName: "",
        totalAmount: finalTotal,
      }

      const existingLabOrders = JSON.parse(localStorage.getItem("labOrders") || "[]")
      localStorage.setItem("labOrders", JSON.stringify([labEntry, ...existingLabOrders]))
    }

    if (addToOrders && customerName) {
      const pendingOrder = {
        id: `order-${Date.now()}`,
        orderNumber: `ORD-${String(JSON.parse(localStorage.getItem("studio-pending-orders") || "[]").length + 1).padStart(4, "0")}`,
        customerName,
        customerPhone: customerPhone || "",
        products: items.map((item) => ({
          id: `prod-${Date.now()}-${Math.random()}`,
          name: item.name,
          quantity: item.quantity,
          rate: item.rate,
          total: item.total,
        })),
        totalAmount: finalTotal,
        advance: advanceAmount,
        remaining: remaining,
        status: remaining <= 0 ? "completed" : "pending",
        pickupStatus: "not-picked-up" as const,
        orderDate: new Date().toISOString().split("T")[0],
        expectedDate: "",
        notes: `Auto-created from invoice${isLabPhoto ? " - Lab Photo" : ""}`,
      }

      const existingOrders = JSON.parse(localStorage.getItem("studio-pending-orders") || "[]")
      localStorage.setItem("studio-pending-orders", JSON.stringify([pendingOrder, ...existingOrders]))
    }

    onSubmit(invoice)

    setLastCreatedInvoice(invoice)

    let successMessage = "Detailed bill created successfully"
    if (isLabPhoto && addToOrders) {
      successMessage += " and added to lab management and pending orders"
    } else if (isLabPhoto) {
      successMessage += " and added to lab management"
    } else if (addToOrders) {
      successMessage += " and added to pending orders"
    }

    // Send email if checkbox is selected
    if (sendViaEmail && customerEmail) {
      const emailSent = sendEmailInvoice(customerEmail, invoice)
      if (emailSent) {
        successMessage += " and sent via email"
      } else {
        successMessage += " (email sending failed)"
      }
    }

    toast({
      title: "Success!",
      description: successMessage,
    })

    // Reset form
    setCustomerPhone("")
    setCustomerEmail("")
    setCustomerName("")
    setItems([{ name: "", quantity: 1, rate: 0, total: 0 }])
    setAdvance("")
    setDiscount("")
    setCreateOrderInfo(false)
    setPhotoNumber("")
    setIsLabPhoto(false)
    setAddToOrders(false)
    setSendViaEmail(false)
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
      orderInfo: createOrderInfo
        ? {
            photoNumber: photoNumber.trim(),
            totalAmount: finalTotal,
            advance: advanceAmount,
          }
        : undefined,
      isLabPhoto,
      addToOrders,
    }

    generateInvoicePDF(invoice)
  }

  const handleSendWhatsApp = () => {
    if (!lastCreatedInvoice) return

    if (!customerPhone) {
      toast({
        title: "Error",
        description: "Please enter customer phone number to send via WhatsApp",
        variant: "destructive",
      })
      return
    }

    sendWhatsAppMessage(customerPhone, lastCreatedInvoice)

    toast({
      title: "Opening WhatsApp",
      description: "WhatsApp will open with the bill message",
    })

    setCustomerPhone("")
    setCustomerName("")
    setItems([{ name: "", quantity: 1, rate: 0, total: 0 }])
    setAdvance("")
    setDiscount("")
    setCreateOrderInfo(false)
    setPhotoNumber("")
    setIsLabPhoto(false)
    setAddToOrders(false)
    setLastCreatedInvoice(null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
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
              <Label htmlFor="customer-email">Customer Email (Optional)</Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="customer@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
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
                  onWheel={handleNumberInputWheel}
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
                  onWheel={handleNumberInputWheel}
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

      {/* Auto-Management Options */}
      <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-lg text-blue-700 dark:text-blue-300">Auto-Management Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-lab-photo"
                checked={isLabPhoto}
                onCheckedChange={(checked) => setIsLabPhoto(checked as boolean)}
              />
              <Label htmlFor="is-lab-photo" className="text-sm font-medium">
                This is a lab photo
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="add-to-orders"
                checked={addToOrders}
                onCheckedChange={(checked) => setAddToOrders(checked as boolean)}
              />
              <Label htmlFor="add-to-orders" className="text-sm font-medium">
                Add to pending orders
              </Label>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Save time by automatically creating entries in Lab Management and Pending Orders sections when creating this
            bill.
          </p>
        </CardContent>
      </Card>

      {/* Order Information */}
      <Card className="bg-muted/20">
        <CardHeader>
          <CardTitle className="text-lg">Order Information & Delivery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="create-order-info"
              checked={createOrderInfo}
              onCheckedChange={(checked) => setCreateOrderInfo(checked as boolean)}
            />
            <Label htmlFor="create-order-info" className="text-sm font-medium">
              Create Order Info (Small printable label for frames)
            </Label>
          </div>

          {createOrderInfo && (
            <div className="space-y-2">
              <Label htmlFor="photo-number">Photo Number *</Label>
              <Input
                id="photo-number"
                placeholder="e.g., P001, Frame-12, etc."
                value={photoNumber}
                onChange={(e) => setPhotoNumber(e.target.value)}
                required={createOrderInfo}
              />
              <p className="text-xs text-muted-foreground">
                This will create a small label with invoice number, total amount, advance, and photo number for pasting
                on frames.
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2 pt-2 border-t">
            <Checkbox
              id="send-via-email"
              checked={sendViaEmail}
              onCheckedChange={(checked) => setSendViaEmail(checked as boolean)}
              disabled={!customerEmail}
            />
            <Label htmlFor="send-via-email" className="text-sm font-medium">
              Send Bill via Email {!customerEmail && "(Add email first)"}
            </Label>
          </div>
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

        {lastCreatedInvoice && customerPhone && (
          <Button
            type="button"
            variant="default"
            onClick={handleSendWhatsApp}
            className="bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Send via WhatsApp
          </Button>
        )}
      </div>
    </form>
  )
}
