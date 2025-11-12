// LocalStorage Data Management
// This replaces the database functionality

const STORAGE_KEYS = {
  BORROWERS: 'money_lending_borrowers',
  PAYMENTS: 'money_lending_payments'
};

// Initialize storage if empty
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.BORROWERS)) {
    localStorage.setItem(STORAGE_KEYS.BORROWERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
  }
}

// Get all borrowers
function getAllBorrowers() {
  initStorage();
  const data = localStorage.getItem(STORAGE_KEYS.BORROWERS);
  return JSON.parse(data || '[]');
}

// Save all borrowers
function saveAllBorrowers(borrowers) {
  localStorage.setItem(STORAGE_KEYS.BORROWERS, JSON.stringify(borrowers));
}

// Get all payments
function getAllPayments() {
  initStorage();
  const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
  return JSON.parse(data || '[]');
}

// Save all payments
function saveAllPayments(payments) {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
}

// Generate unique 4-digit account number
function generateAccountNumber() {
  const borrowers = getAllBorrowers();
  let accountNumber;
  let isUnique = false;
  
  while (!isUnique) {
    accountNumber = Math.floor(1000 + Math.random() * 9000).toString();
    const exists = borrowers.find(b => b.account_number === accountNumber);
    if (!exists) {
      isUnique = true;
    }
  }
  
  return accountNumber;
}

// Add new borrower
function addBorrower(borrowerData) {
  const borrowers = getAllBorrowers();
  const accountNumber = generateAccountNumber();
  
  const newBorrower = {
    id: Date.now().toString(),
    account_number: accountNumber,
    name: borrowerData.name,
    phone_no: borrowerData.phone_no,
    city: borrowerData.city,
    loan_amount: parseFloat(borrowerData.loan_amount),
    interest_rate: parseFloat(borrowerData.interest_rate),
    total_interest_paid: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  borrowers.push(newBorrower);
  saveAllBorrowers(borrowers);
  
  return newBorrower;
}

// Get borrower by account number
function getBorrowerByAccountNumber(accountNumber) {
  const borrowers = getAllBorrowers();
  return borrowers.find(b => b.account_number === accountNumber);
}

// Search borrowers
function searchBorrowers(query) {
  const borrowers = getAllBorrowers();
  const queryLower = query.toLowerCase();
  
  return borrowers.filter(borrower => {
    const name = (borrower.name || '').toLowerCase();
    const accountNumber = (borrower.account_number || '').toString();
    const phone = (borrower.phone_no || '').toString();
    const city = (borrower.city || '').toLowerCase();
    
    return name.includes(queryLower) ||
           accountNumber.includes(query) ||
           phone.includes(query) ||
           city.includes(queryLower);
  });
}

// Update borrower
function updateBorrower(accountNumber, updates) {
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

// Delete borrower
function deleteBorrower(accountNumber) {
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

// Add payment
function addPayment(paymentData) {
  const payments = getAllPayments();
  
  const newPayment = {
    id: Date.now().toString(),
    account_number: paymentData.account_number,
    payment_amount: parseFloat(paymentData.payment_amount),
    payment_month: paymentData.payment_month,
    payment_date: new Date().toISOString(),
    created_at: new Date().toISOString()
  };
  
  payments.push(newPayment);
  saveAllPayments(payments);
  
  // Update borrower's total interest paid
  updateTotalInterestPaid(paymentData.account_number);
  
  return newPayment;
}

// Get payments by account number
function getPaymentsByAccountNumber(accountNumber) {
  const payments = getAllPayments();
  return payments
    .filter(p => p.account_number === accountNumber)
    .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
}

// Update total interest paid for a borrower
function updateTotalInterestPaid(accountNumber) {
  const payments = getAllPayments();
  const borrowerPayments = payments.filter(p => p.account_number === accountNumber);
  
  const total = borrowerPayments.reduce((sum, p) => sum + parseFloat(p.payment_amount || 0), 0);
  
  // Update borrower's total_interest_paid directly
  const borrowers = getAllBorrowers();
  const index = borrowers.findIndex(b => b.account_number === accountNumber);
  
  if (index !== -1) {
    borrowers[index].total_interest_paid = total;
    borrowers[index].updated_at = new Date().toISOString();
    saveAllBorrowers(borrowers);
  }
}

// Update payment
function updatePayment(paymentId, updates) {
  const payments = getAllPayments();
  const index = payments.findIndex(p => p.id === paymentId);
  
  if (index === -1) {
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

// Delete payment
function deletePayment(paymentId) {
  const payments = getAllPayments();
  const index = payments.findIndex(p => p.id === paymentId);
  
  if (index === -1) {
    return false;
  }
  
  const accountNumber = payments[index].account_number;
  payments.splice(index, 1);
  saveAllPayments(payments);
  
  // Update total interest paid
  updateTotalInterestPaid(accountNumber);
  
  return true;
}

// Get report data
function getReportData(accountNumber) {
  const borrower = getBorrowerByAccountNumber(accountNumber);
  if (!borrower) {
    return null;
  }
  
  const payments = getPaymentsByAccountNumber(accountNumber);
  const monthlyInterest = (borrower.loan_amount * borrower.interest_rate) / 100;
  
  return {
    borrower: borrower,
    monthlyInterest: monthlyInterest,
    paymentHistory: payments,
    totalInterestPaid: parseFloat(borrower.total_interest_paid) || 0,
    generatedAt: new Date().toISOString()
  };
}

// Export data (for backup)
function exportData() {
  return {
    borrowers: getAllBorrowers(),
    payments: getAllPayments(),
    exportedAt: new Date().toISOString()
  };
}

// Import data (for restore)
function importData(data) {
  if (data.borrowers) {
    saveAllBorrowers(data.borrowers);
  }
  if (data.payments) {
    saveAllPayments(data.payments);
  }
}

// Initialize on load
initStorage();

