import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, LayoutDashboard, PlusCircle, PieChart, Home, Info, Mail, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  const authLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Add Expense', path: '/add-expense', icon: PlusCircle },
    { name: 'Reports', path: '/reports', icon: PieChart },
  ];

  const menuVariants = {
    closed: { opacity: 0, x: "100%" },
    open: { opacity: 1, x: 0 }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center glass px-6 py-3 rounded-2xl">
        {/* Logo */}
        <Link to="/" className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          EXPENSIFY
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`text-sm font-medium hover:text-primary transition-colors ${location.pathname === link.path ? 'text-primary' : 'text-slate-300'}`}
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-6 border-l border-white/10 pl-6">
              <button 
                onClick={toggleTheme}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-primary"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              {authLinks.map((link) => (
                <Link key={link.path} to={link.path} title={link.name} className="text-slate-300 hover:text-primary transition-colors">
                  <link.icon size={20} />
                </Link>
              ))}
              <button onClick={handleLogout} className="text-slate-300 hover:text-secondary transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-primary mr-2"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Link to="/login" className="text-sm font-medium hover:text-primary">Login</Link>
              <Link to="/signup" className="bg-primary hover:bg-primary-dark px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-glow">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Hamburger Toggle */}
        <button 
          className="md:hidden text-slate-100 p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-dark/95 z-40 flex flex-col justify-center items-center gap-8 md:hidden"
          >
            <div className="flex flex-col items-center gap-6 text-center">
              {[...navLinks, ...(user ? authLinks : [])].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-3xl font-bold text-slate-200 hover:text-primary transition-colors flex items-center gap-4"
                >
                  <link.icon size={32} />
                  {link.name}
                </Link>
              ))}
              
              {!user && (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="text-2xl font-bold text-slate-400">Login</Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)} className="text-2xl font-bold text-primary">Sign Up</Link>
                </>
              )}
              
              {user && (
                <button 
                  onClick={handleLogout}
                  className="text-2xl font-bold text-secondary flex items-center gap-4 mt-4"
                >
                  <LogOut size={32} />
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
