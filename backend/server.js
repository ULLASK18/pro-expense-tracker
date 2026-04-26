const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://pro-expense-tracker.vercel.app'
  ],
  credentials: true,
}));

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

// Health check
app.get('/', (req, res) => res.json({ status: 'Pro Expense Tracker API is running' }));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Pro Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // No server.close() here to keep it simple, but we log it.
});
