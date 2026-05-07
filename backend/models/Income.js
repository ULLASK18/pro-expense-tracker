const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please add a positive amount'],
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Salary', 'Freelance', 'Investment', 'Gift', 'Business', 'Rental', 'Other'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Income', IncomeSchema);
