'use client';

import { useState } from 'react';
import Image from 'next/image';
import { User, LogOut, Mail, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function ProfilePage() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, resetPassword, error, clearError } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch {
      // Error is handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      alert('Please enter your email address first');
      return;
    }
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch {
      // Error handled by context
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Logged in view
  if (user) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Profile Header */}
            <div className="bg-card rounded-xl p-6 mb-6">
              <div className="flex items-center gap-4">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl font-bold">
                    {user.displayName?.[0] || user.email?.[0] || 'U'}
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold">{user.displayName || 'User'}</h1>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-card rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Account Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Email</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="capitalize">{user.providerData[0]?.providerId?.replace('.com', '') || 'Email'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Account Created</span>
                  <span>{user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Last Sign In</span>
                  <span>{user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg font-semibold hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sign in view
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center py-12">
          {/* Profile Icon */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-card flex items-center justify-center">
            <User className="w-12 h-12 text-muted-foreground" />
          </div>

          <h1 className="text-2xl font-semibold mb-3">
            {isSignUp ? 'Create Account' : 'Sign in to TLDR Content'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isSignUp
              ? 'Create an account to save your watchlist and get personalized recommendations.'
              : 'Sign in to save your watchlist, rate movies, and get personalized recommendations.'}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-left">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-400">{error}</p>
                <button onClick={clearError} className="text-xs text-muted-foreground hover:text-foreground mt-1">
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Reset Password Success */}
          {resetSent && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-left">
              <p className="text-sm text-green-400">Password reset email sent! Check your inbox.</p>
            </div>
          )}

          {/* Sign In Buttons */}
          <div className="space-y-4">
            <button
              onClick={signInWithGoogle}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Mail className="w-5 h-5" />
                )}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            {/* Toggle Sign Up / Sign In */}
            <div className="flex flex-col gap-2 text-sm">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  clearError();
                }}
                className="text-primary hover:underline"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
              {!isSignUp && (
                <button
                  onClick={handlePasswordReset}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Forgot password?
                </button>
              )}
            </div>
          </div>

          <p className="mt-8 text-xs text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
