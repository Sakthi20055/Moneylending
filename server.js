const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/borrowers', require('./routes/borrowers'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/reports', require('./routes/reports'));

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Make sure MySQL database is set up and running');
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use!`);
    console.log(`\nTo fix this, you can:`);
    console.log(`1. Kill the process using port ${PORT}:`);
    console.log(`   Windows: netstat -ano | findstr :${PORT}`);
    console.log(`   Then: taskkill /PID <PID> /F`);
    console.log(`\n2. Or use a different port by setting PORT environment variable:`);
    console.log(`   set PORT=3001 && npm start`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

