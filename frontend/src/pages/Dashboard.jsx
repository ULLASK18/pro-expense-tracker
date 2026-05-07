import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Trash2, Calendar, Tag, IndianRupee, ArrowUpRight, ArrowDownRight, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import Modal from '../components/UI/Modal';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterType, setFilterType] = useState('All'); // 'All', 'Income', 'Expense'
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  // Undo Logic State
  const pendingDeletes = useRef({}); 
  const backupTransactions = useRef({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expRes, incRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/incomes')
      ]);
      
      const exps = expRes.data.data.map(e => ({ ...e, type: 'expense' }));
      const incs = incRes.data.data.map(i => ({ ...i, type: 'income' }));
      
      const all = [...exps, ...incs].sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(all);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id, type) => {
    setSelectedId(id);
    setSelectedType(type);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    const id = selectedId;
    const type = selectedType;
    const itemToDelete = transactions.find(t => t._id === id);
    
    if (!itemToDelete) return;

    // 1. Hide from UI immediately
    setTransactions(prev => prev.filter(t => t._id !== id));
    setIsModalOpen(false);
    backupTransactions.current[id] = itemToDelete;

    // 2. Set 10-second timeout for actual API call
    const timeoutId = setTimeout(async () => {
      try {
        const endpoint = type === 'expense' ? `/expenses/${id}` : `/incomes/${id}`;
        await api.delete(endpoint);
        delete pendingDeletes.current[id];
        delete backupTransactions.current[id];
      } catch (err) {
        console.error('Final delete failed', err);
      }
    }, 10000);

    pendingDeletes.current[id] = timeoutId;

    // 3. Show Toast with Undo button
    toast.info(
      <div className="flex items-center justify-between gap-4">
        <span>{type === 'expense' ? 'Expense' : 'Income'} deleted</span>
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
    if (pendingDeletes.current[id]) {
      clearTimeout(pendingDeletes.current[id]);
      delete pendingDeletes.current[id];
    }

    const restored = backupTransactions.current[id];
    if (restored) {
      setTransactions(prev => {
        if (prev.find(t => t._id === id)) return prev;
        return [restored, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date));
      });
      delete backupTransactions.current[id];
    }

    toast.dismiss();
    toast.success('Restored!');
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
    const matchesType = filterType === 'All' || (filterType === 'Expense' ? t.type === 'expense' : t.type === 'income');
    return matchesSearch && matchesCategory && matchesType;
  });

  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const categories = ['All', 'Food', 'Travel', 'Bills', 'Shopping', 'Health', 'Entertainment', 'Education', 'Salary', 'Freelance', 'Investment', 'Others'];

  return (
    <div className="container mx-auto px-6 max-w-6xl pt-24 pb-12">
      {/* Header Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className={`glass-card p-8 bg-gradient-to-br transition-all duration-500 ${balance >= 0 ? 'from-green-500/20' : 'from-red-500/20'} to-transparent`}>
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${balance >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
              <IndianRupee size={24} />
            </div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Balance</span>
          </div>
          <h2 className="text-4xl font-black">₹{balance.toLocaleString()}</h2>
          <p className="text-text-muted text-sm mt-2 flex items-center gap-1">
            {balance >= 0 ? <ArrowUpRight size={16} className="text-green-500" /> : <ArrowDownRight size={16} className="text-red-500" />}
            Across {transactions.length} items
          </p>
        </div>

        <div className="glass-card p-8 bg-gradient-to-br from-green-500/10 to-transparent">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Total Income</span>
          <h2 className="text-3xl font-black text-green-500">₹{totalIncome.toLocaleString()}</h2>
          <Link to="/add-income" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-green-500 hover:underline">
            <Plus size={14} /> Add Income
          </Link>
        </div>

        <div className="glass-card p-8 bg-gradient-to-br from-primary/10 to-transparent">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Total Expense</span>
          <h2 className="text-3xl font-black text-primary">₹{totalExpense.toLocaleString()}</h2>
          <Link to="/add-expense" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline">
            <Plus size={14} /> Add Expense
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
          <div className="flex bg-white/5 p-1 rounded-xl gap-1 mr-2">
            {['All', 'Income', 'Expense'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === type ? 'bg-primary text-white shadow-glow' : 'text-text-muted hover:bg-white/5'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
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

      {/* Transaction List */}
      <div className="space-y-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-24 glass-card animate-pulse" />)
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <p className="text-slate-500">No transactions found.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredTransactions.map((t) => (
              <motion.div
                key={t._id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`glass-card p-6 flex flex-wrap items-center justify-between gap-4 group border-l-4 ${t.type === 'expense' ? 'border-primary/50' : 'border-green-500/50'}`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 glass bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${t.type === 'expense' ? 'text-primary' : 'text-green-500'}`}>
                    {t.type === 'expense' ? <ArrowDownRight size={24} /> : <ArrowUpRight size={24} />}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">{t.text}</h4>
                    <div className="flex items-center gap-4 text-xs text-text-muted mt-1 font-medium">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(t.date).toLocaleDateString()}</span>
                      <span className={`px-2 py-0.5 rounded-lg ${t.type === 'expense' ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-500'}`}>{t.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <span className={`text-2xl font-black ${t.type === 'expense' ? 'text-white' : 'text-green-500'}`}>
                    {t.type === 'expense' ? '-' : '+'}₹{t.amount.toLocaleString()}
                  </span>
                  <button 
                    onClick={() => handleDeleteClick(t._id, t.type)}
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
        message={`Are you sure you want to delete this ${selectedType}? This action cannot be undone.`}
      />
    </div>
  );
};

export default Dashboard;
