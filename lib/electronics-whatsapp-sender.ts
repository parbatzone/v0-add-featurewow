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
📞 Phone: 9860173537
📞 Phone: 9761132260
📞 Phone: 9869317165

━━━━━━━━━━━━━━━━━━━━━
_Powered by Exarse Billing Software_
  `.trim()

  const phoneNumber = invoice.customerPhone?.startsWith("977") ? invoice.customerPhone : `977${invoice.customerPhone}`

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, "_blank")
}

export function sendElectronicsPickupReadyMessage(invoice: any) {
  const itemsList = invoice.items
    ?.map((item: any, index: number) => `${index + 1}. ${item.name} (Qty: ${item.quantity})`)
    .join("\n")

  const message = `
🎉 *YOUR ORDER IS READY FOR PICKUP!*

Dear ${invoice.customerName || "Customer"},

We're pleased to inform you that your order is now ready for collection at Pratima Electronics.

━━━━━━━━━━━━━━━━━━━━━
📄 *ORDER DETAILS*
━━━━━━━━━━━━━━━━━━━━━

*Invoice #:* ${invoice.id}
*Order Date:* ${invoice.date}

━━━━━━━━━━━━━━━━━━━━━
*ITEMS*
━━━━━━━━━━━━━━━━━━━━━

${itemsList}

━━━━━━━━━━━━━━━━━━━━━
*PAYMENT SUMMARY*
━━━━━━━━━━━━━━━━━━━━━

Total Amount: NPR ${invoice.subtotal.toLocaleString()}
Paid: NPR ${invoice.advance.toLocaleString()}
${invoice.remaining > 0 ? `*Amount Due: NPR ${invoice.remaining.toLocaleString()}*\n\n⚠️ Please bring the remaining payment when collecting your order.\n\n💵 Cash payment accepted at pickup` : `✅ *Fully Paid*`}

━━━━━━━━━━━━━━━━━━━━━

📍 *Visit us at:*
Pratima Electronics
Amarshing Chowk, Kageshwori Manohara - 07
Kathmandu, Nepal

📞 Contact: 9860173537 / 9761132260 / 9869317165

Thank you for choosing Pratima Electronics!

_Powered by Exarse Billing Software_
  `.trim()

  const phoneNumber = invoice.customerPhone?.startsWith("977") ? invoice.customerPhone : `977${invoice.customerPhone}`

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, "_blank")
}
