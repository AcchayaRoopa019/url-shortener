import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link2, Mail, Lock, ArrowRight, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Please fill in all fields');
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="relative min-h-screen bg-dark-950 flex flex-col justify-center items-center px-4 overflow-hidden">
      {/* Decorative Glow Backgrounds */}
      <div class="glow-bg w-[500px] h-[500px] rounded-full bg-brand-500/20 top-[-10%] left-[-10%]"></div>
      <div class="glow-bg w-[600px] h-[600px] rounded-full bg-indigo-500/10 bottom-[-20%] right-[-10%]"></div>

      <div class="relative w-full max-w-md z-10">
        {/* Brand Header */}
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 mb-3 shadow-lg shadow-brand-500/5">
            <Link2 class="w-8 h-8 text-brand-500 animate-pulse" />
          </div>
          <h1 class="text-3xl font-extrabold tracking-tight text-white font-sans sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-400">
            Welcome back
          </h1>
          <p class="mt-2 text-sm text-dark-500">
            Sign in to manage and monitor your short URLs
          </p>
        </div>

        {/* Auth Card */}
        <div class="glass-panel rounded-2xl p-8 shadow-2xl border border-gray-800/80">
          <form onSubmit={handleSubmit} class="space-y-6">
            <div>
              <label htmlFor="email" class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Mail class="h-5 w-5" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  class="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl bg-dark-900/60 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition duration-200 text-sm"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock class="h-5 w-5" />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  class="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl bg-dark-900/60 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition duration-200 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              class="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-950 focus:ring-brand-500 transition duration-300 shadow-lg shadow-brand-500/10 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isLoading ? (
                <Loader class="animate-spin h-5 w-5 text-white" />
              ) : (
                <>
                  Sign In
                  <ArrowRight class="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div class="mt-6 text-center text-sm">
            <span class="text-gray-400">Don't have an account? </span>
            <Link to="/register" class="font-medium text-brand-400 hover:text-brand-300 transition duration-200">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
