let allBorrowers = [];

// Load all borrowers
function loadBorrowers() {
    try {
        allBorrowers = getAllBorrowers();
        displayBorrowers(allBorrowers);
    } catch (error) {
        console.error('Error loading borrowers:', error);
        document.getElementById('borrowerTableBody').innerHTML = 
            '<tr><td colspan="9" class="text-center text-danger">Error loading borrowers</td></tr>';
        showNotification('Failed to load borrowers. Please refresh the page.', 'error');
    }
}

// Display borrowers in table
function displayBorrowers(borrowers) {
    const tbody = document.getElementById('borrowerTableBody');
    
    if (borrowers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">No borrowers found</td></tr>';
        return;
    }
    
    tbody.innerHTML = borrowers.map(borrower => {
        // Calculate monthly interest
        const monthlyInterest = (parseFloat(borrower.loan_amount) * parseFloat(borrower.interest_rate)) / 100;
        
        return `
        <tr>
            <td>${borrower.account_number}</td>
            <td>${borrower.name}</td>
            <td>${borrower.phone_no}</td>
            <td>${borrower.city}</td>
            <td>₹${parseFloat(borrower.loan_amount).toFixed(2)}</td>
            <td>${borrower.interest_rate}%</td>
            <td>₹${monthlyInterest.toFixed(2)}</td>
            <td>₹${parseFloat(borrower.total_interest_paid || 0).toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editBorrower('${borrower.account_number}')" title="Edit">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteBorrower('${borrower.account_number}', '${borrower.name}')" title="Delete">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `;
    }).join('');
}

// Search borrowers in list view (filter displayed list)
function filterBorrowerList() {
    const query = document.getElementById('searchBorrower').value.toLowerCase();
    
    if (query === '') {
        displayBorrowers(allBorrowers);
        return;
    }
    
    const filtered = allBorrowers.filter(borrower => 
        borrower.name.toLowerCase().includes(query) ||
        borrower.account_number.includes(query) ||
        borrower.phone_no.includes(query) ||
        borrower.city.toLowerCase().includes(query)
    );
    
    displayBorrowers(filtered);
}

// Edit borrower
function editBorrower(accountNumber) {
    const borrower = allBorrowers.find(b => b.account_number === accountNumber);
    
    if (!borrower) {
        showNotification('Borrower not found', 'error');
        return;
    }
    
    // Populate edit form
    document.getElementById('edit_account_number').value = borrower.account_number;
    document.getElementById('edit_name').value = borrower.name;
    document.getElementById('edit_phone').value = borrower.phone_no;
    document.getElementById('edit_city').value = borrower.city;
    document.getElementById('edit_loan_amount').value = borrower.loan_amount;
    document.getElementById('edit_interest_rate').value = borrower.interest_rate;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editBorrowerModal'));
    modal.show();
}

// Update borrower
async function updateBorrower() {
    const accountNumber = document.getElementById('edit_account_number').value;
    const name = document.getElementById('edit_name').value;
    const phone_no = document.getElementById('edit_phone').value;
    const city = document.getElementById('edit_city').value;
    const loan_amount = parseFloat(document.getElementById('edit_loan_amount').value);
    const interest_rate = parseFloat(document.getElementById('edit_interest_rate').value);
    
    try {
        const updated = updateBorrowerData(accountNumber, {
            name,
            phone_no,
            city,
            loan_amount,
            interest_rate
        });
        
        if (updated) {
            showNotification('Borrower updated successfully!', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editBorrowerModal'));
            modal.hide();
            
            // Reload borrowers
            loadBorrowers();
        } else {
            showNotification('Borrower not found', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to update borrower. Please try again.', 'error');
    }
}

// Delete borrower
async function deleteBorrower(accountNumber, name) {
    const message = `Are you sure you want to delete borrower <strong>"${name}"</strong> (Account: ${accountNumber})?<br><br>This will also delete all payment records for this borrower.`;
    
    const confirmed = await showConfirm(message, 'Delete Borrower');
    
    if (!confirmed) {
        return;
    }
    
    try {
        const deleted = deleteBorrowerData(accountNumber);
        
        if (deleted) {
            showNotification('Borrower deleted successfully!', 'success');
            loadBorrowers();
        } else {
            showNotification('Borrower not found', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to delete borrower. Please try again.', 'error');
    }
}

// Wrapper functions to use storage functions (avoiding name conflicts)
function updateBorrowerData(accountNumber, updates) {
    // Call the storage function from storage.js
    const borrowers = getAllBorrowers();
    const index = borrowers.findIndex(b => b.account_number === accountNumber);
    
    if (index === -1) {
        return null;
    }
    
    borrowers[index] = {
        ...borrowers[index],
        ...updates,
        updated_at: new Date().toISOString()
    };
    
    saveAllBorrowers(borrowers);
    return borrowers[index];
}

function deleteBorrowerData(accountNumber) {
    const borrowers = getAllBorrowers();
    const filtered = borrowers.filter(b => b.account_number !== accountNumber);
    
    if (filtered.length === borrowers.length) {
        return false; // Not found
    }
    
    saveAllBorrowers(filtered);
    
    // Also delete all related payments
    const payments = getAllPayments();
    const filteredPayments = payments.filter(p => p.account_number !== accountNumber);
    saveAllPayments(filteredPayments);
    
    return true;
}

