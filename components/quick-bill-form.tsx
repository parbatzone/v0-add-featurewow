"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Zap, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateInvoicePDF } from "@/lib/pdf-generator"

interface QuickBillFormProps {
  onSubmit: (invoice: any) => void
}

export function QuickBillForm({ onSubmit }: QuickBillFormProps) {
  const [price, setPrice] = useState("")
  const [advance, setAdvance] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
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

    setIsSubmitting(true)

    const invoice = {
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
      status: remaining <= 0 ? ("paid" as const) : ("pending" as const),
    }

    onSubmit(invoice)

    toast({
      title: "Success!",
      description: "Quick bill created successfully",
    })

    // Reset form
    setPrice("")
    setAdvance("")
    setCustomerPhone("")
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
    }

    generateInvoicePDF(invoice)
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
      </div>
    </form>
  )
}
