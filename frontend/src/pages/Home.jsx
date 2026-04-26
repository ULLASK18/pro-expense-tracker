import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Wallet, TrendingUp, ShieldCheck } from 'lucide-react';

const Home = () => {
  return (
    <div className="container mx-auto px-6">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block bg-primary/10 border border-primary/20 px-4 py-2 rounded-full text-primary text-sm font-bold mb-8"
        >
          Effortless Money Management
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black mb-8 leading-tight"
        >
          Track Every Penny, <br />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Master Your Future.</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-lg max-w-2xl mb-12"
        >
          The most powerful and intuitive way to manage your expenses, analyze spending habits, and reach your financial goals faster than ever.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link to="/signup" className="bg-primary hover:bg-primary-dark px-8 py-4 rounded-2xl text-lg font-bold flex items-center gap-2 transition-all shadow-glow group">
            Get Started Free <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/about" className="glass hover:bg-white/10 px-8 py-4 rounded-2xl text-lg font-bold transition-all">
            Learn More
          </Link>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 py-20">
        {[
          { icon: Wallet, title: "Simple Tracking", desc: "Add expenses in seconds. Categorize and manage your spending effortlessly." },
          { icon: TrendingUp, title: "Deep Analytics", desc: "Beautiful charts and reports to help you understand where your money goes." },
          { icon: ShieldCheck, title: "Secure & Private", desc: "Your data is encrypted and secure. Only you have access to your finances." }
        ].map((feat, i) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 group hover:border-primary/50 transition-colors"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <feat.icon size={28} />
            </div>
            <h3 className="text-xl font-bold mb-4">{feat.title}</h3>
            <p className="text-slate-400">{feat.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
