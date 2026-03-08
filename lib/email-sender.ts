import { generateInvoicePDF } from "./pdf-generator"

export interface EmailInvoice {
  id?: string
  type: "quick" | "detailed"
  customerPhone?: string
  customerEmail?: string
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

export function formatInvoiceForEmail(invoice: EmailInvoice): string {
  const invoiceNumber = invoice.id || `INV-${Date.now()}`
  const date = invoice.date || new Date().toISOString().split("T")[0]

  let emailBody = `Dear ${invoice.customerName || "Valued Customer"},\n\n`
  emailBody += `Thank you for your order! Your invoice details are below:\n\n`

  emailBody += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  emailBody += `INVOICE DETAILS\n`
  emailBody += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`

  emailBody += `Invoice #: ${invoiceNumber}\n`
  emailBody += `Date: ${date}\n`
  if (invoice.customerPhone) {
    emailBody += `Phone: ${invoice.customerPhone}\n`
  }
  emailBody += `Status: ${invoice.status === "paid" ? "PAID" : "PENDING"}\n\n`

  emailBody += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  emailBody += `ITEMS\n`
  emailBody += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`

  invoice.items.forEach((item, index) => {
    emailBody += `${index + 1}. ${item.name}\n`
    emailBody += `   Quantity: ${item.quantity}\n`
    emailBody += `   Rate: NPR ${item.rate.toLocaleString()}\n`
    emailBody += `   Total: NPR ${item.total.toLocaleString()}\n\n`
  })

  emailBody += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  emailBody += `PAYMENT SUMMARY\n`
  emailBody += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`

  emailBody += `Subtotal: NPR ${invoice.subtotal.toLocaleString()}\n`

  if (invoice.discount && invoice.discount > 0) {
    emailBody += `Discount: - NPR ${invoice.discount.toLocaleString()}\n`
    emailBody += `Final Total: NPR ${(invoice.subtotal - invoice.discount).toLocaleString()}\n`
  }

  emailBody += `Advance Paid: NPR ${invoice.advance.toLocaleString()}\n`
  emailBody += `Remaining: NPR ${invoice.remaining.toLocaleString()}\n\n`

  emailBody += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  emailBody += `PAYMENT OPTIONS\n`
  emailBody += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`

  emailBody += `eSewa: 9869317165\n`
  emailBody += `Khalti: 9869317165\n`
  emailBody += `Email: cellsansarphotostudio@gmail.com\n`
  emailBody += `Phone: 9869317165\n\n`

  emailBody += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
  emailBody += `Please find the PDF invoice attached for your records.\n\n`
  emailBody += `Thank you for your business!\n\n`
  emailBody += `Best regards,\nExarse Billing Software`

  return emailBody
}

export function sendEmailInvoice(email: string, invoice: EmailInvoice) {
  if (!email || !email.includes("@")) {
    console.error("[v0] Invalid email address:", email)
    return false
  }

  try {
    // Generate the formatted email body
    const emailBody = formatInvoiceForEmail(invoice)

    // Generate PDF (returns a promise but we proceed with email link)
    generateInvoicePDF(invoice, invoice.customerName || "Invoice")

    // Create mailto link with the formatted invoice details
    const subject = `Invoice ${invoice.id || "Receipt"}`
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`

    // Open email client
    window.open(mailtoLink)

    return true
  } catch (error) {
    console.error("[v0] Error sending email:", error)
    return false
  }
}
