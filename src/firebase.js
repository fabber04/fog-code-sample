import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const REQUIRED_ENV = {
  apiKey: 'REACT_APP_FIREBASE_API_KEY',
  authDomain: 'REACT_APP_FIREBASE_AUTH_DOMAIN',
  projectId: 'REACT_APP_FIREBASE_PROJECT_ID',
  appId: 'REACT_APP_FIREBASE_APP_ID',
};

export const isFirebaseConfigured = Object.keys(REQUIRED_ENV).every((key) =>
  Boolean(firebaseConfig[key])
);

if (!isFirebaseConfigured && process.env.NODE_ENV === 'development') {
  const missing = Object.entries(REQUIRED_ENV)
    .filter(([key]) => !firebaseConfig[key])
    .map(([, envName]) => envName);
  console.error(
    '[Firebase] Missing .env values:',
    missing.join(', '),
    '\nGet them from Firebase Console → Project settings → Your apps → Web, then restart npm start.'
  );
}

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

export default app;
