"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Zap, Download, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateInvoicePDF } from "@/lib/pdf-generator"
import { sendWhatsAppMessage } from "@/lib/whatsapp-sender"

interface QuickBillFormProps {
  onSubmit: (invoice: any) => void
}

export function QuickBillForm({ onSubmit }: QuickBillFormProps) {
  const [price, setPrice] = useState("")
  const [advance, setAdvance] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [createOrderInfo, setCreateOrderInfo] = useState(false)
  const [photoNumber, setPhotoNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastCreatedInvoice, setLastCreatedInvoice] = useState<any>(null)
  const { toast } = useToast()

  const remaining = price && advance ? Number.parseFloat(price) - Number.parseFloat(advance || "0") : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!price || Number.parseFloat(price) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
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
      type: "quick" as const,
      customerPhone: customerPhone || undefined,
      items: [
        {
          name: "Photo Service",
          quantity: 1,
          rate: Number.parseFloat(price),
          total: Number.parseFloat(price),
        },
      ],
      subtotal: Number.parseFloat(price),
      advance: Number.parseFloat(advance || "0"),
      remaining: remaining,
      date: new Date().toISOString().split("T")[0],
      status: remaining <= 0 ? ("paid" as const) : ("pending" as const),
      orderInfo: createOrderInfo
        ? {
            photoNumber: photoNumber.trim(),
            totalAmount: Number.parseFloat(price),
            advance: Number.parseFloat(advance || "0"),
          }
        : undefined,
    }

    onSubmit(invoice)

    setLastCreatedInvoice(invoice)

    toast({
      title: "Success!",
      description: "Quick bill created successfully",
    })

    setIsSubmitting(false)
  }

  const handleDownloadPDF = () => {
    if (!price) return

    const invoice = {
      id: `PREVIEW-${Date.now()}`,
      type: "quick" as const,
      customerPhone: customerPhone || undefined,
      items: [
        {
          name: "Photo Service",
          quantity: 1,
          rate: Number.parseFloat(price),
          total: Number.parseFloat(price),
        },
      ],
      subtotal: Number.parseFloat(price),
      advance: Number.parseFloat(advance || "0"),
      remaining: remaining,
      date: new Date().toISOString().split("T")[0],
      status: remaining <= 0 ? ("paid" as const) : ("pending" as const),
      orderInfo: createOrderInfo
        ? {
            photoNumber: photoNumber.trim(),
            totalAmount: Number.parseFloat(price),
            advance: Number.parseFloat(advance || "0"),
          }
        : undefined,
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

    setPrice("")
    setAdvance("")
    setCustomerPhone("")
    setCreateOrderInfo(false)
    setPhotoNumber("")
    setLastCreatedInvoice(null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer-phone">Customer Phone (Optional)</Label>
          <Input
            id="customer-phone"
            placeholder="98XXXXXXXX"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Total Price (NPR) *</Label>
          <Input
            id="price"
            type="number"
            placeholder="1200"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="advance">Advance Paid (NPR)</Label>
        <Input
          id="advance"
          type="number"
          placeholder="500"
          value={advance}
          onChange={(e) => setAdvance(e.target.value)}
        />
      </div>

      <Card className="bg-muted/20">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 mb-4">
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
        </CardContent>
      </Card>

      {price && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total Price:</span>
                <span className="font-medium">NPR {Number.parseFloat(price).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Advance Paid:</span>
                <span className="font-medium">NPR {Number.parseFloat(advance || "0").toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Remaining Balance:</span>
                <span className={remaining > 0 ? "text-destructive" : "text-primary"}>
                  NPR {remaining.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting || !price} className="flex-1">
          <Zap className="w-4 h-4 mr-2" />
          {isSubmitting ? "Creating..." : "Create Quick Bill"}
        </Button>

        {price && (
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
