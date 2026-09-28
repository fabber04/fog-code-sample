const AUTH_ERROR_MESSAGES = {
  'auth/invalid-credential': 'Incorrect email or password. Please try again.',
  'auth/wrong-password': 'Incorrect email or password. Please try again.',
  'auth/user-not-found': 'Incorrect email or password. Please try again.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Contact support for help.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/network-request-failed':
    'Network error talking to Firebase. Check your internet, then restart npm start so .env loads. If this is on the live site, rebuild with REACT_APP_FIREBASE_* env vars.',
  'auth/operation-not-allowed': 'Email sign-in is not enabled. Contact your administrator.',
  'auth/unauthorized-continue-uri':
    'This local address is not allowed for verification emails. The app will retry with Firebase’s default link.',
  'auth/invalid-continue-uri':
    'The verification return link is not valid. Retrying with Firebase’s default email link.',
  'auth/unauthorized-domain':
    'This site is not on Firebase authorized domains. Add localhost and familyofgreatness.com in Authentication → Settings.',
};

export function getFriendlyAuthError(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  if (error.code && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code];
  }
  return fallback;
}
