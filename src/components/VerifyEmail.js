import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import FogWordmark from './FogWordmark';
import MobilePageHeader from './mobile/MobilePageHeader';
import LegalFooterLinks from './legal/LegalFooterLinks';

const RESEND_SECONDS = 45;

const VerifyEmail = () => {
  const {
    currentUser,
    loading,
    resendVerificationEmail,
    refreshEmailVerification,
    completeEmailLink,
    logout,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const linkHandled = useRef(false);
  const autoSendTried = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oobCode = params.get('oobCode');
    if (!oobCode || linkHandled.current) return undefined;
    linkHandled.current = true;
    void (async () => {
      setChecking(true);
      try {
        const result = await completeEmailLink(oobCode);
        if (result.success) {
          toast.success('Email verified. Welcome to FOG.');
          navigate('/', { replace: true });
        } else {
          toast.error(result.error || 'This verification link is not valid.');
        }
      } finally {
        setChecking(false);
      }
    })();
    return undefined;
  }, [completeEmailLink, location.search, navigate]);

  useEffect(() => {
    if (!currentUser || currentUser.emailVerified) return undefined;
    const poll = async () => {
      const verified = await refreshEmailVerification();
      if (verified) {
        toast.success('Email verified. Welcome to FOG.');
        navigate('/', { replace: true });
      }
    };
    const interval = setInterval(poll, 4000);
    const onFocus = () => {
      void poll();
    };
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [currentUser, navigate, refreshEmailVerification]);

  useEffect(() => {
    if (autoSendTried.current) return undefined;
    autoSendTried.current = true;
    if (location.state?.emailSent || location.search.includes('oobCode')) {
      setCooldown(RESEND_SECONDS);
      return undefined;
    }
    void (async () => {
      setResending(true);
      try {
        const result = await resendVerificationEmail();
        if (result.success) {
          setCooldown(RESEND_SECONDS);
          toast.success('We emailed you a verification link.');
        } else {
          toast.error(result.error || 'Could not send the email.');
        }
      } finally {
        setResending(false);
      }
    })();
    return undefined;
  }, [location.search, location.state?.emailSent, resendVerificationEmail]);

  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-white">
        <div className="text-sm text-slate-500 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.emailVerified) {
    return <Navigate to="/" replace />;
  }

  const handleResend = async () => {
    setResending(true);
    try {
      const result = await resendVerificationEmail();
      if (result.success) {
        setCooldown(RESEND_SECONDS);
        toast.success('New link sent. Check inbox and spam.');
      } else {
        toast.error(result.error || 'Could not resend the email.');
      }
    } finally {
      setResending(false);
    }
  };

  const handleChecked = async () => {
    setChecking(true);
    try {
      const verified = await refreshEmailVerification();
      if (verified) {
        toast.success('Email verified. Welcome to FOG.');
        navigate('/', { replace: true });
      } else {
        toast.error('Not verified yet. Open the email, click the link, then try again.');
      }
    } finally {
      setChecking(false);
    }
  };

  const goToLogin = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-white">
      <MobilePageHeader
        onBack={goToLogin}
        backLabel="Back to sign in"
        showBackLabel
        alwaysVisible
      />
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-6">
        <div className="mx-auto w-full max-w-[420px] pb-10">
          <div className="mb-8 flex justify-center">
            <FogWordmark size="lg" />
          </div>

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <Mail className="h-7 w-7 text-[#2563eb]" aria-hidden />
          </div>

          <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900">
            Verify your email
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
            We sent a link to{' '}
            <span className="font-medium text-slate-900">{currentUser.email}</span>.
            Open that email and click the link to finish signing up.
          </p>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={handleChecked}
              disabled={checking}
              className="w-full rounded-full bg-[#2563eb] py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {checking ? 'Checking…' : "I've clicked the link"}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="w-full rounded-full border border-slate-200 bg-white py-3 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resending
                ? 'Sending…'
                : cooldown > 0
                  ? `Resend email in ${cooldown}s`
                  : 'Resend email'}
            </button>
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
            Check spam if it is not in your inbox. The sender is usually Firebase
            (noreply@your-firebase-project.firebaseapp.com). After you click the link, come back here
            or tap the button above.
          </p>

          <p className="mt-8 text-center text-sm text-slate-600">
            Wrong email?{' '}
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/register', { replace: true });
              }}
              className="font-medium text-[#2563eb] hover:text-[#1d4ed8]"
            >
              Use a different address
            </button>
          </p>
          <p className="mt-3 text-center text-sm">
            <button
              type="button"
              onClick={goToLogin}
              className="font-medium text-[#2563eb] hover:text-[#1d4ed8]"
            >
              Back to sign in
            </button>
          </p>
          <div className="mt-6 flex justify-center">
            <LegalFooterLinks className="!text-xs" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyEmail;
