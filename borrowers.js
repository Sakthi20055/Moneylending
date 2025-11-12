const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Generate unique 4-digit account number
async function generateAccountNumber() {
  let accountNumber;
  let isUnique = false;
  
  while (!isUnique) {
    // Generate random 4-digit number (1000-9999)
    accountNumber = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Check if it exists
    try {
      const [rows] = await db.execute(
        'SELECT account_number FROM borrowers WHERE account_number = ?',
        [accountNumber]
      );
      
      if (rows.length === 0) {
        isUnique = true;
      }
    } catch (error) {
      throw error;
    }
  }
  
  return accountNumber;
}

// Register new borrower
router.post('/', async (req, res) => {
  try {
    const { name, phone_no, city, loan_amount, interest_rate } = req.body;
    
    // Validate required fields
    if (!name || !phone_no || !city || !loan_amount || !interest_rate) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Generate unique account number
    const account_number = await generateAccountNumber();
    
    // Insert borrower
    const [result] = await db.execute(
      `INSERT INTO borrowers (account_number, name, phone_no, city, loan_amount, interest_rate) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [account_number, name, phone_no, city, loan_amount, interest_rate]
    );
    
    res.status(201).json({
      success: true,
      message: 'Borrower registered successfully',
      account_number: account_number,
      id: result.insertId
    });
  } catch (error) {
    console.error('Error registering borrower:', error);
    res.status(500).json({ error: 'Failed to register borrower' });
  }
});

// Get all borrowers
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM borrowers ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching borrowers:', error);
    res.status(500).json({ error: 'Failed to fetch borrowers' });
  }
});

// Get borrower by account number
router.get('/:accountNumber', async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const [rows] = await db.execute(
      'SELECT * FROM borrowers WHERE account_number = ?',
      [accountNumber]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Borrower not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching borrower:', error);
    res.status(500).json({ error: 'Failed to fetch borrower' });
  }
});

// Search borrowers by name or account number
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const [rows] = await db.execute(
      `SELECT * FROM borrowers 
       WHERE name LIKE ? OR account_number LIKE ? 
       ORDER BY name`,
      [`%${query}%`, `%${query}%`]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error searching borrowers:', error);
    res.status(500).json({ error: 'Failed to search borrowers' });
  }
});

// Update borrower
router.put('/:accountNumber', async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const { name, phone_no, city, loan_amount, interest_rate } = req.body;
    
    const [result] = await db.execute(
      `UPDATE borrowers 
       SET name = ?, phone_no = ?, city = ?, loan_amount = ?, interest_rate = ?
       WHERE account_number = ?`,
      [name, phone_no, city, loan_amount, interest_rate, accountNumber]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Borrower not found' });
    }
    
    res.json({ success: true, message: 'Borrower updated successfully' });
  } catch (error) {
    console.error('Error updating borrower:', error);
    res.status(500).json({ error: 'Failed to update borrower' });
  }
});

// Delete borrower
router.delete('/:accountNumber', async (req, res) => {
  try {
    const { accountNumber } = req.params;
    
    const [result] = await db.execute(
      'DELETE FROM borrowers WHERE account_number = ?',
      [accountNumber]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Borrower not found' });
    }
    
    res.json({ success: true, message: 'Borrower deleted successfully' });
  } catch (error) {
    console.error('Error deleting borrower:', error);
    res.status(500).json({ error: 'Failed to delete borrower' });
  }
});

module.exports = router;

