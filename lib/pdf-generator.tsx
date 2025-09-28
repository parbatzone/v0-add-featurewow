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
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 30px;
          line-height: 1.5;
          color: #333;
          background: white;
        }
        
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #2563eb;
        }
        
        .brand-section {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .brand-logo {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #2563eb;
        }
        
        .brand-info h1 {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 5px;
        }
        
        .brand-tagline {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .invoice-title {
          font-size: 48px;
          font-weight: bold;
          color: #333;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .invoice-details {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 30px;
          margin-bottom: 40px;
        }
        
        .detail-section h3 {
          font-size: 14px;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .detail-content {
          font-size: 13px;
          line-height: 1.6;
          color: #555;
        }
        
        .invoice-meta {
          text-align: right;
        }
        
        .meta-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 13px;
        }
        
        .meta-label {
          font-weight: bold;
          color: #333;
          min-width: 100px;
        }
        
        .meta-value {
          color: #555;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .items-table thead {
          background: #333;
          color: white;
        }
        
        .items-table th {
          padding: 15px 12px;
          text-align: left;
          font-weight: bold;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .items-table td {
          padding: 15px 12px;
          border-bottom: 1px solid #eee;
          font-size: 13px;
        }
        
        .items-table tbody tr:hover {
          background: #f9f9f9;
        }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        
        .payment-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        
        .payment-info {
          flex: 1;
          margin-right: 40px;
        }
        
        .payment-info h3 {
          font-size: 14px;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        
        .payment-details {
          font-size: 12px;
          line-height: 1.6;
          color: #555;
        }
        
        .payment-qr {
          margin-top: 15px;
          text-align: center;
        }

        .qr-image {
          width: 120px;
          height: auto;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .qr-label {
          font-size: 11px;
          color: #666;
          margin-top: 5px;
        }
        
        .totals-section {
          width: 300px;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 20px;
          font-size: 14px;
          border-bottom: 1px solid #dee2e6;
        }
        
        .total-row:last-child {
          border-bottom: none;
        }
        
        .total-label {
          font-weight: 500;
          color: #333;
        }
        
        .total-value {
          font-weight: bold;
          color: #555;
        }
        
        .discount-row {
          color: #dc3545;
        }
        
        .final-total {
          background: #2563eb;
          color: white;
          font-size: 18px;
          font-weight: bold;
          padding: 20px;
        }
        
        .signature-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 60px;
          padding-top: 30px;
          border-top: 1px solid #dee2e6;
        }
        
        .thanks-message {
          font-size: 14px;
          color: #666;
          font-style: italic;
        }
        
        .signature-box {
          text-align: center;
          width: 200px;
        }
        
        .signature-image {
          width: 150px;
          height: 60px;
          object-fit: contain;
          margin-bottom: 10px;
          filter: contrast(1.5) brightness(0.7);
          mix-blend-mode: multiply;
        }
        
        .signature-line {
          border-top: 2px solid #333;
          margin: 10px 0 5px 0;
        }
        
        .signature-name {
          font-weight: bold;
          font-size: 14px;
          color: #333;
        }
        
        .signature-title {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }
        
        .footer-contact {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 3px solid #2563eb;
          font-size: 12px;
          color: #666;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .contact-icon {
          font-weight: bold;
          color: #2563eb;
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
          border: 2px solid #000;
          padding: 15px;
          font-size: 12px;
          background: white;
          box-sizing: border-box;
        }
        
        .label-header {
          text-align: center;
          margin-bottom: 12px;
          border-bottom: 1px solid #000;
          padding-bottom: 8px;
        }
        
        .label-logo {
          width: 25px;
          height: 25px;
          object-fit: contain;
          margin-bottom: 5px;
        }
        
        .label-title {
          font-weight: bold;
          font-size: 12px;
          margin-bottom: 3px;
        }
        
        .label-phone {
          font-size: 10px;
        }
        
        .label-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 11px;
        }
        
        .label-row.remaining {
          font-weight: bold;
          border-top: 1px solid #000;
          padding-top: 5px;
          margin-top: 8px;
        }
        
        @media print {
          body { 
            margin: 0;
            padding: 20px;
          }
          
          @page {
            size: A4;
            margin: 1cm;
          }
          
          .invoice-header {
            border-bottom: 3px solid #000;
          }
          
          .brand-logo {
            border-color: #000;
          }
          
          .brand-info h1 {
            color: #000;
          }
          
          .final-total {
            background: #000 !important;
            color: white !important;
          }
          
          .footer-contact {
            border-top: 3px solid #000;
          }
          
          .contact-icon {
            color: #000;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div class="brand-section">
          <img src="/images/pixel-production-stamp.png" alt="Pixel Production" class="brand-logo">
          <div class="brand-info">
            <h1>Pixel Production</h1>
            <div class="brand-tagline">Professional Photography</div>
          </div>
        </div>
        <div class="invoice-title">INVOICE</div>
      </div>

      <div class="invoice-details">
        <div class="detail-section">
          <h3>Invoice to:</h3>
          <div class="detail-content">
            ${invoice.customerName || "Walk-in Customer"}<br>
            ${invoice.customerPhone ? `Phone: ${invoice.customerPhone}` : ""}
          </div>
        </div>
        
        <div class="detail-section">
          <h3>From:</h3>
          <div class="detail-content">
            Pixel Production<br>
            Kathmandu, Nepal<br>
            Phone: 9869317165
          </div>
        </div>
        
        <div class="detail-section invoice-meta">
          <div class="meta-row">
            <span class="meta-label">Invoice #</span>
            <span class="meta-value">${invoice.id}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Date</span>
            <span class="meta-value">${invoice.date || new Date().toISOString().split("T")[0]}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Status</span>
            <span class="meta-value">${invoice.status.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 8%">No</th>
            <th style="width: 50%">Item Description</th>
            <th style="width: 12%" class="text-center">Qty</th>
            <th style="width: 15%" class="text-right">Price</th>
            <th style="width: 15%" class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${
            invoice.type === "detailed"
              ? invoice.items
                  .map(
                    (item: any, index: number) => `
                  <tr>
                    <td class="text-center">${index + 1}</td>
                    <td>${item.name}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">NPR ${item.rate.toLocaleString()}</td>
                    <td class="text-right">NPR ${item.total.toLocaleString()}</td>
                  </tr>
                `,
                  )
                  .join("")
              : `
                <tr>
                  <td class="text-center">1</td>
                  <td>Professional Photography Service</td>
                  <td class="text-center">1</td>
                  <td class="text-right">NPR ${invoice.subtotal.toLocaleString()}</td>
                  <td class="text-right">NPR ${invoice.subtotal.toLocaleString()}</td>
                </tr>
              `
          }
        </tbody>
      </table>

      <div class="payment-section">
        <div class="payment-info">
          <h3>Payment Info:</h3>
          <div class="payment-details">
            Esewa: 9869317165<br>
            A/C Name: Pixel Production<br>
            Bank Details: Contact for bank details
            <div class="payment-qr">
              <img src="/images/fonepay-qr.jpg" alt="FonePay QR Code" class="qr-image">
              <div class="qr-label">Scan to Pay</div>
            </div>
          </div>
        </div>
        
        <div class="totals-section">
          <div class="total-row">
            <span class="total-label">Sub Total</span>
            <span class="total-value">NPR ${(invoice.subtotal + (invoice.discount || 0)).toLocaleString()}</span>
          </div>
          ${
            invoice.discount && invoice.discount > 0
              ? `
            <div class="total-row discount-row">
              <span class="total-label">Discount</span>
              <span class="total-value">- NPR ${invoice.discount.toLocaleString()}</span>
            </div>
          `
              : ""
          }
          <div class="total-row">
            <span class="total-label">Advance Paid</span>
            <span class="total-value">NPR ${invoice.advance.toLocaleString()}</span>
          </div>
          <div class="total-row final-total">
            <span>TOTAL</span>
            <span>NPR ${invoice.remaining.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div class="signature-section">
        <div class="thanks-message">
          Thanks for your business.
        </div>
        <div class="signature-box">
          <img src="/images/parbat-signature.png" alt="Signature" class="signature-image">
          <div class="signature-line"></div>
          <div class="signature-name">Parbat Chaulagain</div>
          <div class="signature-title">Authorized Sign</div>
        </div>
      </div>

      <div class="footer-contact">
        <div class="contact-item">
          <span class="contact-icon">📞</span>
          <span>9869317165</span>
        </div>
        <div class="contact-item">
          <span class="contact-icon">📍</span>
          <span>Kathmandu, Nepal</span>
        </div>
        <div class="contact-item">
          <span class="contact-icon">✉</span>
          <span>cellsansarphotostudio@gmail.com</span>
        </div>
        <div class="contact-item">
          <span class="contact-icon">📱</span>
          <span>WhatsApp: 9869317165</span>
        </div>
        <div class="contact-item">
          <span class="contact-icon">📞</span>
          <span>Viber: 9869317165</span>
        </div>
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
