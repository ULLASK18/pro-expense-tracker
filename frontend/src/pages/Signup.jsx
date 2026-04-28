import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = '776030954621-ei2ffum5o8f2oamc9v1ebgmhk8ooq0lv.apps.googleusercontent.com';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Creating...');
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Google sign-up callback
  const handleGoogleResponse = useCallback(async (response) => {
    try {
      setLoading(true);
      setLoadingMsg('Signing up with Google...');
      await googleLogin(response.credential);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Google sign-up failed');
    } finally {
      setLoading(false);
      setLoadingMsg('Creating...');
    }
  }, [googleLogin, navigate]);

  // Initialize Google Sign-In
  useEffect(() => {
    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn-signup'),
          { 
            theme: 'filled_black',
            size: 'large',
            width: '100%',
            shape: 'pill',
            text: 'signup_with',
          }
        );
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGoogle();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [handleGoogleResponse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMsg('Creating...');

    const slowTimer = setTimeout(() => {
      setLoadingMsg('Waking up server... hang tight!');
    }, 4000);

    try {
      const result = await register(formData);
      toast.success('Verification code sent to your email!');
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setLoadingMsg('Creating...');
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 flex justify-center items-center min-h-screen pt-24 pb-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-5 sm:p-8 md:p-12 w-full max-w-lg"
      >
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-black mb-2 sm:mb-3">Create Account</h2>
          <p className="text-slate-400 text-sm sm:text-base">Join thousands managing money better.</p>
        </div>

        {/* Google Sign-Up Button */}
        <div className="mb-6 flex justify-center">
          <div id="google-signin-btn-signup"></div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-slate-500 text-sm font-medium">or sign up with email</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 px-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-primary outline-none transition-colors"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                required
                className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-primary outline-none transition-colors"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 px-1">Password (Min 6 chars)</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                required
                minLength={6}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-primary outline-none transition-colors"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark py-4 rounded-2xl font-black text-lg shadow-glow transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {loadingMsg}
              </div>
            ) : (
              <><UserPlus size={20} /> Sign Up</>
            )}
          </button>
        </form>

        <p className="text-center mt-6 sm:mt-10 text-slate-400 text-sm sm:text-base">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
