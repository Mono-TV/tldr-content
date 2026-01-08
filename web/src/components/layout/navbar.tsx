'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, User, Heart, LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/movies', label: 'Movies' },
  { href: '/shows', label: 'Shows' },
  { href: '/sports', label: 'Sports' },
  { href: '/music', label: 'Music' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-black/60 backdrop-blur-xl'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
      )}
    >
      {/* Center - Navigation Pill (Grid centered for perfect alignment) */}
      <div className="hidden md:grid place-items-center absolute inset-0 pointer-events-none z-10">
        <div
          className="flex items-center gap-12 px-8 py-1.5 rounded-full border border-white/20 pointer-events-auto"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Search Icon */}
          <Link
            href="/search"
            className="text-white/50 hover:text-white transition-all duration-300"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </Link>

          {navLinks.map((link) => {
            const isActive = pathname === link.href ||
              (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative py-2 group"
              >
                <span
                  className={cn(
                    'text-lg tracking-wide transition-all duration-300',
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-white/50 font-medium group-hover:text-white'
                  )}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <nav className="w-full px-12 lg:px-16 h-20 flex items-center justify-between relative">
        {/* Left - Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center group">
            <span
              className="text-[28px] font-bold tracking-wide transition-all duration-300 group-hover:opacity-80"
              style={{
                fontFamily: 'var(--font-gia-variable), serif',
                background: 'linear-gradient(135deg, #D4AF37 0%, #F4E4BA 30%, #D4AF37 60%, #B8860B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              TLDR
            </span>
          </Link>
        </div>

        {/* Right - Profile */}
        <div className="flex items-center gap-2">
          {/* Profile */}
          <div className="relative profile-dropdown">
            {loading ? (
              <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />
            ) : user ? (
              <>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center justify-center w-9 h-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-white/30 transition-all duration-300"
                  aria-label="Profile menu"
                >
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-semibold text-white">
                      {user.displayName?.[0] || user.email?.[0] || 'U'}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 mt-3 w-64 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      {/* User Info */}
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          {user.photoURL ? (
                            <Image
                              src={user.photoURL}
                              alt={user.displayName || 'User'}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-base font-semibold text-white">
                              {user.displayName?.[0] || user.email?.[0] || 'U'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{user.displayName || 'User'}</p>
                            <p className="text-sm text-white/50 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        <Link
                          href="/watchlist"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                          Watchlist
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>

                        <div className="my-2 border-t border-white/10" />

                        <button
                          onClick={() => {
                            signOut();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 rounded-lg transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link
                href="/profile"
                className="p-2.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300"
                aria-label="Sign In"
              >
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="p-2.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/5"
          >
            <div className="px-6 py-6 flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'px-4 py-3 text-lg rounded-lg transition-all duration-200',
                      isActive
                        ? 'text-white font-semibold bg-white/5'
                        : 'text-white/60 font-medium hover:text-white hover:bg-white/5'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="my-3 border-t border-white/10" />

              <Link
                href="/search"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-lg text-white/60 font-medium hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
              >
                <Search className="w-5 h-5" />
                Search
              </Link>

              <Link
                href="/watchlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-lg text-white/60 font-medium hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
              >
                <Heart className="w-5 h-5" />
                Watchlist
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
