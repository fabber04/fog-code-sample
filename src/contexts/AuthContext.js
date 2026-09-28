import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  applyActionCode,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase';
import { getFriendlyAuthError } from '../utils/firebaseAuthErrors';
import { syncFirebaseUser, ensureLegacyBackendSession } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function isLocalHost() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

async function sendVerificationToUser(user) {
  if (!user) {
    throw new Error('Not signed in.');
  }
  // Local continue URLs are often rejected by Firebase. Use the default action page locally.
  if (isLocalHost()) {
    await sendEmailVerification(user);
    return;
  }
  try {
    await sendEmailVerification(user, {
      url: `${window.location.origin}/verify-email`,
      handleCodeInApp: false,
    });
  } catch (error) {
    if (
      error?.code === 'auth/unauthorized-continue-uri' ||
      error?.code === 'auth/invalid-continue-uri' ||
      error?.code === 'auth/unauthorized-domain'
    ) {
      await sendEmailVerification(user);
      return;
    }
    throw error;
  }
}

function mapAuthUser(user, profile = {}) {
  const { emailVerified: profileVerified, ...rest } = profile;
  return {
    uid: user.uid,
    email: user.email,
    emailVerified: Boolean(user.emailVerified) || Boolean(profileVerified),
    ...rest,
  };
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  const syncProfileToPostgres = (userData = {}) => {
    void syncFirebaseUser({
      full_name: userData.name || userData.fullName,
      phone: userData.phone,
      grade: userData.grade,
      location: userData.location,
      role: userData.role,
    });
  };

  const loadProfile = async (user) => {
    if (!user) {
      setCurrentUser(null);
      return null;
    }
    let profile = {};
    if (db) {
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      profile = docSnap.exists() ? docSnap.data() : {};
    }
    const mapped = mapAuthUser(user, profile);
    setCurrentUser(mapped);
    if (mapped.emailVerified) {
      syncProfileToPostgres({ ...profile, email: user.email });
    }
    return mapped;
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        await loadProfile(user);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const register = async (email, password, fullName, additionalData = {}) => {
    if (!auth || !db) {
      return { success: false, error: 'Firebase is not configured. Check your .env file and restart the dev server.' };
    }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', result.user.uid), {
        name: fullName,
        email,
        role: 'member',
        createdAt: new Date(),
        ...additionalData,
      });
      let emailSent = false;
      try {
        await sendVerificationToUser(result.user);
        emailSent = true;
      } catch (verifyErr) {
        console.error('Verification email failed to send:', verifyErr);
        return {
          success: true,
          needsVerification: true,
          emailSent: false,
          error: verifyErr.message || 'Account created, but we could not send the email. Use Resend on the next screen.',
          user: { name: fullName, email, emailVerified: false },
        };
      }
      return {
        success: true,
        needsVerification: true,
        emailSent,
        user: { name: fullName, email, emailVerified: false },
      };
    } catch (error) {
      if (error?.code === 'auth/email-already-in-use') {
        try {
          const existing = await signInWithEmailAndPassword(auth, email, password);
          if (!existing.user.emailVerified) {
            try {
              await sendVerificationToUser(existing.user);
            } catch (resendErr) {
              console.warn('Could not resend verification to existing account:', resendErr);
            }
            return {
              success: true,
              needsVerification: true,
              emailSent: true,
              user: { name: fullName, email, emailVerified: false },
            };
          }
        } catch {
          // Wrong password for an existing account
        }
      }
      return { success: false, error: getFriendlyAuthError(error, 'Registration failed. Please try again.') };
    }
  };

  const login = async (email, password) => {
    if (!auth) {
      return { success: false, error: 'Firebase is not configured. Check your .env file and restart the dev server.' };
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      let userData = {};
      if (db) {
        const docRef = doc(db, 'users', result.user.uid);
        const docSnap = await getDoc(docRef);
        userData = docSnap.exists() ? docSnap.data() : {};
      }
      const mapped = mapAuthUser(result.user, userData);
      if (mapped.emailVerified) {
        syncProfileToPostgres({ ...userData, email });
        void ensureLegacyBackendSession({
          email,
          password,
          fullName: userData.name || userData.fullName,
        });
      }
      return {
        success: true,
        needsVerification: !mapped.emailVerified,
        user: mapped,
      };
    } catch (error) {
      return { success: false, error: getFriendlyAuthError(error, 'Sign in failed. Please try again.') };
    }
  };

  const resendVerificationEmail = async () => {
    if (!auth?.currentUser) {
      return { success: false, error: 'Sign in first, then we can resend the email.' };
    }
    try {
      await sendVerificationToUser(auth.currentUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getFriendlyAuthError(error, 'Could not send the email. Please wait and try again.'),
      };
    }
  };

  const refreshEmailVerification = async () => {
    if (!auth?.currentUser) return false;
    await auth.currentUser.reload();
    const mapped = await loadProfile(auth.currentUser);
    return Boolean(mapped?.emailVerified);
  };

  const completeEmailLink = async (oobCode) => {
    if (!auth || !oobCode) {
      return { success: false, error: 'This verification link is missing a code.' };
    }
    try {
      await applyActionCode(auth, oobCode);
      if (auth.currentUser) {
        await auth.currentUser.reload();
        await loadProfile(auth.currentUser);
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getFriendlyAuthError(error, 'This verification link is invalid or has expired. Request a new one.'),
      };
    }
  };

  const logout = async () => {
    if (auth) await signOut(auth);
    setCurrentUser(null);
  };

  const isAdmin = () => currentUser?.role === 'admin';

  const value = {
    currentUser,
    login,
    register,
    logout,
    resendVerificationEmail,
    refreshEmailVerification,
    completeEmailLink,
    isAdmin,
    loading,
    isFirebaseAvailable: isFirebaseConfigured,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
