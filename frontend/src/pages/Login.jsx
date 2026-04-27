import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = '776030954621-ei2ffum5o8f2oamc9v1ebgmhk8ooq0lv.apps.googleusercontent.com';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Logging in...');
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Google sign-in callback
  const handleGoogleResponse = useCallback(async (response) => {
    try {
      setLoading(true);
      setLoadingMsg('Signing in with Google...');
      await googleLogin(response.credential);
      toast.success('Welcome!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Google sign-in failed');
    } finally {
      setLoading(false);
      setLoadingMsg('Logging in...');
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
          document.getElementById('google-signin-btn-login'),
          { 
            theme: 'filled_black',
            size: 'large',
            width: '100%',
            shape: 'pill',
            text: 'signin_with',
          }
        );
      }
    };

    // Try immediately, or wait for script to load
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
    setLoadingMsg('Logging in...');

    // Show slow server message after 4 seconds
    const slowTimer = setTimeout(() => {
      setLoadingMsg('Waking up server... hang tight!');
    }, 4000);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.needsVerification) {
        toast.info('Please verify your email first');
        navigate('/verify-otp', { state: { email: errorData.email } });
      } else {
        toast.error(errorData?.error || 'Login failed');
      }
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setLoadingMsg('Logging in...');
    }
  };

  return (
    <div className="container mx-auto px-6 flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 md:p-12 w-full max-w-lg"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black mb-3">Welcome Back</h2>
          <p className="text-slate-400">Manage your money like a pro.</p>
        </div>

        {/* Google Sign-In Button */}
        <div className="mb-6">
          <div id="google-signin-btn-login" className="flex justify-center [&>div]:!w-full"></div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-slate-500 text-sm font-medium">or continue with email</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                required
                className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-primary outline-none transition-colors"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                required
                className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-primary outline-none transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              <><LogIn size={20} /> Login</>
            )}
          </button>
        </form>

        <p className="text-center mt-10 text-slate-400">
          Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
