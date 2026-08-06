import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, ArrowRight, KeyRound, Download, Check, ShieldAlert } from 'lucide-react';
import RecoveryService from '../services/RecoveryService';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // Recovery Flow State
  const [showRecoverySetup, setShowRecoverySetup] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [setupError, setSetupError] = useState('');
  const [setupSuccess, setSetupSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await register({ name, email, password });
    
    if (result.success) {
      setShowRecoverySetup(true); // Don't navigate yet, show setup
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
  };

  const handleRegisterPasskey = async () => {
    setSetupError('');
    setSetupSuccess('');
    try {
      const result = await RecoveryService.registerPasskey();
      if (result.verified) {
        setSetupSuccess('Passkey registered successfully! You can now use it to sign in.');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      setSetupError(err.response?.data?.message || 'Failed to register Passkey.');
    }
  };

  const handleGenerateCodes = async () => {
    setSetupError('');
    setSetupSuccess('');
    try {
      const result = await RecoveryService.generateRecoveryCodes();
      setRecoveryCodes(result.codes);
    } catch (err) {
      setSetupError(err.response?.data?.message || 'Failed to generate recovery codes.');
    }
  };

  const handleDownloadCodes = () => {
    const text = `WeatherVerse Recovery Codes\n\nKeep these safe. Each code can only be used once.\n\n${recoveryCodes.join('\n')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weatherverse-recovery-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Decorative blur */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -ml-16 -mb-16"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create Account</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Join WeatherVerse AI and get advanced insights.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>

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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
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

              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all mt-6"
              >
                Create Account
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-600 transition-colors">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Account Recovery Setup Modal */}
      {showRecoverySetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-lg p-8 rounded-3xl shadow-2xl relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-500">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Secure Your Account</h3>
            </div>
            
            {!recoveryCodes.length ? (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  We don't use email or SMS for password resets to protect your privacy. Please set up a recovery method now.
                </p>

                {setupError && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">
                    {setupError}
                  </div>
                )}
                
                {setupSuccess && (
                  <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl text-sm font-medium border border-green-200 dark:border-green-800">
                    {setupSuccess}
                  </div>
                )}

                <div className="space-y-4">
                  <button
                    onClick={handleRegisterPasskey}
                    className="w-full flex items-center gap-4 p-4 border border-slate-300 dark:border-slate-600 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 shrink-0">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Register Passkey (Recommended)</p>
                      <p className="text-sm text-slate-500">Use Face ID, Touch ID, or your device PIN to securely recover your account.</p>
                    </div>
                  </button>

                  <button
                    onClick={handleGenerateCodes}
                    className="w-full flex items-center gap-4 p-4 border border-slate-300 dark:border-slate-600 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Generate Offline Codes</p>
                      <p className="text-sm text-slate-500">Save 10 single-use codes to a secure location (like a password manager).</p>
                    </div>
                  </button>
                </div>

                <div className="mt-8 text-center">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    Skip for now (Not recommended)
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-4 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400">
                  ⚠️ Save these codes NOW. We will not show them again. Each code can only be used once to recover your account.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 max-h-64 overflow-y-auto">
                  {recoveryCodes.map(code => (
                    <div key={code} className="font-mono text-sm text-center font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-800 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                      {code}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadCodes}
                    className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                  >
                    <Check className="w-4 h-4" /> I saved them
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
