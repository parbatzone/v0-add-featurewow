export function generateInvoicePDF(invoice: any) {
  // Create a new window for the invoice
  const printWindow = window.open("", "_blank")

  if (!printWindow) {
    alert("Please allow popups to download the PDF")
    return
  }

  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #059669;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .studio-name {
          font-size: 28px;
          font-weight: bold;
          color: #059669;
          margin-bottom: 5px;
        }
        .contact-info {
          color: #666;
          font-size: 14px;
        }
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .invoice-info, .customer-info {
          flex: 1;
        }
        .invoice-info h3, .customer-info h3 {
          color: #059669;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .items-table th,
        .items-table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        .items-table th {
          background-color: #f8f9fa;
          font-weight: bold;
          color: #059669;
        }
        .items-table .text-right {
          text-align: right;
        }
        .totals {
          margin-left: auto;
          width: 300px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .total-row.final {
          border-bottom: 2px solid #059669;
          font-weight: bold;
          font-size: 18px;
          color: #059669;
        }
        .total-row.remaining {
          color: #dc2626;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-paid {
          background-color: #059669;
          color: white;
        }
        .status-pending {
          background-color: #dc2626;
          color: white;
        }
        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="studio-name">Pixel Production</div>
        <div class="contact-info">
          Contact: 9869317165 | Address: Kathmandu, Nepal<br>
          Professional Photo Services
        </div>
      </div>

      <div class="invoice-details">
        <div class="invoice-info">
          <h3>Invoice Details</h3>
          <p><strong>Invoice No:</strong> ${invoice.id}</p>
          <p><strong>Date:</strong> ${invoice.date}</p>
          <p><strong>Type:</strong> ${invoice.type === "quick" ? "Quick Entry" : "Detailed Entry"}</p>
          <span class="status-badge ${invoice.status === "paid" ? "status-paid" : "status-pending"}">
            ${invoice.status}
          </span>
        </div>
        <div class="customer-info">
          <h3>Customer Information</h3>
          ${invoice.customerName ? `<p><strong>Name:</strong> ${invoice.customerName}</p>` : ""}
          ${invoice.customerPhone ? `<p><strong>Phone:</strong> ${invoice.customerPhone}</p>` : "<p>Walk-in Customer</p>"}
        </div>
      </div>

      ${
        invoice.type === "detailed"
          ? `
        <table class="items-table">
          <thead>
            <tr>
              <th>Product/Service</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Rate (NPR)</th>
              <th class="text-right">Total (NPR)</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items
              .map(
                (item: any) => `
              <tr>
                <td>${item.name}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${item.rate.toLocaleString()}</td>
                <td class="text-right">${item.total.toLocaleString()}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      `
          : `
        <table class="items-table">
          <thead>
            <tr>
              <th>Service</th>
              <th class="text-right">Amount (NPR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Photo Service</td>
              <td class="text-right">${invoice.subtotal.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      `
      }

      <div class="totals">
        ${
          invoice.type === "detailed" && invoice.discount
            ? `
          <div class="total-row">
            <span>Subtotal:</span>
            <span>NPR ${(invoice.subtotal + invoice.discount).toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>Discount:</span>
            <span>- NPR ${invoice.discount.toLocaleString()}</span>
          </div>
        `
            : ""
        }
        <div class="total-row final">
          <span>Total Amount:</span>
          <span>NPR ${invoice.subtotal.toLocaleString()}</span>
        </div>
        <div class="total-row">
          <span>Advance Paid:</span>
          <span>NPR ${invoice.advance.toLocaleString()}</span>
        </div>
        <div class="total-row remaining">
          <span>Remaining Balance:</span>
          <span>NPR ${invoice.remaining.toLocaleString()}</span>
        </div>
      </div>

      <div class="footer">
        <p>✓ Thank you for choosing Pixel Production!</p>
        <p>For any queries, please contact us at 9869317165</p>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(invoiceHTML)
  printWindow.document.close()

  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}
