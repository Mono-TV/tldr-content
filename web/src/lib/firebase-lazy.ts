/**
 * Lazy-loaded Firebase module
 *
 * This module provides lazy initialization of Firebase to reduce initial bundle size.
 * Firebase SDK is only loaded when authentication is actually needed.
 */

import type { FirebaseApp } from 'firebase/app';
import type { Auth, User, GoogleAuthProvider } from 'firebase/auth';

// Firebase instances (lazily loaded)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let isInitialized = false;
let initPromise: Promise<void> | null = null;

// Configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Check if Firebase is configured
 */
export function isFirebaseConfigured(): boolean {
  return !!firebaseConfig.apiKey;
}

/**
 * Lazily initialize Firebase SDK
 * Only loads the Firebase modules when first called
 */
export async function initializeFirebase(): Promise<{
  app: FirebaseApp | null;
  auth: Auth | null;
  googleProvider: GoogleAuthProvider | null;
}> {
  // Return cached instances if already initialized
  if (isInitialized) {
    return { app, auth, googleProvider };
  }

  // Return existing promise if initialization is in progress
  if (initPromise) {
    await initPromise;
    return { app, auth, googleProvider };
  }

  // Start initialization
  initPromise = (async () => {
    if (!isFirebaseConfigured()) {
      console.log('Firebase is not configured, skipping initialization');
      isInitialized = true;
      return;
    }

    try {
      // Dynamically import Firebase modules
      const [firebaseApp, firebaseAuth, validateConfig] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth'),
        import('./validate-config'),
      ]);

      // Validate configuration
      const validation = validateConfig.validateFirebaseConfig();
      if (!validation.valid) {
        const allowedConfig = validateConfig.getAllowedConfig();
        console.error('Firebase configuration validation failed!');
        console.error('Expected project:', allowedConfig.firebase.projectId);
        console.error('Current project:', firebaseConfig.projectId);
        console.error('Errors:', validation.errors);

        if (process.env.NODE_ENV === 'production') {
          throw new Error(
            `Invalid Firebase configuration. This app must use project: ${allowedConfig.firebase.projectId}`
          );
        }
      } else {
        console.log('Firebase configuration validated:', firebaseConfig.projectId);
      }

      // Initialize Firebase
      const { initializeApp, getApps } = firebaseApp;
      const { getAuth, GoogleAuthProvider } = firebaseAuth;

      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();

      isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      isInitialized = true; // Mark as initialized to prevent retry loops
      throw error;
    }
  })();

  await initPromise;
  return { app, auth, googleProvider };
}

/**
 * Get Firebase Auth instance (initializes if needed)
 */
export async function getFirebaseAuth(): Promise<Auth | null> {
  const { auth } = await initializeFirebase();
  return auth;
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<User | null> {
  const { auth, googleProvider } = await initializeFirebase();

  if (!auth || !googleProvider) {
    throw new Error('Firebase authentication is not configured');
  }

  const { signInWithPopup } = await import('firebase/auth');
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<User | null> {
  const { auth } = await initializeFirebase();

  if (!auth) {
    throw new Error('Firebase authentication is not configured');
  }

  const { signInWithEmailAndPassword } = await import('firebase/auth');
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string): Promise<User | null> {
  const { auth } = await initializeFirebase();

  if (!auth) {
    throw new Error('Firebase authentication is not configured');
  }

  const { createUserWithEmailAndPassword } = await import('firebase/auth');
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  const { auth } = await initializeFirebase();

  if (!auth) {
    throw new Error('Firebase authentication is not configured');
  }

  const { signOut: firebaseSignOut } = await import('firebase/auth');
  await firebaseSignOut(auth);
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  const { auth } = await initializeFirebase();

  if (!auth) {
    throw new Error('Firebase authentication is not configured');
  }

  const { sendPasswordResetEmail } = await import('firebase/auth');
  await sendPasswordResetEmail(auth, email);
}

/**
 * Subscribe to auth state changes
 */
export async function onAuthStateChange(
  callback: (user: User | null) => void
): Promise<() => void> {
  const { auth } = await initializeFirebase();

  if (!auth) {
    // If Firebase is not configured, call callback with null and return no-op unsubscribe
    callback(null);
    return () => {};
  }

  const { onAuthStateChanged } = await import('firebase/auth');
  return onAuthStateChanged(auth, callback);
}

// Export types
export type { User } from 'firebase/auth';
