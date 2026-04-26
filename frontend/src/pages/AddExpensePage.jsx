import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, IndianRupee, Type, Tag, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const AddExpensePage = () => {
  const [formData, setFormData] = useState({
    text: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const categories = ['Food', 'Travel', 'Bills', 'Shopping', 'Health', 'Entertainment', 'Education', 'Others'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/expenses', formData);
      toast.success('Expense added!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-12"
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <PlusCircle size={28} />
          </div>
          <h2 className="text-3xl font-black">Add New Expense</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-muted px-1">Description</label>
            <div className="relative">
              <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="text"
                required
                className="input-field w-full pl-12"
                placeholder="e.g. Dinner with friends"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-muted px-1">Amount (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="number"
                  required
                  className="input-field w-full pl-12"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-muted px-1">Category</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <select
                  className="input-field w-full pl-12 appearance-none"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map(cat => <option key={cat} value={cat} className="bg-bg-main text-text-main">{cat}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-text-muted px-1">Date</label>
            <div className="relative">
              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="date"
                required
                className="input-field w-full pl-12"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark py-4 rounded-2xl font-black text-lg shadow-glow transition-all flex justify-center items-center gap-2 disabled:opacity-50 mt-4"
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddExpensePage;
