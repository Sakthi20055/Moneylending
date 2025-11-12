let currentAccountNumber = null;
let paymentHistory = [];

// Search customer for payment
function searchCustomer() {
    const query = document.getElementById('searchPayment').value.trim();
    
    if (!query) {
        showNotification('Please enter account number or name', 'warning');
        return;
    }
    
    try {
        // Use the searchBorrowers function from storage.js
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
            document.getElementById('customerDetails').style.display = 'none';
            return;
        }
        
        // If multiple results, use first one (you could enhance this to show a selection)
        const customer = results[0];
        currentAccountNumber = customer.account_number;
        
        // Display customer details
        document.getElementById('pay_account_number').textContent = customer.account_number;
        document.getElementById('pay_account_number_hidden').value = customer.account_number;
        document.getElementById('pay_name').textContent = customer.name;
        document.getElementById('pay_phone').textContent = customer.phone_no;
        document.getElementById('pay_loan_amount').textContent = parseFloat(customer.loan_amount).toFixed(2);
        document.getElementById('pay_interest_rate').textContent = customer.interest_rate;
        
        // Calculate monthly interest
        const monthlyInterest = (parseFloat(customer.loan_amount) * parseFloat(customer.interest_rate)) / 100;
        document.getElementById('pay_monthly_interest').textContent = monthlyInterest.toFixed(2);
        
        // Set default payment amount
        document.getElementById('payment_amount').value = monthlyInterest.toFixed(2);
        
        // Set current month as default
        const now = new Date();
        const month = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        document.getElementById('payment_month').value = month;
        
        document.getElementById('customerDetails').style.display = 'block';
        
        // Load payment history
        loadPaymentHistory(customer.account_number);
        
    } catch (error) {
        console.error('Error:', error);
        console.error('Error details:', error.message, error.stack);
        showNotification('Failed to search customer. Please try again.', 'error');
    }
}

// Load payment history
function loadPaymentHistory(accountNumber) {
    try {
        paymentHistory = getPaymentsByAccountNumber(accountNumber);
        displayPaymentHistory(paymentHistory);
    } catch (error) {
        console.error('Error loading payment history:', error);
        document.getElementById('paymentHistoryBody').innerHTML = 
            '<tr><td colspan="4" class="text-center text-danger">Error loading payment history</td></tr>';
        showNotification('Failed to load payment history', 'error');
    }
}

// Display payment history
function displayPaymentHistory(payments) {
    const tbody = document.getElementById('paymentHistoryBody');
    
    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No payment history</td></tr>';
        return;
    }
    
    tbody.innerHTML = payments.map(payment => {
        const date = new Date(payment.payment_date);
        const amount = parseFloat(payment.payment_amount) || 0;
        const paymentId = String(payment.id); // Ensure ID is a string
        return `
            <tr>
                <td>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</td>
                <td>${payment.payment_month || ''}</td>
                <td>₹${amount.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editPayment('${paymentId}')" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deletePayment('${paymentId}')" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Handle payment form submission
document.getElementById('paymentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const accountNumber = document.getElementById('pay_account_number_hidden').value;
    const paymentAmount = parseFloat(document.getElementById('payment_amount').value);
    const paymentMonth = document.getElementById('payment_month').value;
    
    try {
        addPayment({
            account_number: accountNumber,
            payment_amount: paymentAmount,
            payment_month: paymentMonth
        });
        
        showNotification('Payment recorded successfully!', 'success');
        
        // Reset form
        document.getElementById('paymentForm').reset();
        
        // Reload payment history
        loadPaymentHistory(accountNumber);
        
        // Update customer details (total interest paid will be updated)
        searchCustomer();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to record payment. Please try again.', 'error');
    }
});

// Edit payment
function editPayment(paymentId) {
    // Convert to string for comparison
    const idStr = String(paymentId);
    const payment = paymentHistory.find(p => String(p.id) === idStr);
    
    if (!payment) {
        showNotification('Payment not found in current list. Please refresh.', 'error');
        // Try to reload payment history
        if (currentAccountNumber) {
            loadPaymentHistory(currentAccountNumber);
        }
        return;
    }
    
    // Populate edit form
    document.getElementById('edit_payment_id').value = payment.id;
    document.getElementById('edit_payment_amount').value = payment.payment_amount;
    document.getElementById('edit_payment_month').value = payment.payment_month;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editPaymentModal'));
    modal.show();
}

// Update payment
async function updatePayment() {
    const paymentId = document.getElementById('edit_payment_id').value;
    const paymentAmount = parseFloat(document.getElementById('edit_payment_amount').value);
    const paymentMonth = document.getElementById('edit_payment_month').value;
    
    if (!paymentId) {
        showNotification('Payment ID is missing', 'error');
        return;
    }
    
    try {
        const updated = updatePaymentData(paymentId, {
            payment_amount: paymentAmount,
            payment_month: paymentMonth
        });
        
        if (updated) {
            showNotification('Payment updated successfully!', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editPaymentModal'));
            modal.hide();
            
            // Reload payment history
            if (currentAccountNumber) {
                loadPaymentHistory(currentAccountNumber);
                searchCustomer(); // Refresh customer details to update total interest paid
            }
        } else {
            showNotification('Payment not found. Please refresh and try again.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to update payment. Please try again.', 'error');
    }
}

// Delete payment
async function deletePayment(paymentId) {
    const confirmed = await showConfirm('Are you sure you want to delete this payment record?', 'Delete Payment');
    
    if (!confirmed) {
        return;
    }
    
    if (!paymentId) {
        showNotification('Payment ID is missing', 'error');
        return;
    }
    
    try {
        const deleted = deletePaymentData(String(paymentId));
        
        if (deleted) {
            showNotification('Payment deleted successfully!', 'success');
            
            // Reload payment history
            if (currentAccountNumber) {
                loadPaymentHistory(currentAccountNumber);
                searchCustomer(); // Refresh customer details to update total interest paid
            }
        } else {
            showNotification('Payment not found. Please refresh and try again.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to delete payment. Please try again.', 'error');
    }
}

// Wrapper functions (avoiding name conflicts)
function updatePaymentData(paymentId, updates) {
    const payments = getAllPayments();
    const idStr = String(paymentId); // Convert to string for comparison
    
    const index = payments.findIndex(p => String(p.id) === idStr);
    
    if (index === -1) {
        console.error('Payment not found with ID:', paymentId);
        console.log('Available payment IDs:', payments.map(p => p.id));
        return null;
    }
    
    const oldPayment = payments[index];
    payments[index] = {
        ...payments[index],
        ...updates,
        updated_at: new Date().toISOString()
    };
    
    saveAllPayments(payments);
    
    // Update total interest paid
    updateTotalInterestPaid(oldPayment.account_number);
    
    return payments[index];
}

function deletePaymentData(paymentId) {
    const payments = getAllPayments();
    const idStr = String(paymentId); // Convert to string for comparison
    
    const index = payments.findIndex(p => String(p.id) === idStr);
    
    if (index === -1) {
        console.error('Payment not found with ID:', paymentId);
        console.log('Available payment IDs:', payments.map(p => p.id));
        return false;
    }
    
    const accountNumber = payments[index].account_number;
    payments.splice(index, 1);
    saveAllPayments(payments);
    
    // Update total interest paid
    updateTotalInterestPaid(accountNumber);
    
    return true;
}

