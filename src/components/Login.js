import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import FogWordmark from './FogWordmark';
import MobilePageHeader from './mobile/MobilePageHeader';
import LegalFooterLinks from './legal/LegalFooterLinks';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, currentUser, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-white">
        <div className="text-sm text-slate-500 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (currentUser?.emailVerified) {
    return <Navigate to="/" replace />;
  }

  if (currentUser && !currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        if (result.needsVerification) {
          toast('Please verify your email. We sent a link — click it to continue.', { icon: '✉️' });
          navigate('/verify-email', { replace: true });
        } else {
          toast.success(`Welcome back, ${result.user.name || result.user.email}!`);
          navigate('/', { replace: true });
        }
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-white">
      <MobilePageHeader
        onBack={() => navigate('/')}
        backLabel="Back to home"
        showBackLabel
        alwaysVisible
      />
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] touch-pan-y px-4 py-6">
        <div className="mx-auto w-full max-w-[400px] pb-10">
        <div className="flex justify-center mb-8">
          <FogWordmark size="lg" />
        </div>

        <h1 className="text-center text-2xl font-bold text-slate-900 tracking-tight">
          Log in to your account
        </h1>

        <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/25 focus:border-[#2563eb]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/25 focus:border-[#2563eb]"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-[#2563eb] py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 space-y-4 text-center text-sm">
          <p className="text-slate-600">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-[#2563eb] hover:text-[#1d4ed8]">
              Sign up
            </Link>
          </p>
          <p>
            <button
              type="button"
              onClick={() =>
                toast('Use your church admin or reset via Firebase if email login is enabled.', {
                  icon: 'ℹ️',
                })
              }
              className="font-medium text-[#2563eb] hover:text-[#1d4ed8]"
            >
              Forgot your password?
            </button>
          </p>
          <p className="text-xs text-slate-500">
            <LegalFooterLinks className="!text-xs" />
          </p>
        </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
