import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Trash2, Calendar, Tag, IndianRupee, ArrowUpRight, ArrowDownRight, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import Modal from '../components/UI/Modal';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);

  // Undo Logic State
  const pendingDeletes = useRef({}); // Stores { id: timeoutId }
  const backupExpenses = useRef({}); // Stores { id: expenseData }

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data.data);
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedExpenseId(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    const id = selectedExpenseId;
    const expenseToDelete = expenses.find(e => e._id === id);
    
    if (!expenseToDelete) return;

    // 1. Hide from UI immediately
    setExpenses(prev => prev.filter(e => e._id !== id));
    setIsModalOpen(false);
    backupExpenses.current[id] = expenseToDelete;

    // 2. Set 10-second timeout for actual API call
    const timeoutId = setTimeout(async () => {
      try {
        await api.delete(`/expenses/${id}`);
        delete pendingDeletes.current[id];
        delete backupExpenses.current[id];
      } catch (err) {
        // If API fails, we might want to put it back, but for now just log
        console.error('Final delete failed', err);
      }
    }, 10000);

    pendingDeletes.current[id] = timeoutId;

    // 3. Show Toast with Undo button
    toast.info(
      <div className="flex items-center justify-between gap-4">
        <span>Expense deleted</span>
        <button 
          onClick={() => handleUndo(id)}
          className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg font-bold transition-all text-xs"
        >
          <RotateCcw size={14} /> UNDO
        </button>
      </div>,
      { autoClose: 10000, icon: false }
    );
  };

  const handleUndo = (id) => {
    // 1. Cancel the pending API call
    if (pendingDeletes.current[id]) {
      clearTimeout(pendingDeletes.current[id]);
      delete pendingDeletes.current[id];
    }

    // 2. Restore to UI
    const restoredExpense = backupExpenses.current[id];
    if (restoredExpense) {
      setExpenses(prev => {
        // Check if already restored to avoid duplicates
        if (prev.find(e => e._id === id)) return prev;
        return [restoredExpense, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date));
      });
      delete backupExpenses.current[id];
    }

    toast.dismiss();
    toast.success('Restored!');
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || exp.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalAmount = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const categories = ['All', 'Food', 'Travel', 'Bills', 'Shopping', 'Health', 'Entertainment', 'Education', 'Others'];

  return (
    <div className="container mx-auto px-6 max-w-6xl">
      {/* Header Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-8 bg-gradient-to-br from-primary/20 to-transparent">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/20 rounded-2xl text-primary"><IndianRupee size={24} /></div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Spending</span>
          </div>
          <h2 className="text-4xl font-black">₹{totalAmount.toLocaleString()}</h2>
          <p className="text-text-muted text-sm mt-2 flex items-center gap-1">
            <ArrowUpRight size={16} className="text-secondary" /> From {filteredExpenses.length} transactions
          </p>
        </div>

        <div className="md:col-span-2 glass-card p-8 flex flex-col justify-center items-center text-center">
          <h3 className="text-xl font-bold mb-4 text-text-muted">Ready to track more?</h3>
          <Link to="/add-expense" className="bg-primary text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all shadow-glow">
            <Plus size={20} /> Add New Expense
          </Link>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          <input
            type="text"
            placeholder="Search transactions..."
            className="input-field w-full pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <Filter size={18} className="text-text-muted shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                filterCategory === cat 
                ? 'bg-primary text-white shadow-glow' 
                : 'glass text-text-muted hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expense List */}
      <div className="space-y-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-24 glass-card animate-pulse" />)
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <p className="text-slate-500">No expenses found. Time to go shopping?</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredExpenses.map((exp) => (
              <motion.div
                key={exp._id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-6 flex flex-wrap items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 glass bg-white/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Tag size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">{exp.text}</h4>
                    <div className="flex items-center gap-4 text-xs text-text-muted mt-1 font-medium">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(exp.date).toLocaleDateString()}</span>
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg">{exp.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <span className="text-2xl font-black">₹{exp.amount.toLocaleString()}</span>
                  <button 
                    onClick={() => handleDeleteClick(exp._id)}
                    className="p-3 hover:bg-secondary/10 text-text-muted hover:text-secondary rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this expense? This action cannot be undone."
      />
    </div>
  );
};

export default Dashboard;
