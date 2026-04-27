import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const { verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (value && index === 5) {
      const code = newOtp.join('');
      if (code.length === 6) {
        handleVerify(code);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code) => {
    if (loading) return;
    setLoading(true);
    try {
      await verifyOTP(email, code);
      toast.success('Email verified! Welcome aboard!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resending) return;
    setResending(true);
    try {
      await resendOTP(email);
      toast.success('New code sent to your email!');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="container mx-auto px-6 flex justify-center items-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 md:p-12 w-full max-w-lg"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-black mb-3">Verify Your Email</h2>
          <p className="text-slate-400">
            We sent a 6-digit code to{' '}
            <span className="text-primary font-bold">{email}</span>
          </p>
        </div>

        {/* OTP Input Boxes */}
        <div className="flex justify-center gap-3 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold bg-slate-900 border-2 border-white/10 rounded-xl focus:border-primary outline-none transition-all"
              disabled={loading}
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={() => handleVerify(otp.join(''))}
          disabled={loading || otp.join('').length !== 6}
          className="w-full bg-primary hover:bg-primary-dark py-4 rounded-2xl font-black text-lg shadow-glow transition-all flex justify-center items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Verifying...
            </div>
          ) : (
            <>
              <ShieldCheck size={20} />
              Verify Email
            </>
          )}
        </button>

        {/* Resend */}
        <div className="text-center mt-8">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-primary font-bold hover:underline flex items-center justify-center gap-2 mx-auto"
            >
              <RotateCcw size={16} className={resending ? 'animate-spin' : ''} />
              {resending ? 'Sending...' : 'Resend Code'}
            </button>
          ) : (
            <p className="text-slate-500 text-sm">
              Resend code in <span className="text-primary font-bold">{countdown}s</span>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
