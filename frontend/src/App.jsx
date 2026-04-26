import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import AddExpensePage from './pages/AddExpensePage';
import VideoBackground from './components/Layout/VideoBackground';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen transition-colors duration-300">
            <VideoBackground />
            <Navbar />
          <div className="pt-24 pb-12">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/add-expense" element={<PrivateRoute><AddExpensePage /></PrivateRoute>} />
              <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
              
              <Route path="/about" element={<div className="container mx-auto px-6 py-12 max-w-4xl">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
                  <h2 className="text-4xl font-black mb-6">Our Mission</h2>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    We believe that financial freedom starts with awareness. Expensify was built to provide you with the tools 
                    needed to track, analyze, and optimize your spending habits through a modern, secure, and intuitive interface.
                  </p>
                </motion.div>
              </div>} />
              <Route path="/contact" element={<div className="container mx-auto px-6 py-12 max-w-2xl">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12">
                  <h2 className="text-3xl font-black mb-8 text-center">Get in Touch</h2>
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-300">Name</label>
                      <input type="text" className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-4 focus:border-primary outline-none" placeholder="Your Name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-300">Message</label>
                      <textarea className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-4 focus:border-primary outline-none h-32" placeholder="How can we help?"></textarea>
                    </div>
                    <button className="w-full bg-primary py-4 rounded-2xl font-black shadow-glow">Send Message</button>
                  </form>
                </motion.div>
              </div>} />
            </Routes>
          </div>
          <ToastContainer theme="dark" />
        </div>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
