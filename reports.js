const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Generate customer statement/report
router.get('/:accountNumber', async (req, res) => {
  try {
    const { accountNumber } = req.params;
    
    // Get borrower details
    const [borrowers] = await db.execute(
      'SELECT * FROM borrowers WHERE account_number = ?',
      [accountNumber]
    );
    
    if (borrowers.length === 0) {
      return res.status(404).json({ error: 'Borrower not found' });
    }
    
    const borrower = borrowers[0];
    
    // Get payment history
    const [payments] = await db.execute(
      `SELECT * FROM interest_payments 
       WHERE account_number = ? 
       ORDER BY payment_date DESC`,
      [accountNumber]
    );
    
    // Calculate monthly interest
    const monthlyInterest = (borrower.loan_amount * borrower.interest_rate) / 100;
    
    // Calculate outstanding interest (if any)
    // This is a simple calculation - you might want to adjust based on business logic
    const totalInterestPaid = parseFloat(borrower.total_interest_paid) || 0;
    
    const report = {
      borrower: borrower,
      monthlyInterest: monthlyInterest,
      paymentHistory: payments,
      totalInterestPaid: totalInterestPaid,
      generatedAt: new Date().toISOString()
    };
    
    res.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;

