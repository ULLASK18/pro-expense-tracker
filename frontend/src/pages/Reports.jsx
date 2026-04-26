import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { PieChart as PieIcon, BarChart3, TrendingUp, Download } from 'lucide-react';
import api from '../utils/api';

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#3b82f6'];

const Reports = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (data.length === 0) return;

    const headers = ['Date', 'Description', 'Amount', 'Category'];
    const csvRows = data.map(exp => [
      new Date(exp.date).toLocaleDateString(),
      `"${exp.text.replace(/"/g, '""')}"`, // Escape quotes
      exp.amount,
      exp.category
    ]);

    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `expensify_report_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process data for Category Pie Chart
  const categoryData = data.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, []);

  // Process data for Monthly Bar Chart
  const monthlyData = data.reduce((acc, curr) => {
    const month = new Date(curr.date).toLocaleString('default', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.amount += curr.amount;
    } else {
      acc.push({ month, amount: curr.amount });
    }
    return acc;
  }, []).reverse(); // Reverse to show chronological order if needed (simpler version)

  if (loading) return <div className="text-center py-20">Analyzing your spending...</div>;

  return (
    <div className="container mx-auto px-6 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <TrendingUp size={28} />
          </div>
          <h2 className="text-4xl font-black">Analytics & Reports</h2>
        </div>
        
        <button 
          onClick={downloadCSV}
          className="bg-bg-card hover:bg-white/10 border border-border-main px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all group"
        >
          <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
          Export CSV
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <PieIcon size={20} className="text-primary" />
            <h3 className="text-xl font-bold">Category Distribution</h3>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Spending */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 size={20} className="text-secondary" />
            <h3 className="text-xl font-bold">Monthly Trend</h3>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Stats Summary Section */}
      <div className="mt-12 glass-card p-8 bg-white/5">
        <h4 className="text-lg font-bold mb-4">Insights</h4>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-dark rounded-2xl border border-white/5">
            <p className="text-slate-500 text-sm mb-1">Most Spent Category</p>
            <p className="text-2xl font-black text-primary">
              {categoryData.sort((a,b) => b.value - a.value)[0]?.name || 'N/A'}
            </p>
          </div>
          <div className="p-6 bg-dark rounded-2xl border border-white/5">
            <p className="text-slate-500 text-sm mb-1">Average Transaction</p>
            <p className="text-2xl font-black text-white">
              ₹{(data.reduce((acc, c) => acc + c.amount, 0) / (data.length || 1)).toFixed(0)}
            </p>
          </div>
          <div className="p-6 bg-dark rounded-2xl border border-white/5">
            <p className="text-slate-500 text-sm mb-1">Active Months</p>
            <p className="text-2xl font-black text-secondary">{monthlyData.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
