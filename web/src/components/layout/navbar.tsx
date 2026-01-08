'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, User, Heart, LogOut, ChevronDown } from 'lucide-react';
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
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-background/80 backdrop-blur-md'
          : 'bg-transparent'
      )}
    >
      <nav className="w-full max-w-[1920px] mx-auto px-16 h-20 flex items-center">
        {/* Left Side - Profile (20% width) */}
        <div className="w-[20%] flex justify-start">
          <div className="relative profile-dropdown">
          {loading ? (
            <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
          ) : user ? (
            <>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-md border border-white/20 shadow-lg hover:shadow-xl"
                aria-label="Profile menu"
              >
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    width={28}
                    height={28}
                    className="rounded-full ring-2 ring-white/20"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/80 to-yellow-500/80 flex items-center justify-center text-sm font-semibold text-black">
                    {user.displayName?.[0] || user.email?.[0] || 'U'}
                  </div>
                )}
                <ChevronDown className={cn(
                  "w-4 h-4 text-white/60 transition-transform duration-300",
                  isProfileDropdownOpen && "rotate-180"
                )} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute left-0 mt-2 w-56 bg-black/80 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-white/10">
                      <p className="font-medium truncate text-white">{user.displayName || 'User'}</p>
                      <p className="text-sm text-white/60 truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        href="/watchlist"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        Watchlist
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/10 rounded-xl transition-colors w-full text-left"
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
              className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-md border border-white/20 shadow-lg hover:shadow-xl"
              aria-label="Sign In"
            >
              <User className="w-5 h-5 text-white/90" />
              <ChevronDown className="w-4 h-4 text-white/60" />
            </Link>
          )}
          </div>
        </div>

        {/* Center - Search + Navigation Pills (60% width) */}
        <div className="w-[60%] hidden md:flex items-center justify-center gap-3">
          {/* Search Button - Light frosted glass */}
          <Link
            href="/search"
            className="w-16 h-16 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-xl hover:scale-105"
            aria-label="Search"
          >
            <Search className="w-6 h-6 text-white/60" />
          </Link>

          {/* Navigation Pills - Light container matching Figma */}
          <div
            className="flex items-center bg-stone-300/90 backdrop-blur-xl rounded-full px-4 py-2 shadow-lg"
            style={{ fontFamily: 'var(--font-red-hat-display), sans-serif' }}
          >
            <div className="flex items-center gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href ||
                  (link.href !== '/' && pathname?.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-8 py-4 rounded-full text-xl transition-all duration-300 whitespace-nowrap tracking-wide',
                      isActive
                        ? 'bg-stone-500/50 text-stone-900 font-bold'
                        : 'text-stone-600 font-semibold hover:text-stone-900 hover:bg-stone-400/30'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side - Logo + Mobile Menu (20% width) */}
        <div className="w-[20%] flex items-center justify-end gap-4">
          {/* Mobile Menu Button */}
          <button
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-md border border-white/20 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-white/90" />
            ) : (
              <Menu className="w-5 h-5 text-white/90" />
            )}
          </button>

          {/* Logo with Gold Gradient */}
          <Link href="/" className="flex items-center">
            <span
              className="text-[32px] font-bold tracking-wide"
              style={{
                fontFamily: 'var(--font-gia-variable), serif',
                background: 'linear-gradient(135deg, #D4AF37 0%, #F4E4BA 25%, #D4AF37 50%, #B8860B 75%, #D4AF37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              TLDR
            </span>
          </Link>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden bg-stone-200/95 backdrop-blur-2xl border-t border-stone-300"
          >
            <div className="w-full mx-auto px-4 py-4 flex flex-col gap-1.5">
              {/* Mobile Search */}
              <Link
                href="/search"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-base font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-300/50 rounded-xl transition-all duration-300"
              >
                <Search className="w-5 h-5" />
                Search
              </Link>

              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'px-4 py-3 text-base font-semibold rounded-xl transition-all duration-300',
                      isActive
                        ? 'bg-stone-500/50 text-stone-900 font-bold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-300/50'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <Link
                href="/watchlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-base font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-300/50 rounded-xl transition-all duration-300"
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
