import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import FogWordmark from './FogWordmark';
import MobilePageHeader from './mobile/MobilePageHeader';
import LegalFooterLinks from './legal/LegalFooterLinks';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    grade: 'College'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, currentUser, loading } = useAuth();
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (!acceptedLegal) {
      toast.error('Please accept the Terms of Service and Privacy Policy');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.fullName,
        {
          phone: formData.phone,
          grade: formData.grade
        }
      );
      
      if (result.success) {
        if (result.emailSent === false) {
          toast.error(result.error || 'Account created, but the email did not send. Use Resend.');
        } else {
          toast.success('We emailed you a verification link. Click it to continue.');
        }
        navigate('/verify-email', {
          replace: true,
          state: { emailSent: result.emailSent !== false },
        });
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const labelClass = 'mb-1 block text-xs font-medium text-slate-600 sm:text-sm';
  const inputClass =
    'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/25 focus:border-[#2563eb]';

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-white">
      <MobilePageHeader
        onBack={() => navigate('/')}
        backLabel="Back to home"
        showBackLabel
        alwaysVisible
      />
      <main className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] touch-pan-y px-4 py-3 sm:py-4">
        <div className="mx-auto w-full max-w-[480px]">
          <div className="mb-3 flex justify-center sm:mb-4">
            <FogWordmark size="md" />
          </div>
          <h1 className="text-center text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Create your account
          </h1>
          <p className="mt-1 text-center text-xs text-slate-500 sm:text-sm">
            Join the Family of Greatness community. We will email you a verification link.
          </p>

          <form
            className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3"
            onSubmit={handleSubmit}
          >
            <div className="sm:col-span-1">
              <label htmlFor="fullName" className={labelClass}>
                Full name
              </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Your name"
            />
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="phone" className={labelClass}>
              Phone <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className={inputClass}
              placeholder="+263 77 123 4567"
            />
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="grade" className={labelClass}>
              Grade / level
            </label>
            <select
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              className={`${inputClass} bg-white`}
            >
              <option>9th Grade</option>
              <option>10th Grade</option>
              <option>11th Grade</option>
              <option>12th Grade</option>
              <option>College</option>
              <option>University</option>
              <option>Working Professional</option>
            </select>
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`${inputClass} pr-10`}
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="confirmPassword" className={labelClass}>
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`${inputClass} pr-10`}
                placeholder="Repeat password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <label className="sm:col-span-2 flex cursor-pointer items-start gap-2.5 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-3">
            <input
              type="checkbox"
              checked={acceptedLegal}
              onChange={(e) => setAcceptedLegal(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-[#2563eb] focus:ring-[#2563eb]"
            />
            <span className="text-xs leading-relaxed text-slate-600 sm:text-sm">
              I agree to the{' '}
              <Link to="/terms" className="font-medium text-[#2563eb] hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="font-medium text-[#2563eb] hover:underline">
                Privacy Policy
              </Link>
              . If I am under 18, my parent or guardian has consented on my behalf, as required by
              Zimbabwe&apos;s Cyber and Data Protection Act.
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading || !acceptedLegal}
            className="sm:col-span-2 mt-1 w-full rounded-full bg-[#2563eb] py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

          <p className="mt-4 text-center text-xs text-slate-600 sm:mt-5 sm:text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#2563eb] hover:text-[#1d4ed8]">
              Sign in
            </Link>
          </p>
          <div className="mt-4 flex justify-center sm:mt-5">
            <LegalFooterLinks />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;

