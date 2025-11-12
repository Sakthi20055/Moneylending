// Calculate monthly interest
function calculateMonthlyInterest() {
    const loanAmount = parseFloat(document.getElementById('loan_amount').value) || 0;
    const interestRate = parseFloat(document.getElementById('interest_rate').value) || 0;
    
    // Monthly Interest = (Loan Amount × Interest Rate) / 100
    const monthlyInterest = (loanAmount * interestRate) / 100;
    
    document.getElementById('monthly_interest_display').textContent = 
        '₹' + monthlyInterest.toFixed(2);
}

// Add event listeners for real-time calculation
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loan_amount').addEventListener('input', calculateMonthlyInterest);
    document.getElementById('interest_rate').addEventListener('input', calculateMonthlyInterest);
});

// Show preview
function showPreview() {
    const name = document.getElementById('name').value;
    const phone_no = document.getElementById('phone_no').value;
    const city = document.getElementById('city').value;
    const loan_amount = parseFloat(document.getElementById('loan_amount').value) || 0;
    const interest_rate = parseFloat(document.getElementById('interest_rate').value) || 0;
    
    // Validate form
    if (!name || !phone_no || !city || !loan_amount || !interest_rate) {
        showNotification('Please fill in all fields', 'warning');
        return;
    }
    
    // Calculate monthly interest
    const monthlyInterest = (loan_amount * interest_rate) / 100;
    
    // Populate preview
    document.getElementById('preview_name').textContent = name;
    document.getElementById('preview_phone').textContent = phone_no;
    document.getElementById('preview_city').textContent = city;
    document.getElementById('preview_loan').textContent = '₹' + loan_amount.toFixed(2);
    document.getElementById('preview_rate').textContent = interest_rate + '%';
    document.getElementById('preview_interest').innerHTML = '<strong>₹' + monthlyInterest.toFixed(2) + '</strong>';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('previewModal'));
    modal.show();
}

// Register borrower
function registerBorrower() {
    const name = document.getElementById('name').value;
    const phone_no = document.getElementById('phone_no').value;
    const city = document.getElementById('city').value;
    const loan_amount = parseFloat(document.getElementById('loan_amount').value);
    const interest_rate = parseFloat(document.getElementById('interest_rate').value);
    
    try {
        const newBorrower = addBorrower({
            name,
            phone_no,
            city,
            loan_amount,
            interest_rate
        });
        
        showNotification(`Borrower registered successfully! Account Number: ${newBorrower.account_number}`, 'success', 'Registration Successful');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('previewModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('registerForm').reset();
        document.getElementById('monthly_interest_display').textContent = '₹0.00';
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to register borrower. Please try again.', 'error');
    }
}

