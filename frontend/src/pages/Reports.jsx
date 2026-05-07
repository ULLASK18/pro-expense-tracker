import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { PieChart as PieIcon, BarChart3, TrendingUp, Download } from 'lucide-react';
import api from '../utils/api';

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#3b82f6'];

const Reports = () => {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expRes, incRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/incomes')
      ]);
      setExpenses(expRes.data.data);
      setIncomes(incRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const allData = [
      ...expenses.map(e => ({ ...e, type: 'Expense' })),
      ...incomes.map(i => ({ ...i, type: 'Income' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (allData.length === 0) return;

    const headers = ['Date', 'Type', 'Description', 'Amount', 'Category'];
    const csvRows = allData.map(item => [
      new Date(item.date).toLocaleDateString(),
      item.type,
      `"${item.text.replace(/"/g, '""')}"`,
      item.amount,
      item.category
    ]);

    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `expensify_full_report_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process data for Category Pie Chart (Expenses only for breakdown)
  const categoryData = expenses.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, []);

  // Process data for Monthly Comparison
  const months = [...new Set([
    ...expenses.map(e => new Date(e.date).toLocaleString('default', { month: 'short' })),
    ...incomes.map(i => new Date(i.date).toLocaleString('default', { month: 'short' }))
  ])];

  const monthlyComparisonData = months.map(month => {
    const exp = expenses
      .filter(e => new Date(e.date).toLocaleString('default', { month: 'short' }) === month)
      .reduce((acc, c) => acc + c.amount, 0);
    const inc = incomes
      .filter(i => new Date(i.date).toLocaleString('default', { month: 'short' }) === month)
      .reduce((acc, c) => acc + c.amount, 0);
    return { month, expense: exp, income: inc };
  });

  if (loading) return <div className="text-center py-20">Analyzing your financials...</div>;

  const totalExp = expenses.reduce((acc, c) => acc + c.amount, 0);
  const totalInc = incomes.reduce((acc, c) => acc + c.amount, 0);
  const savingsRate = totalInc > 0 ? ((totalInc - totalExp) / totalInc * 100).toFixed(1) : 0;

  return (
    <div className="container mx-auto px-6 max-w-6xl pt-24 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <TrendingUp size={28} />
          </div>
          <h2 className="text-4xl font-black">Financial Analytics</h2>
        </div>
        
        <button 
          onClick={downloadCSV}
          className="bg-bg-card hover:bg-white/10 border border-border-main px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all group"
        >
          <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
          Export All Data
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Expense Category Breakdown */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <PieIcon size={20} className="text-primary" />
            <h3 className="text-xl font-bold">Expense Breakdown</h3>
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

        {/* Income vs Expense Monthly */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 size={20} className="text-green-500" />
            <h3 className="text-xl font-bold">Income vs Expense</h3>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparisonData}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Stats Summary Section */}
      <div className="mt-12 glass-card p-8 bg-white/5">
        <h4 className="text-lg font-bold mb-4">Financial Health Insights</h4>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-dark rounded-2xl border border-white/5">
            <p className="text-slate-500 text-sm mb-1">Savings Rate</p>
            <p className={`text-2xl font-black ${savingsRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {savingsRate}%
            </p>
          </div>
          <div className="p-6 bg-dark rounded-2xl border border-white/5">
            <p className="text-slate-500 text-sm mb-1">Total Savings</p>
            <p className="text-2xl font-black text-white">
              ₹{(totalInc - totalExp).toLocaleString()}
            </p>
          </div>
          <div className="p-6 bg-dark rounded-2xl border border-white/5">
            <p className="text-slate-500 text-sm mb-1">Avg. Monthly Income</p>
            <p className="text-2xl font-black text-green-500">
              ₹{(totalInc / (months.length || 1)).toFixed(0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
