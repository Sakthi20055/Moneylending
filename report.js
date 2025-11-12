let currentReportData = null;

// Generate report
function generateReport() {
    const query = document.getElementById('searchReport').value.trim();
    
    if (!query) {
        showNotification('Please enter account number or name', 'warning');
        return;
    }
    
    try {
        // First search for the borrower using storage function
        const borrowers = getAllBorrowers();
        const queryLower = query.toLowerCase();
        
        const results = borrowers.filter(borrower => {
            const name = (borrower.name || '').toLowerCase();
            const accountNumber = (borrower.account_number || '').toString();
            const phone = (borrower.phone_no || '').toString();
            const city = (borrower.city || '').toLowerCase();
            
            return name.includes(queryLower) ||
                   accountNumber.includes(query) ||
                   phone.includes(query) ||
                   city.includes(queryLower);
        });
        
        if (results.length === 0) {
            showNotification('No customer found', 'warning');
            document.getElementById('reportContent').style.display = 'none';
            return;
        }
        
        // Use first result (you could enhance this to show selection)
        const borrower = results[0];
        const accountNumber = borrower.account_number;
        
        // Get report data
        const report = getReportData(accountNumber);
        
        if (!report) {
            showNotification('Error: Borrower not found', 'error');
            return;
        }
        
        // Store report data for PDF generation
        currentReportData = report;
        
        // Helper function to safely format numbers for display
        const safeFormatNumber = (value) => {
            if (value === null || value === undefined || value === '') {
                return '0.00';
            }
            const num = parseFloat(value);
            if (isNaN(num)) {
                return '0.00';
            }
            return num.toFixed(2);
        };
        
        // Display report
        document.getElementById('report_account_number').textContent = report.borrower.account_number || '';
        document.getElementById('report_name').textContent = report.borrower.name || '';
        document.getElementById('report_phone').textContent = report.borrower.phone_no || '';
        document.getElementById('report_city').textContent = report.borrower.city || '';
        document.getElementById('report_loan_amount').textContent = safeFormatNumber(report.borrower.loan_amount);
        document.getElementById('report_interest_rate').textContent = report.borrower.interest_rate || '0';
        document.getElementById('report_monthly_interest').textContent = safeFormatNumber(report.monthlyInterest);
        document.getElementById('report_total_paid').textContent = safeFormatNumber(report.totalInterestPaid);
        
        // Display payment history
        const tbody = document.getElementById('reportPaymentHistory');
        
        if (report.paymentHistory.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No payment history</td></tr>';
        } else {
            tbody.innerHTML = report.paymentHistory.map(payment => {
                const date = new Date(payment.payment_date);
                const amount = parseFloat(payment.payment_amount) || 0;
                return `
                    <tr>
                        <td>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</td>
                        <td>${payment.payment_month || ''}</td>
                        <td>₹${amount.toFixed(2)}</td>
                    </tr>
                `;
            }).join('');
        }
        
        document.getElementById('reportContent').style.display = 'block';
        showNotification('Report generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to generate report. Please try again.', 'error');
    }
}

// Download PDF Report
function downloadPDF() {
    if (!currentReportData) {
        showNotification('Please generate a report first', 'warning');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const report = currentReportData;
        const borrower = report.borrower;
        
        // Helper function to safely convert to string
        const safeString = (value) => {
            if (value === null || value === undefined) return '';
            return String(value).trim();
        };
        
        // Helper function to format currency
        const formatCurrency = (amount) => {
            if (amount === null || amount === undefined || amount === '') {
                return 'Rs. 0.00';
            }
            const num = parseFloat(amount);
            if (isNaN(num)) {
                return 'Rs. 0.00';
            }
            return 'Rs. ' + num.toFixed(2);
        };
        
        // Helper function to format number
        const formatNumber = (num) => {
            if (num === null || num === undefined || num === '') {
                return '0.00';
            }
            const parsed = parseFloat(num);
            if (isNaN(parsed)) {
                return '0.00';
            }
            return parsed.toFixed(2);
        };
        
        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Customer Statement Report', 105, 20, { align: 'center' });
        
        // Line
        doc.setLineWidth(0.5);
        doc.line(20, 25, 190, 25);
        
        // Customer Information Section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Customer Information', 20, 35);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        let yPos = 45;
        
        // Prepare all text values as plain strings
        const accountNum = safeString(borrower.account_number);
        const name = safeString(borrower.name);
        const phone = safeString(borrower.phone_no);
        const city = safeString(borrower.city);
        const loanAmount = formatCurrency(borrower.loan_amount);
        const interestRate = safeString(borrower.interest_rate) + '% per month';
        const monthlyInterest = formatCurrency(report.monthlyInterest);
        const totalPaid = formatCurrency(report.totalInterestPaid);
        
        // Add customer information using string concatenation
        doc.text('Account Number: ' + accountNum, 20, yPos);
        yPos += 7;
        doc.text('Name: ' + name, 20, yPos);
        yPos += 7;
        doc.text('Phone: ' + phone, 20, yPos);
        yPos += 7;
        doc.text('City: ' + city, 20, yPos);
        yPos += 7;
        doc.text('Loan Amount: ' + loanAmount, 20, yPos);
        yPos += 7;
        doc.text('Interest Rate: ' + interestRate, 20, yPos);
        yPos += 7;
        doc.text('Monthly Interest: ' + monthlyInterest, 20, yPos);
        yPos += 7;
        doc.text('Total Interest Paid: ' + totalPaid, 20, yPos);
        
        // Payment History Section
        yPos += 15;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Payment History', 20, yPos);
        yPos += 10;
        
        if (report.paymentHistory && report.paymentHistory.length > 0) {
            // Table headers
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('Date', 20, yPos);
            doc.text('Month', 80, yPos);
            doc.text('Amount', 140, yPos);
            yPos += 7;
            
            doc.setLineWidth(0.2);
            doc.line(20, yPos - 2, 190, yPos - 2);
            
            // Table rows
            doc.setFont('helvetica', 'normal');
            report.paymentHistory.forEach(payment => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                
                const date = new Date(payment.payment_date);
                const dateStr = date.toLocaleDateString('en-IN') + ' ' + 
                               date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                const month = safeString(payment.payment_month);
                const amount = formatCurrency(payment.payment_amount);
                
                doc.text(dateStr.substring(0, 30), 20, yPos);
                doc.text(month, 80, yPos);
                doc.text(amount, 140, yPos);
                yPos += 7;
            });
        } else {
            doc.setFontSize(10);
            doc.text('No payment history available', 20, yPos);
        }
        
        // Footer
        const pageCount = doc.internal.pages.length - 1;
        const genDate = new Date().toLocaleString('en-IN');
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('Generated on: ' + genDate, 105, 285, { align: 'center' });
            doc.text('Page ' + i + ' of ' + pageCount, 105, 290, { align: 'center' });
        }
        
        // Save PDF
        const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = 'Customer_Statement_' + accountNum + '_' + cleanName + '.pdf';
        doc.save(fileName);
        
        showNotification('PDF report downloaded successfully!', 'success');
    } catch (error) {
        console.error('Error generating PDF:', error);
        showNotification('Failed to generate PDF. Please try again.', 'error');
    }
}

