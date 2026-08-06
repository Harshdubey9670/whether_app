import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, ArrowRight, KeyRound, ShieldAlert } from 'lucide-react';
import RecoveryService from '../services/RecoveryService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, setUser } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login({ email, password });
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
  };

  const handlePasskeyLogin = async () => {
    if (!email) {
      setError('Please enter your email first to use a Passkey.');
      return;
    }
    setError('');
    try {
      const result = await RecoveryService.authenticatePasskey(email);
      if (result.verified) {
        setUser(result);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Passkey authentication failed.');
    }
  };

  const handleRecovery = async (e) => {
    e.preventDefault();
    setRecoveryError('');
    if (!recoveryEmail || !recoveryCode) return;
    setIsRecovering(true);

    try {
      const result = await RecoveryService.verifyRecoveryCode(recoveryEmail, recoveryCode);
      if (result.verified) {
        setUser(result);
        navigate('/dashboard'); // which will show ForcePasswordChangeDialog if needed
      }
    } catch (err) {
      setRecoveryError(err.response?.data?.message || 'Failed to recover account. Invalid code.');
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Decorative blur */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -ml-16 -mb-16"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Sign in to access your intelligence dashboard.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

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
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(true)}
                    className="text-xs text-primary-500 hover:text-primary-600 transition-colors"
                  >
                    Recover Account
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
                >
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <button
                  type="button"
                  onClick={handlePasskeyLogin}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm text-sm font-semibold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  <KeyRound className="w-4 h-4" />
                  Sign In with Passkey
                </button>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary-500 hover:text-primary-600 transition-colors">
                Create one now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-md p-8 rounded-3xl shadow-2xl relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Account Recovery</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Enter your email and one of your 8-character offline recovery codes to regain access to your account.
            </p>

            {recoveryError && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">
                {recoveryError}
              </div>
            )}

            <form onSubmit={handleRecovery} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    placeholder="user@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Recovery Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors uppercase tracking-widest font-mono"
                    placeholder="XXXX-XXXX"
                    maxLength={9}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(false)}
                  className="flex-1 py-3 px-4 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecovering}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {isRecovering ? 'Verifying...' : 'Recover Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
