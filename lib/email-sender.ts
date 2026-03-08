export function sendEmailInvoice(email: string, invoice: any) {
  if (!email || !email.includes("@")) {
    console.error("[v0] Invalid email address:", email)
    return false
  }

  try {
    // Create the email content
    const invoiceDetails = invoice.items
      .map((item: any) => `${item.name} x ${item.quantity} @ NPR ${item.rate} = NPR ${item.total}`)
      .join("\n")

    const emailBody = `
Invoice Details
===============
Invoice ID: ${invoice.id}
Date: ${invoice.date}
Customer: ${invoice.customerName || "N/A"}

Items:
${invoiceDetails}

Subtotal: NPR ${invoice.subtotal?.toLocaleString()}
Discount: NPR ${invoice.discount?.toLocaleString() || "0"}
Advance: NPR ${invoice.advance?.toLocaleString() || "0"}
Remaining: NPR ${invoice.remaining?.toLocaleString()}

Thank you for your business!
    `.trim()

    // Use mailto: for client-side email
    const mailtoLink = `mailto:${email}?subject=Invoice ${invoice.id}&body=${encodeURIComponent(emailBody)}`
    window.open(mailtoLink)

    return true
  } catch (error) {
    console.error("[v0] Error sending email:", error)
    return false
  }
}
