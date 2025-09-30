export interface WhatsAppInvoice {
  id?: string
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
  discount?: number
  advance: number
  remaining: number
  date?: string
  status: "paid" | "pending"
}

export function formatInvoiceForWhatsApp(invoice: WhatsAppInvoice): string {
  const invoiceNumber = invoice.id || `INV-${Date.now()}`
  const date = invoice.date || new Date().toISOString().split("T")[0]

  let message = `Thank you for your order! We truly appreciate your support and look forward to serving you again.\n\n`
  message += `━━━━━━━━━━━━━━━━━━━━\n`
  message += `📄 *INVOICE*\n`
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`

  message += `*Invoice #:* ${invoiceNumber}\n`
  message += `*Date:* ${date}\n`

  if (invoice.customerName) {
    message += `*Customer:* ${invoice.customerName}\n`
  }
  if (invoice.customerPhone) {
    message += `*Phone:* ${invoice.customerPhone}\n`
  }

  message += `\n━━━━━━━━━━━━━━━━━━━━\n`
  message += `*ITEMS*\n`
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`

  invoice.items.forEach((item, index) => {
    message += `${index + 1}. *${item.name}*\n`
    message += `   Qty: ${item.quantity} × NPR ${item.rate.toLocaleString()}\n`
    message += `   Total: NPR ${item.total.toLocaleString()}\n\n`
  })

  message += `━━━━━━━━━━━━━━━━━━━━\n`
  message += `*PAYMENT DETAILS*\n`
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`

  message += `Subtotal: NPR ${invoice.subtotal.toLocaleString()}\n`

  if (invoice.discount && invoice.discount > 0) {
    message += `Discount: - NPR ${invoice.discount.toLocaleString()}\n`
    message += `Final Total: NPR ${(invoice.subtotal - invoice.discount).toLocaleString()}\n`
  }

  message += `Advance Paid: NPR ${invoice.advance.toLocaleString()}\n`
  message += `*Remaining: NPR ${invoice.remaining.toLocaleString()}*\n\n`

  message += `Status: ${invoice.status === "paid" ? "✅ PAID" : "⏳ PENDING"}\n\n`

  message += `━━━━━━━━━━━━━━━━━━━━\n`
  message += `*PAYMENT OPTIONS*\n`
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`

  message += `💳 Esewa: 9869317165\n`
  message += `💳 Khalti: 9869317165\n`
  message += `📧 Email: cellsansarphotostudio@gmail.com\n`
  message += `📞 Phone: 9869317165\n\n`

  message += `━━━━━━━━━━━━━━━━━━━━\n\n`
  message += `_Powered by Pixel Production Order Management System_\n`

  return message
}

export function sendWhatsAppMessage(phoneNumber: string, invoice: WhatsAppInvoice) {
  const message = formatInvoiceForWhatsApp(invoice)
  const encodedMessage = encodeURIComponent(message)

  // Remove any non-numeric characters from phone number
  const cleanPhone = phoneNumber.replace(/\D/g, "")

  // Add country code if not present (assuming Nepal +977)
  const fullPhone = cleanPhone.startsWith("977") ? cleanPhone : `977${cleanPhone}`

  // Open WhatsApp with the formatted message
  const whatsappUrl = `https://wa.me/${fullPhone}?text=${encodedMessage}`
  window.open(whatsappUrl, "_blank")
}
