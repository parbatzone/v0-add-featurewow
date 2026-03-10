export interface ShoppingItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  estimatedPrice: number
  priority: "low" | "medium" | "high"
  notes: string
  purchased: boolean
  dateAdded: string
  datePurchased?: string
}

export function generateShoppingListPDF(items: ShoppingItem[]) {
  const printWindow = window.open("", "_blank")

  if (!printWindow) {
    alert("Please allow popups to print the shopping list")
    return
  }

  const pendingItems = items.filter((item) => !item.purchased)
  const totalEstimatedCost = pendingItems.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0)

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "equipment":
        return "📷"
      case "supplies":
        return "📦"
      case "software":
        return "💻"
      case "maintenance":
        return "🔧"
      case "office":
        return "🏢"
      default:
        return "📋"
    }
  }

  const itemRows = pendingItems
    .map(
      (item, index) => `
    <tr>
      <td class="text-center">
        <input type="checkbox" style="width: 18px; height: 18px; cursor: pointer;">
      </td>
      <td class="text-center">${index + 1}</td>
      <td>${getCategoryIcon(item.category)} ${item.name}</td>
      <td class="text-center">${item.quantity} ${item.unit}</td>
      <td class="text-right">NPR ${item.estimatedPrice.toLocaleString()}</td>
      <td class="text-right">NPR ${(item.quantity * item.estimatedPrice).toLocaleString()}</td>
      <td class="priority-${item.priority}">${item.priority.toUpperCase()}</td>
      ${item.notes ? `<td>${item.notes}</td>` : "<td></td>"}
    </tr>
  `,
    )
    .join("")

  const shoppingListHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Shopping List - Exarse</title>
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
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.4;
          color: #333;
          background: white;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 3px solid #059669;
        }
        
        .brand-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .brand-logo {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #059669;
        }
        
        .brand-info h1 {
          font-size: 20px;
          font-weight: bold;
          color: #059669;
          margin-bottom: 4px;
        }
        
        .brand-tagline {
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        
        .title {
          font-size: 36px;
          font-weight: bold;
          color: #059669;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .print-date {
          text-align: right;
          font-size: 11px;
          color: #666;
        }
        
        .summary-section {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .summary-box {
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 12px;
          background: #f9fafb;
        }
        
        .summary-label {
          font-size: 11px;
          color: #666;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        
        .summary-value {
          font-size: 18px;
          font-weight: bold;
          color: #059669;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          border: 1px solid #333;
        }
        
        .items-table thead {
          background: #059669;
          color: white;
        }
        
        .items-table th {
          padding: 12px 8px;
          text-align: left;
          font-weight: bold;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid #333;
        }
        
        .items-table td {
          padding: 12px 8px;
          font-size: 11px;
          border: 1px solid #ddd;
        }
        
        .items-table tbody tr:nth-child(even) {
          background: #f9f9f9;
        }
        
        .items-table tbody tr:hover {
          background: #f0f0f0;
        }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        
        .priority-high {
          background: #fee2e2;
          color: #991b1b;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .priority-medium {
          background: #fef3c7;
          color: #92400e;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .priority-low {
          background: #dcfce7;
          color: #166534;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .totals-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 30px;
        }
        
        .totals-box {
          width: 280px;
          background: #f8f9fa;
          border: 2px solid #059669;
          border-radius: 6px;
          padding: 15px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 12px;
          border-bottom: 1px solid #ddd;
        }
        
        .total-row:last-child {
          border-bottom: none;
        }
        
        .total-label {
          font-weight: bold;
          color: #333;
        }
        
        .total-value {
          font-weight: bold;
          color: #059669;
          text-align: right;
        }
        
        .final-total {
          background: #059669;
          color: white;
          padding: 12px;
          margin-top: 8px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: bold;
          display: flex;
          justify-content: space-between;
        }
        
        .footer-section {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #059669;
          text-align: center;
          font-size: 10px;
          color: #666;
        }
        
        .instructions {
          background: #ecfdf5;
          border: 1px solid #059669;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 20px;
          font-size: 11px;
          color: #333;
        }
        
        .instructions strong {
          color: #059669;
        }
        
        @media print {
          body { 
            margin: 0;
            padding: 12px;
          }
          
          .header {
            border-bottom: 3px solid #000;
          }
          
          .brand-logo {
            border-color: #000;
          }
          
          .brand-info h1 {
            color: #000;
          }
          
          .title {
            color: #000;
          }
          
          .items-table thead {
            background: #000 !important;
          }
          
          .items-table th {
            border-color: #000;
          }
          
          .summary-value {
            color: #000;
          }
          
          .totals-box {
            border-color: #000;
          }
          
          .total-value {
            color: #000;
          }
          
          .final-total {
            background: #000 !important;
            color: white !important;
          }
          
          .footer-section {
            border-top-color: #000;
          }
          
          .instructions {
            background: #f3f4f6;
            border-color: #000;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand-section">
          <img src="/images/exarse-logo.png" alt="Exarse" class="brand-logo">
          <div class="brand-info">
            <h1>Exarse</h1>
            <div class="brand-tagline">Billing Software</div>
          </div>
        </div>
        <div class="title">SHOPPING LIST</div>
        <div class="print-date">
          Printed: ${new Date().toLocaleDateString()}<br>
          ${new Date().toLocaleTimeString()}
        </div>
      </div>

      <div class="instructions">
        <strong>Instructions:</strong> Check off items as you purchase them. This list is sorted by priority (High → Medium → Low). Keep this list for tracking purchases and budgeting.
      </div>

      <div class="summary-section">
        <div class="summary-box">
          <div class="summary-label">Total Items</div>
          <div class="summary-value">${pendingItems.length}</div>
        </div>
        <div class="summary-box">
          <div class="summary-label">Categories</div>
          <div class="summary-value">${new Set(pendingItems.map((i) => i.category)).size}</div>
        </div>
        <div class="summary-box">
          <div class="summary-label">Estimated Cost</div>
          <div class="summary-value">NPR ${totalEstimatedCost.toLocaleString()}</div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 5%">✓</th>
            <th style="width: 5%">#</th>
            <th style="width: 35%">Item Name</th>
            <th style="width: 12%">Qty</th>
            <th style="width: 15%">Price (NPR)</th>
            <th style="width: 15%">Total (NPR)</th>
            <th style="width: 10%">Priority</th>
            <th style="width: 20%">Notes</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <div class="totals-section">
        <div class="totals-box">
          <div class="total-row">
            <span class="total-label">Total Items:</span>
            <span class="total-value">${pendingItems.length}</span>
          </div>
          <div class="total-row">
            <span class="total-label">Estimated Budget:</span>
            <span class="total-value">NPR ${totalEstimatedCost.toLocaleString()}</span>
          </div>
          <div class="final-total">
            <span>TOTAL BUDGET</span>
            <span>NPR ${totalEstimatedCost.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div class="footer-section">
        <p>📞 Phone: 9869317165 | 📍 Kathmandu, Nepal | ✉ cellsansarphotostudio@gmail.com</p>
        <p style="margin-top: 8px; color: #999;">Powered by <strong>Exarse Billing Software</strong></p>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(shoppingListHTML)
  printWindow.document.close()

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}
