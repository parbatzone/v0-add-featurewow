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
          <img src="/images/pixel-production-stamp.png" alt="Pixel Production" class="label-logo">
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
          font-family: 'Times New Roman', serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
          position: relative;
          background: white;
        }
        
        /* Enhanced header with decorative border */
        .header {
          text-align: center;
          border: 3px double #000;
          padding: 25px;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 25px;
          background: linear-gradient(45deg, #f8f9fa 0%, #ffffff 50%, #f8f9fa 100%);
          position: relative;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          bottom: 10px;
          border: 1px solid #000;
          pointer-events: none;
        }
        
        .header-logo {
          width: 80px;
          height: 80px;
          object-fit: contain;
          border: 2px solid #000;
          border-radius: 50%;
          padding: 5px;
          background: white;
        }
        
        .header-text {
          text-align: left;
        }
        
        .studio-name {
          font-size: 32px;
          font-weight: bold;
          color: #000;
          margin-bottom: 8px;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
          letter-spacing: 2px;
        }
        
        .contact-info {
          color: #333;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
        }
        
        /* New professional stamp design */
        .stamp-logo {
          position: absolute;
          top: 180px;
          right: 40px;
          width: 140px;
          height: 140px;
          opacity: 0.25;
          transform: rotate(-12deg);
          border: 4px solid #000;
          border-radius: 50%;
          padding: 10px;
          background: white;
          box-shadow: 0 0 0 2px #000, inset 0 0 0 2px #000;
          z-index: 1;
        }
        
        .stamp-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: contrast(1.2) brightness(0.8);
        }
        
        /* Enhanced invoice details section */
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          position: relative;
          z-index: 2;
          border: 2px solid #000;
          padding: 20px;
          background: #f8f9fa;
        }
        
        .invoice-info, .customer-info {
          flex: 1;
        }
        
        .invoice-info h3, .customer-info h3 {
          color: #000;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: bold;
          text-decoration: underline;
          text-decoration-thickness: 2px;
        }
        
        .invoice-info p, .customer-info p {
          margin: 8px 0;
          font-weight: 500;
        }
        
        /* Professional table design */
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          border: 3px solid #000;
        }
        
        .items-table th,
        .items-table td {
          border: 2px solid #000;
          padding: 15px 12px;
          text-align: left;
          font-weight: 500;
        }
        
        .items-table th {
          background: #000;
          color: white;
          font-weight: bold;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .items-table td {
          background: white;
        }
        
        .items-table .text-right {
          text-align: right;
          font-weight: bold;
        }
        
        /* Enhanced totals section */
        .totals {
          margin-left: auto;
          width: 350px;
          border: 3px double #000;
          padding: 20px;
          background: #f8f9fa;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #ccc;
          font-weight: 500;
        }
        
        .total-row.final {
          border-bottom: 3px double #000;
          border-top: 3px double #000;
          font-weight: bold;
          font-size: 20px;
          color: #000;
          padding: 15px 0;
          margin: 10px 0;
          background: white;
          text-transform: uppercase;
        }
        
        .total-row.remaining {
          color: #000;
          font-weight: bold;
          font-size: 16px;
          background: #e5e5e5;
          padding: 12px 0;
        }
        
        /* Added signature section */
        .signature-section {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
          align-items: end;
          border-top: 2px solid #000;
          padding-top: 30px;
        }
        
        .signature-box {
          text-align: center;
          width: 250px;
        }
        
        .signature-image {
          width: 180px;
          height: 80px;
          object-fit: contain;
          margin-bottom: 10px;
          filter: contrast(1.3) brightness(0.7);
        }
        
        .signature-line {
          border-top: 2px solid #000;
          margin: 10px 0 5px 0;
          width: 200px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .signature-name {
          font-weight: bold;
          font-size: 16px;
          color: #000;
          margin-bottom: 5px;
        }
        
        .signature-title {
          font-size: 12px;
          color: #666;
          font-style: italic;
        }
        
        .customer-signature {
          text-align: center;
          width: 200px;
        }
        
        .customer-signature-line {
          border-top: 2px solid #000;
          margin: 60px 0 5px 0;
        }
        
        /* Enhanced footer with decorative elements */
        .footer {
          text-align: center;
          margin-top: 40px;
          padding: 25px;
          border: 2px solid #000;
          background: #f8f9fa;
          position: relative;
        }
        
        .footer::before {
          content: '★ ★ ★';
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 0 15px;
          font-size: 16px;
          color: #000;
        }
        
        .footer p {
          margin: 8px 0;
          font-weight: 500;
        }
        
        .footer .thank-you {
          font-size: 18px;
          font-weight: bold;
          color: #000;
          margin-bottom: 10px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border: 2px solid #000;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          background: white;
          color: #000;
          letter-spacing: 1px;
        }
        
        .status-paid {
          background: #000;
          color: white;
        }
        
        .status-pending {
          background: white;
          color: #000;
        }
        
        /* Enhanced order info label */
        .order-info-section {
          margin-top: 50px;
          page-break-inside: avoid;
          display: flex;
          justify-content: center;
        }
        
        .order-info-label {
          width: 300px;
          height: 200px;
          border: 3px double #000;
          padding: 15px;
          font-size: 13px;
          background: white;
          box-sizing: border-box;
          position: relative;
        }
        
        .order-info-label::before {
          content: '';
          position: absolute;
          top: 8px;
          left: 8px;
          right: 8px;
          bottom: 8px;
          border: 1px solid #000;
          pointer-events: none;
        }
        
        .label-header {
          text-align: center;
          margin-bottom: 12px;
          border-bottom: 2px solid #000;
          padding-bottom: 8px;
        }
        
        .label-logo {
          width: 30px;
          height: 30px;
          object-fit: contain;
          margin-bottom: 5px;
          border: 1px solid #000;
          border-radius: 50%;
          padding: 2px;
        }
        
        .label-title {
          font-weight: bold;
          color: #000;
          font-size: 14px;
          margin-bottom: 3px;
          letter-spacing: 1px;
        }
        
        .label-phone {
          font-size: 11px;
          color: #000;
          font-weight: 500;
        }
        
        .label-content {
          margin-bottom: 12px;
        }
        
        .label-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .label-row.remaining {
          font-weight: bold;
          color: #000;
          border-top: 2px solid #000;
          padding-top: 6px;
          margin-top: 8px;
          font-size: 13px;
        }
        
        /* Print optimizations for black and white */
        @media print {
          body { 
            margin: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .header {
            background: white !important;
          }
          
          .invoice-details {
            background: white !important;
          }
          
          .totals {
            background: white !important;
          }
          
          .footer {
            background: white !important;
          }
          
          .stamp-logo {
            opacity: 0.15;
          }
          
          .signature-image {
            filter: contrast(1.5) brightness(0.5);
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
        <img src="/images/pixel-production-stamp.png" alt="Pixel Production Logo" class="header-logo">
        <div class="header-text">
          <div class="studio-name">PIXEL PRODUCTION</div>
          <div class="contact-info">
            📞 Contact: 9869317165 | 📍 Address: Kathmandu, Nepal<br>
            ✨ Professional Photography Services ✨
          </div>
        </div>
      </div>

      <div class="stamp-logo">
        <img src="/images/pixel-production-stamp.png" alt="Pixel Production Stamp">
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
          ${invoice.customerPhone ? `<p><strong>Phone:</strong> ${invoice.customerPhone}</p>` : "<p><strong>Type:</strong> Walk-in Customer</p>"}
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
              <th>Service Description</th>
              <th class="text-right">Amount (NPR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Professional Photography Service</td>
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

      <div class="signature-section">
        <div class="signature-box">
          <img src="/images/parbat-signature.png" alt="Signature" class="signature-image">
          <div class="signature-line"></div>
          <div class="signature-name">Parbat Chaulagain</div>
          <div class="signature-title">Owner, Pixel Production</div>
        </div>
        <div class="customer-signature">
          <div class="customer-signature-line"></div>
          <div class="signature-name">Customer Signature</div>
          <div class="signature-title">Date: ___________</div>
        </div>
      </div>

      <div class="footer">
        <p class="thank-you">Thank You for Choosing Pixel Production!</p>
        <p>📞 For any queries, please contact us at 9869317165</p>
        <p>🌟 Your memories, our passion - captured with perfection! 🌟</p>
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
