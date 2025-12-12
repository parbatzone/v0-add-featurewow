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
  message += `_Powered by Exarse Billing Software_\n`

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

export function formatPickupReadyMessage(invoice: WhatsAppInvoice): string {
  const invoiceNumber = invoice.id || `INV-${Date.now()}`
  const date = invoice.date || new Date().toISOString().split("T")[0]

  let message = `🎉 *YOUR ORDER IS READY FOR PICKUP!*\n\n`
  message += `Dear ${invoice.customerName || "Customer"},\n\n`
  message += `We're pleased to inform you that your order is now ready for collection.\n\n`

  message += `━━━━━━━━━━━━━━━━━━━━\n`
  message += `📄 *ORDER DETAILS*\n`
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`

  message += `*Invoice #:* ${invoiceNumber}\n`
  message += `*Order Date:* ${date}\n\n`

  message += `━━━━━━━━━━━━━━━━━━━━\n`
  message += `*ITEMS*\n`
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`

  invoice.items.forEach((item, index) => {
    message += `${index + 1}. ${item.name} (Qty: ${item.quantity})\n`
  })

  message += `\n━━━━━━━━━━━━━━━━━━━━\n`
  message += `*PAYMENT SUMMARY*\n`
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`

  message += `Total Amount: NPR ${invoice.subtotal.toLocaleString()}\n`
  message += `Paid: NPR ${invoice.advance.toLocaleString()}\n`

  if (invoice.remaining > 0) {
    message += `*Amount Due: NPR ${invoice.remaining.toLocaleString()}*\n\n`
    message += `⚠️ Please bring the remaining payment when collecting your order.\n\n`

    message += `*Payment Options:*\n`
    message += `💳 Esewa: 9869317165\n`
    message += `💳 Khalti: 9869317165\n`
    message += `💵 Cash on pickup\n\n`
  } else {
    message += `✅ *Fully Paid*\n\n`
  }

  message += `━━━━━━━━━━━━━━━━━━━━\n\n`
  message += `📍 Visit us at our location during business hours.\n`
  message += `📞 Contact: 9869317165\n\n`
  message += `Thank you for choosing us!\n\n`
  message += `_Powered by Exarse Billing Software_\n`

  return message
}

export function sendPickupReadyMessage(phoneNumber: string, invoice: WhatsAppInvoice) {
  const message = formatPickupReadyMessage(invoice)
  const encodedMessage = encodeURIComponent(message)

  const cleanPhone = phoneNumber.replace(/\D/g, "")
  const fullPhone = cleanPhone.startsWith("977") ? cleanPhone : `977${cleanPhone}`

  const whatsappUrl = `https://wa.me/${fullPhone}?text=${encodedMessage}`
  window.open(whatsappUrl, "_blank")
}
