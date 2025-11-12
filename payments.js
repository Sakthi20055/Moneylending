const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Update total interest paid for a borrower
async function updateTotalInterestPaid(accountNumber) {
  try {
    const [result] = await db.execute(
      `SELECT COALESCE(SUM(payment_amount), 0) as total 
       FROM interest_payments 
       WHERE account_number = ?`,
      [accountNumber]
    );
    
    const total = result[0].total;
    
    await db.execute(
      'UPDATE borrowers SET total_interest_paid = ? WHERE account_number = ?',
      [total, accountNumber]
    );
  } catch (error) {
    console.error('Error updating total interest paid:', error);
    throw error;
  }
}

// Record interest payment
router.post('/', async (req, res) => {
  try {
    const { account_number, payment_amount, payment_month } = req.body;
    
    // Validate required fields
    if (!account_number || !payment_amount || !payment_month) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if borrower exists
    const [borrower] = await db.execute(
      'SELECT * FROM borrowers WHERE account_number = ?',
      [account_number]
    );
    
    if (borrower.length === 0) {
      return res.status(404).json({ error: 'Borrower not found' });
    }
    
    // Insert payment
    const [result] = await db.execute(
      `INSERT INTO interest_payments (account_number, payment_amount, payment_month, payment_date) 
       VALUES (?, ?, ?, NOW())`,
      [account_number, payment_amount, payment_month]
    );
    
    // Update total interest paid
    await updateTotalInterestPaid(account_number);
    
    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// Get payment history for a borrower
router.get('/:accountNumber', async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const [rows] = await db.execute(
      `SELECT * FROM interest_payments 
       WHERE account_number = ? 
       ORDER BY payment_date DESC`,
      [accountNumber]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get all payments
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT ip.*, b.name, b.phone_no 
       FROM interest_payments ip
       JOIN borrowers b ON ip.account_number = b.account_number
       ORDER BY ip.payment_date DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Update payment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_amount, payment_month } = req.body;
    
    // Get account number before update
    const [payment] = await db.execute(
      'SELECT account_number FROM interest_payments WHERE id = ?',
      [id]
    );
    
    if (payment.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    const accountNumber = payment[0].account_number;
    
    // Update payment
    const [result] = await db.execute(
      `UPDATE interest_payments 
       SET payment_amount = ?, payment_month = ?
       WHERE id = ?`,
      [payment_amount, payment_month, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Update total interest paid
    await updateTotalInterestPaid(accountNumber);
    
    res.json({ success: true, message: 'Payment updated successfully' });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

// Delete payment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get account number before delete
    const [payment] = await db.execute(
      'SELECT account_number FROM interest_payments WHERE id = ?',
      [id]
    );
    
    if (payment.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    const accountNumber = payment[0].account_number;
    
    // Delete payment
    const [result] = await db.execute(
      'DELETE FROM interest_payments WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Update total interest paid
    await updateTotalInterestPaid(accountNumber);
    
    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

module.exports = router;

