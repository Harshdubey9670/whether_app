import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await register({ name, email, password });
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
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
    </div>
  );
};

export default Register;
