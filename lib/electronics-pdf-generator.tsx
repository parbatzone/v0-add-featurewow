export function generateElectronicsInvoicePDF(invoice: any) {
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
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @page {
          size: A4;
          margin: 1.5cm;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.4;
          color: #333;
          background: white;
        }
        
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 12px;
          border-bottom: 3px solid #2563eb;
        }
        
        .brand-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .brand-info h1 {
          font-size: 22px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 4px;
        }
        
        .brand-tagline {
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        
        .invoice-title {
          font-size: 42px;
          font-weight: bold;
          color: #333;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .invoice-details {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .detail-section h3 {
          font-size: 12px;
          font-weight: bold;
          color: #333;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .detail-content {
          font-size: 11px;
          line-height: 1.5;
          color: #555;
        }
        
        .invoice-meta {
          text-align: right;
        }
        
        .meta-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 11px;
        }
        
        .meta-label {
          font-weight: bold;
          color: #333;
          min-width: 85px;
          text-align: left;
        }
        
        .meta-value {
          color: #555;
          text-align: right;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          border: 1px solid #333;
        }
        
        .items-table thead {
          background: #333;
          color: white;
        }
        
        .items-table th {
          padding: 10px 8px;
          text-align: left;
          font-weight: bold;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid #333;
        }
        
        .items-table td {
          padding: 10px 8px;
          font-size: 11px;
          border: 1px solid #ddd;
        }
        
        .items-table tbody tr:nth-child(even) {
          background: #f9f9f9;
        }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        
        .payment-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 25px;
          gap: 20px;
        }
        
        .qr-section {
          flex-shrink: 0;
          text-align: center;
        }
        
        .qr-code {
          width: 170px; /* Increased QR code size from 140px to 170px for easier mobile scanning */
          height: auto;
          border: 2px solid #dee2e6;
          padding: 8px;
          background: white;
        }
        
        .qr-label {
          font-size: 10px;
          color: #666;
          margin-top: 6px;
          font-weight: 500;
        }
        
        .totals-section {
          width: 260px;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 9px 12px;
          font-size: 12px;
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
          text-align: right;
        }
        
        .discount-row {
          color: #dc3545;
        }
        
        .final-total {
          background: #2563eb;
          color: white;
          font-size: 15px;
          font-weight: bold;
          padding: 12px;
        }
        
        .signature-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 35px;
          padding-top: 18px;
          border-top: 1px solid #dee2e6;
        }
        
        .thanks-message {
          font-size: 12px;
          color: #666;
          font-style: italic;
        }
        
        .signature-box {
          text-align: center;
          width: 180px;
        }
        
        .signature-line {
          border-top: 2px solid #333;
          margin: 40px 0 4px 0;
        }
        
        .signature-name {
          font-weight: bold;
          font-size: 12px;
          color: #333;
        }
        
        .signature-title {
          font-size: 10px;
          color: #666;
          margin-top: 2px;
        }
        
        .footer-contact {
          display: flex;
          justify-content: center;
          gap: 25px;
          margin-top: 25px;
          padding-top: 12px;
          border-top: 3px solid #2563eb;
          font-size: 10px;
          color: #666;
          flex-wrap: wrap;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .contact-icon {
          font-weight: bold;
          color: #2563eb;
        }
        
        @media print {
          body { 
            margin: 0;
            padding: 12px;
          }
          
          .invoice-header {
            border-bottom: 3px solid #000;
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
          <div class="brand-info">
            <h1>Pratima Electronics</h1>
            <div class="brand-tagline">Quality Electronics & Appliances</div>
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
            Pratima Electronics<br>
            Amarshing Chowk<br>
            Kageshwori Manohara - 07<br>
            Kathmandu, Nepal<br>
            Phone: 9860173537<br>
            Phone: 9761132260<br>
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
            <th style="width: 6%">No</th>
            <th style="width: 54%">Item Description</th>
            <th style="width: 12%" class="text-center">Qty</th>
            <th style="width: 14%" class="text-right">Price</th>
            <th style="width: 14%" class="text-right">Total</th>
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
                  <td>Electronics Product</td>
                  <td class="text-center">1</td>
                  <td class="text-right">NPR ${invoice.subtotal.toLocaleString()}</td>
                  <td class="text-right">NPR ${invoice.subtotal.toLocaleString()}</td>
                </tr>
              `
          }
        </tbody>
      </table>

      <div class="payment-section">
        <div class="qr-section">
          <img src="/images/payment-qr.jpg" alt="Payment QR Code" class="qr-code" />
          <div class="qr-label">Scan to Pay</div>
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
          <div class="signature-line"></div>
          <div class="signature-name">Authorized Signature</div>
          <div class="signature-title">Pratima Electronics</div>
        </div>
      </div>

      <div class="footer-contact">
        <div class="contact-item">
          <span class="contact-icon">📞</span>
          <span>9860173537</span>
        </div>
        <div class="contact-item">
          <span class="contact-icon">📞</span>
          <span>9761132260</span>
        </div>
        <div class="contact-item">
          <span class="contact-icon">📞</span>
          <span>9869317165</span>
        </div>
        <div class="contact-item">
          <span class="contact-icon">📍</span>
          <span>Amarshing Chowk, Kageshwori Manohara - 07, Kathmandu</span>
        </div>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(invoiceHTML)
  printWindow.document.close()

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}
