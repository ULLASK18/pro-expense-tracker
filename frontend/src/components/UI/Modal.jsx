import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const Modal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative glass-card p-8 w-full max-w-md shadow-2xl border-white/20 bg-dark-lighter/50"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6">
              <AlertTriangle size={32} />
            </div>

            <h3 className="text-2xl font-black mb-3 text-white">{title}</h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              {message}
            </p>

            <div className="flex gap-4 w-full">
              <button
                onClick={onClose}
                className="flex-1 glass hover:bg-white/10 py-3 rounded-2xl font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 bg-secondary hover:bg-secondary/90 py-3 rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)]"
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;
