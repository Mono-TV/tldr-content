import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { validateFirebaseConfig, getAllowedConfig } from './validate-config';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase config is available (not during static build)
const isFirebaseConfigured = !!firebaseConfig.apiKey;

// Validate Firebase configuration at runtime
if (isFirebaseConfigured) {
  const validation = validateFirebaseConfig();

  if (!validation.valid) {
    const allowedConfig = getAllowedConfig();
    console.error('❌ Firebase configuration validation failed!');
    console.error('Expected project:', allowedConfig.firebase.projectId);
    console.error('Current project:', firebaseConfig.projectId);
    console.error('Errors:', validation.errors);

    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `Invalid Firebase configuration. This app must use project: ${allowedConfig.firebase.projectId}`
      );
    }
  } else {
    console.log('✅ Firebase configuration validated:', firebaseConfig.projectId);
  }
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
}

export { app, auth, googleProvider };
