import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call for password reset
    setSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Decorative blur */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -ml-16 -mb-16"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Reset Password</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {submitted ? (
              <div className="text-center space-y-6">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-800">
                  If an account exists for {email}, you will receive a password reset email shortly.
                </div>
                <Link to="/login" className="inline-flex items-center gap-2 font-semibold text-sky-500 hover:text-sky-600 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all"
                >
                  Send Reset Link
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {!submitted && (
              <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
                Remember your password?{' '}
                <Link to="/login" className="font-semibold text-sky-500 hover:text-sky-600 transition-colors">
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
