import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Lock } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md p-6 overflow-hidden bg-white shadow-2xl rounded-2xl dark:bg-slate-800"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center text-center mt-4">
            <div className="w-16 h-16 mb-4 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
              <Lock size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Create your account
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-8 px-4">
              Sign up to unlock all features like interacting with the community, saving places, and writing journal entries.
            </p>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={() => {
                  onClose();
                  navigate('/register');
                }}
                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
              >
                Create Account
              </button>
              
              <button
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-xl transition-colors"
              >
                Login
              </button>
              
              <button
                onClick={onClose}
                className="mt-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
