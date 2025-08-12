interface InvoiceData {
    id: string
    date: Date
    planName: string
    amount: number
    status: 'paid' | 'pending' | 'failed'
    billingPeriod: {
      from: Date
      to: Date
    }
    customer: {
      name: string
      email: string
      company?: string
      address: {
        street: string
        city: string
        state: string
        zipCode: string
        country: string
      }
    }
    items: Array<{
      description: string
      quantity: number
      unitPrice: number
      total: number
    }>
  }
  
  const sampleCustomerData = {
    name: 'John Smith',
    email: 'john.smith@company.com',
    company: 'Tech Solutions Inc.',
    address: {
      street: '123 Business Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'United States'
    }
  }
  
  export const generateInvoiceData = (invoiceId: string, planName: string, amount: number, date: Date): InvoiceData => {
    const billingFrom = new Date(date)
    billingFrom.setDate(1) // Start of month
    
    const billingTo = new Date(date)
    billingTo.setMonth(billingTo.getMonth() + 1)
    billingTo.setDate(0) // End of month
  
    let items = []
    
    if (planName === 'Done for you') {
      items = [
        {
          description: 'Done for you Plan - Monthly Subscription',
          quantity: 1,
          unitPrice: 149.00,
          total: 149.00
        }
      ]
    } else if (planName === 'Do it yourself') {
      items = [
        {
          description: 'Do it yourself Plan - Monthly Subscription',
          quantity: 1,
          unitPrice: 49.00,
          total: 49.00
        }
      ]
    } else if (planName === 'Custom') {
      items = [
        {
          description: 'Custom Enterprise Plan - Monthly Subscription',
          quantity: 1,
          unitPrice: amount,
          total: amount
        }
      ]
    }
  
    return {
      id: invoiceId,
      date,
      planName,
      amount,
      status: 'paid',
      billingPeriod: {
        from: billingFrom,
        to: billingTo
      },
      customer: sampleCustomerData,
      items
    }
  }
  
  export const generateInvoiceHTML = (invoiceData: InvoiceData): string => {
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date)
    }
  
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount)
    }
  
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.08 // 8% tax
    const total = subtotal + tax
  
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoiceData.id}</title>
      <style>
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }
          
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.5;
              color: #333;
              background: white;
              padding: 0;
              margin: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
          }
          
          .invoice-container {
              max-width: 210mm;
              width: 100%;
              margin: 0 auto;
              background: white;
              overflow: hidden;
              font-size: 14px;
          }
          
          .invoice-header {
              background: linear-gradient(135deg, #00A3FF 0%, #0082CC 100%);
              color: white;
              padding: 40px;
              text-align: center;
          }
          
          .company-name {
              font-size: 2.5rem;
              font-weight: 700;
              margin-bottom: 10px;
              letter-spacing: -1px;
          }
          
          .company-tagline {
              font-size: 1.1rem;
              opacity: 0.9;
              font-weight: 300;
          }
          
          .invoice-content {
              padding: 40px;
          }
          
          .invoice-meta {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-bottom: 40px;
          }
          
          .invoice-info h3,
          .billing-info h3 {
              color: #00A3FF;
              font-size: 1.2rem;
              margin-bottom: 15px;
              font-weight: 600;
          }
          
          .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              padding: 8px 0;
              border-bottom: 1px solid #f0f0f0;
          }
          
          .info-label {
              font-weight: 500;
              color: #666;
          }
          
          .info-value {
              font-weight: 600;
              color: #333;
          }
          
          .status-paid {
              background: #10B981;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 0.85rem;
              font-weight: 600;
              text-transform: uppercase;
          }
          
          .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          }
          
          .items-table th {
              background: #f8f9fa;
              padding: 15px;
              text-align: left;
              font-weight: 600;
              color: #333;
              border-bottom: 2px solid #e9ecef;
          }
          
          .items-table td {
              padding: 15px;
              border-bottom: 1px solid #f0f0f0;
          }
          
          .items-table tr:last-child td {
              border-bottom: none;
          }
          
          .text-right {
              text-align: right;
          }
          
          .totals-section {
              margin-top: 30px;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
          }
          
          .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding: 5px 0;
          }
          
          .total-row.final {
              border-top: 2px solid #00A3FF;
              padding-top: 15px;
              margin-top: 15px;
              font-size: 1.2rem;
              font-weight: 700;
              color: #00A3FF;
          }
          
          .footer {
              margin-top: 40px;
              padding: 30px;
              background: #f8f9fa;
              text-align: center;
              color: #666;
              border-top: 2px solid #e9ecef;
          }
          
          .footer h4 {
              color: #333;
              margin-bottom: 15px;
          }
          
          .footer p {
              margin-bottom: 8px;
          }
          
          .page-break {
              page-break-before: always;
          }
          
          .no-break {
              page-break-inside: avoid;
          }
          
          @media print {
              body {
                  background: white;
                  padding: 0;
                  margin: 0;
              }
              
              .invoice-container {
                  box-shadow: none;
                  border-radius: 0;
                  max-width: none;
                  width: 100%;
              }
              
              .invoice-header {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
              }
          }
      </style>
  </head>
  <body>
      <div class="invoice-container">
          <div class="invoice-header">
              <div class="company-name">Botsify</div>
              <div class="company-tagline">AI-Powered Conversation Platform</div>
          </div>
          
          <div class="invoice-content">
              <div class="invoice-meta no-break">
                  <div class="invoice-info">
                      <h3>Invoice Details</h3>
                      <div class="info-row">
                          <span class="info-label">Invoice #:</span>
                          <span class="info-value">${invoiceData.id.toUpperCase()}</span>
                      </div>
                      <div class="info-row">
                          <span class="info-label">Issue Date:</span>
                          <span class="info-value">${formatDate(invoiceData.date)}</span>
                      </div>
                      <div class="info-row">
                          <span class="info-label">Billing Period:</span>
                          <span class="info-value">${formatDate(invoiceData.billingPeriod.from)} - ${formatDate(invoiceData.billingPeriod.to)}</span>
                      </div>
                      <div class="info-row">
                          <span class="info-label">Status:</span>
                          <span class="status-paid">Paid</span>
                      </div>
                  </div>
                  
                  <div class="billing-info">
                      <h3>Bill To</h3>
                      <div class="info-row">
                          <span class="info-label">Name:</span>
                          <span class="info-value">${invoiceData.customer.name}</span>
                      </div>
                      <div class="info-row">
                          <span class="info-label">Email:</span>
                          <span class="info-value">${invoiceData.customer.email}</span>
                      </div>
                      ${invoiceData.customer.company ? `
                      <div class="info-row">
                          <span class="info-label">Company:</span>
                          <span class="info-value">${invoiceData.customer.company}</span>
                      </div>
                      ` : ''}
                      <div class="info-row">
                          <span class="info-label">Address:</span>
                          <span class="info-value">
                              ${invoiceData.customer.address.street}<br>
                              ${invoiceData.customer.address.city}, ${invoiceData.customer.address.state} ${invoiceData.customer.address.zipCode}<br>
                              ${invoiceData.customer.address.country}
                          </span>
                      </div>
                  </div>
              </div>
              
              <table class="items-table">
                  <thead>
                      <tr>
                          <th>Description</th>
                          <th class="text-right">Qty</th>
                          <th class="text-right">Unit Price</th>
                          <th class="text-right">Total</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${invoiceData.items.map(item => `
                      <tr>
                          <td>${item.description}</td>
                          <td class="text-right">${item.quantity}</td>
                          <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                          <td class="text-right">${formatCurrency(item.total)}</td>
                      </tr>
                      `).join('')}
                  </tbody>
              </table>
              
              <div class="totals-section no-break">
                  <div class="total-row">
                      <span>Subtotal:</span>
                      <span>${formatCurrency(subtotal)}</span>
                  </div>
                  <div class="total-row">
                      <span>Tax (8%):</span>
                      <span>${formatCurrency(tax)}</span>
                  </div>
                  <div class="total-row final">
                      <span>Total Amount:</span>
                      <span>${formatCurrency(total)}</span>
                  </div>
              </div>
          </div>
          
          <div class="footer">
              <h4>Thank you for your business!</h4>
              <p>Questions about this invoice? Contact us at billing@botsify.com</p>
              <p>Visit us at: www.botsify.com | Follow us on social media</p>
              <p style="margin-top: 20px; font-size: 0.9rem; color: #999;">
                  This is a computer-generated invoice. No signature required.
              </p>
          </div>
      </div>
  </body>
  </html>
    `.trim()
  }
  
  export const downloadInvoice = async (invoiceData: InvoiceData) => {
    // Dynamic import to handle potential loading issues
    const html2pdf = (await import('html2pdf.js')).default
    
    const htmlContent = generateInvoiceHTML(invoiceData)
    
    // Create a temporary div element to hold the HTML content
    const element = document.createElement('div')
    element.innerHTML = htmlContent
    element.style.width = '210mm' // A4 width
    element.style.minHeight = '297mm' // A4 height
    
    // PDF options for better quality and formatting
    const options = {
      margin: [10, 10, 10, 10], // top, right, bottom, left in mm
      filename: `invoice-${invoiceData.id}-${invoiceData.planName.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123 // A4 height in pixels at 96 DPI
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }
    
    try {
      // Generate and download the PDF
      await html2pdf().set(options).from(element).save()
    } catch (error) {
      console.error('Error generating PDF:', error)
      // Fallback to HTML download if PDF generation fails
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${invoiceData.id}-${invoiceData.planName.replace(/\s+/g, '-').toLowerCase()}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      throw error
    }
  }
  
  export const downloadAllInvoices = async (invoices: Array<{ id: string, planName: string, amount: number, date: Date }>) => {
    // First, download a CSV summary of all invoices
    downloadInvoiceCSV(invoices)
    
    // Then download each invoice with a delay to prevent browser blocking
    for (let i = 0; i < invoices.length; i++) {
      const invoice = invoices[i]
      
      // Wait for delay before processing next invoice
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // 1 second delay between PDFs
      } else {
        await new Promise(resolve => setTimeout(resolve, 500)) // Initial delay after CSV
      }
      
      try {
        const invoiceData = generateInvoiceData(invoice.id, invoice.planName, invoice.amount, invoice.date)
        await downloadInvoice(invoiceData)
      } catch (error) {
        console.error(`Error downloading invoice ${invoice.id}:`, error)
        // Continue with next invoice even if one fails
      }
    }
  }
  
  export const downloadInvoiceCSV = (invoices: Array<{ id: string, planName: string, amount: number, date: Date }>) => {
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date)
    }
  
    const headers = ['Invoice ID', 'Date', 'Plan Name', 'Amount', 'Status', 'Billing Period From', 'Billing Period To']
    
    const csvData = invoices.map(invoice => {
      const billingFrom = new Date(invoice.date)
      billingFrom.setDate(1)
      
      const billingTo = new Date(invoice.date)
      billingTo.setMonth(billingTo.getMonth() + 1)
      billingTo.setDate(0)
      
      return [
        invoice.id,
        formatDate(invoice.date),
        invoice.planName,
        `$${invoice.amount.toFixed(2)}`,
        'Paid',
        formatDate(billingFrom),
        formatDate(billingTo)
      ]
    })
  
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `botsify-invoices-${new Date().getFullYear()}.csv`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }