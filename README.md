# Money Lending System

A fully client-side web-based money lending system that works without any backend or database. All data is stored in the browser's localStorage, making it perfect for hosting on static hosting services like Netlify.

## Features

- **New Borrower Registration**: Register borrowers with automatic account number generation (4-digit unique number)
- **Borrower List**: View all borrowers with full CRUD operations (Create, Read, Update, Delete)
- **Monthly Interest Payment**: Record and manage monthly interest payments with search functionality
- **Customer Reports**: Generate detailed statements for specific customers with PDF export
- **Real-time Interest Calculation**: Automatic calculation of monthly interest based on loan amount and interest rate
- **Total Interest Tracking**: Automatically tracks and updates total interest paid for each borrower
- **No Backend Required**: Works completely client-side using localStorage
- **Netlify Ready**: Can be hosted on Netlify as a static website

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript (Bootstrap 5)
- **Storage**: Browser localStorage (no database needed!)
- **PDF Generation**: jsPDF library

## Installation

1. **Clone or download the project**

2. **No installation needed!** Just open `public/index.html` in your browser, or:
   - Use a local web server (like Live Server in VS Code)
   - Or deploy directly to Netlify

## Local Development

### Option 1: Simple HTTP Server
```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server public -p 8000
```

Then open `http://localhost:8000` in your browser.

### Option 2: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click on `public/index.html`
3. Select "Open with Live Server"

## Deployment to Netlify

### Method 1: Drag and Drop
1. Go to [Netlify](https://www.netlify.com/)
2. Sign up or log in
3. Drag and drop the `public` folder onto Netlify dashboard
4. Your site will be live in seconds!

### Method 2: Git Integration
1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Set build settings:
   - **Publish directory**: `public`
   - **Build command**: (leave empty)
4. Deploy!

### Method 3: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd public
netlify deploy --prod
```

## Usage Guide

### 1. Register New Borrower

1. Fill in the registration form:
   - Name
   - Phone Number
   - City
   - Loan Amount
   - Interest Rate (% per month)

2. The monthly interest amount is calculated automatically as you type

3. Click "Done (Preview)" to see a preview of all details

4. Click "OK Registered" to create the account with a unique 4-digit account number

### 2. Borrower List

- View all registered borrowers in a table
- Search by name, account number, phone, or city
- **Edit**: Click the edit icon to update borrower information
- **Delete**: Click the delete icon to remove a borrower (with confirmation)

### 3. Pay Monthly Interest

1. Search for a customer by account number or name
2. Customer details and monthly interest amount will be displayed
3. Enter the payment amount and select the payment month
4. Click "Pay Interest" to record the payment
5. View, edit, or delete payment records in the payment history table

### 4. Generate Reports

1. Search for a customer by account number or name
2. View complete customer statement including:
   - Customer information
   - Loan details
   - Payment history
   - Total interest paid
3. Click "Download PDF Report" to export as PDF

## Data Storage

All data is stored in the browser's **localStorage**:
- **Borrowers**: Stored under key `money_lending_borrowers`
- **Payments**: Stored under key `money_lending_payments`

### Important Notes:
- Data is stored locally in each browser
- Data persists even after closing the browser
- To clear data, use browser's developer tools to clear localStorage
- Data is specific to each browser/device

### Backup and Restore

You can backup your data by:
1. Opening browser console (F12)
2. Running: `JSON.stringify(localStorage)`
3. Copy the output and save it

To restore:
1. Open browser console
2. Run: `localStorage.setItem('money_lending_borrowers', '[your data]')`
3. Run: `localStorage.setItem('money_lending_payments', '[your data]')`

## Interest Calculation

Monthly Interest = (Loan Amount × Interest Rate) / 100

Example:
- Loan Amount: ₹100,000
- Interest Rate: 2% per month
- Monthly Interest: (100,000 × 2) / 100 = ₹2,000

## File Structure

```
money-lending-system/
├── public/
│   ├── index.html          # Main HTML file
│   ├── css/
│   │   └── style.css       # Styles
│   └── js/
│       ├── storage.js      # localStorage management
│       ├── notifications.js # Notification system
│       ├── register.js     # Registration functionality
│       ├── list.js         # Borrower list
│       ├── payment.js      # Payment management
│       └── report.js       # Report generation
├── package.json
└── README.md
```

## Features

- ✅ No backend required
- ✅ No database setup needed
- ✅ Works offline
- ✅ Fast and responsive
- ✅ PDF report generation
- ✅ Beautiful UI with Bootstrap
- ✅ Styled notifications
- ✅ Full CRUD operations
- ✅ Data persistence with localStorage

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Troubleshooting

1. **Data not saving?**
   - Check if localStorage is enabled in your browser
   - Make sure you're not in private/incognito mode

2. **PDF not generating?**
   - Check browser console for errors
   - Make sure jsPDF library is loaded

3. **Styling issues?**
   - Clear browser cache
   - Make sure Bootstrap CDN is accessible

## License

ISC

## Support

For issues or questions, please check:
- Browser console for errors
- localStorage in browser DevTools
- Network tab for any failed resource loads
