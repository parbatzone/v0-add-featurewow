export function sendElectronicsWhatsAppMessage(invoice: any) {
  const itemsList = invoice.items
    ?.map(
      (item: any, index: number) =>
        `${index + 1}. ${item.name} - Qty: ${item.quantity} × NPR ${item.rate.toLocaleString()} = NPR ${item.total.toLocaleString()}`,
    )
    .join("\n")

  const message = `
*Thank you for your order!*
We truly appreciate your support and look forward to serving you again.

━━━━━━━━━━━━━━━━━━━━━
*PRATIMA ELECTRONICS*
Amarshing Chowk, Kageshwori Manohara - 07
Kathmandu, Nepal
━━━━━━━━━━━━━━━━━━━━━

*INVOICE DETAILS*
Invoice #: ${invoice.id}
Date: ${invoice.date}
Customer: ${invoice.customerName || "Walk-in Customer"}
${invoice.customerPhone ? `Phone: ${invoice.customerPhone}` : ""}

━━━━━━━━━━━━━━━━━━━━━
*PRODUCTS*
${itemsList || "Electronics Product"}

━━━━━━━━━━━━━━━━━━━━━
*PAYMENT SUMMARY*
${invoice.discount > 0 ? `Subtotal: NPR ${(invoice.subtotal + invoice.discount).toLocaleString()}\nDiscount: - NPR ${invoice.discount.toLocaleString()}\n` : ""}Subtotal: NPR ${invoice.subtotal.toLocaleString()}
Advance Paid: NPR ${invoice.advance.toLocaleString()}
*Balance Due: NPR ${invoice.remaining.toLocaleString()}*

Status: ${invoice.status.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━
*CONTACT US*
📞 Phone: 9869317165
📱 WhatsApp: 9869317165
📞 Viber: 9869317165

━━━━━━━━━━━━━━━━━━━━━
_Powered by Pratima Electronics Order Management System_
  `.trim()

  const phoneNumber = invoice.customerPhone?.startsWith("977") ? invoice.customerPhone : `977${invoice.customerPhone}`

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, "_blank")
}
