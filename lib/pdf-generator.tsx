export function generateInvoicePDF(invoice: any) {
  // Create a new window for the invoice
  const printWindow = window.open("", "_blank")

  if (!printWindow) {
    alert("Please allow popups to download the PDF")
    return
  }

  const orderInfoHTML = invoice.orderInfo
    ? `
    <div class="order-info-section">
      <div class="order-info-label">
        <div class="label-header">
          <img src="/images/pixel-production-logo.jpg" alt="Pixel Production" class="label-logo">
          <div class="label-title">PIXEL PRODUCTION</div>
          <div class="label-phone">9869317165</div>
        </div>
        <div class="label-content">
          <div class="label-row">
            <span>Invoice:</span>
            <span>${invoice.id}</span>
          </div>
          <div class="label-row">
            <span>Photo:</span>
            <span>${invoice.orderInfo.photoNumber}</span>
          </div>
          <div class="label-row">
            <span>Total:</span>
            <span>NPR ${invoice.orderInfo.totalAmount.toLocaleString()}</span>
          </div>
          <div class="label-row">
            <span>Advance:</span>
            <span>NPR ${invoice.orderInfo.advance.toLocaleString()}</span>
          </div>
          <div class="label-row remaining">
            <span>Balance:</span>
            <span>NPR ${(invoice.orderInfo.totalAmount - invoice.orderInfo.advance).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  `
    : ""

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
          position: relative;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #059669;
          padding-bottom: 20px;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }
        .header-logo {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }
        .header-text {
          text-align: left;
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
        .stamp-logo {
          position: absolute;
          top: 200px;
          right: 50px;
          width: 120px;
          height: 120px;
          opacity: 0.15;
          transform: rotate(-15deg);
          border: 3px solid #059669;
          border-radius: 50%;
          padding: 15px;
          background: rgba(5, 150, 105, 0.05);
          box-shadow: 0 0 0 2px #059669;
          z-index: 1;
        }
        .stamp-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: sepia(1) hue-rotate(120deg) saturate(2);
        }
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          position: relative;
          z-index: 2;
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
        .order-info-section {
          margin-top: 40px;
          page-break-inside: avoid;
          display: flex;
          justify-content: center;
        }
        .order-info-label {
          width: 280px;
          height: 180px;
          border: 2px solid #059669;
          padding: 12px;
          font-size: 12px;
          background: white;
          box-sizing: border-box;
        }
        .label-header {
          text-align: center;
          margin-bottom: 10px;
          border-bottom: 1px solid #059669;
          padding-bottom: 6px;
        }
        .label-logo {
          width: 24px;
          height: 24px;
          object-fit: contain;
          margin-bottom: 4px;
        }
        .label-title {
          font-weight: bold;
          color: #059669;
          font-size: 12px;
          margin-bottom: 2px;
        }
        .label-phone {
          font-size: 10px;
          color: #666;
          font-weight: normal;
        }
        .label-content {
          margin-bottom: 10px;
        }
        .label-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 11px;
        }
        .label-row.remaining {
          font-weight: bold;
          color: #dc2626;
          border-top: 1px solid #ddd;
          padding-top: 4px;
          margin-top: 6px;
        }
        @media print {
          body { margin: 0; }
          .order-info-section {
            margin-top: 30px;
          }
          .stamp-logo {
            opacity: 0.1;
          }
          @page {
            size: A4;
            margin: 1cm;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="/images/pixel-production-logo.jpg" alt="Pixel Production Logo" class="header-logo">
        <div class="header-text">
          <div class="studio-name">Pixel Production</div>
          <div class="contact-info">
            Contact: 9869317165 | Address: Kathmandu, Nepal<br>
            Professional Photo Services
          </div>
        </div>
      </div>

      <div class="stamp-logo">
        <img src="/images/pixel-production-logo.jpg" alt="Pixel Production Stamp">
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

      ${orderInfoHTML}
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
