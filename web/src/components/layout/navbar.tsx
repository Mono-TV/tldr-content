'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, User, Heart, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/browse', label: 'Browse' },
  { href: '/movies', label: 'Movies' },
  { href: '/shows', label: 'TV Shows' },
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
          ? 'bg-background/95 backdrop-blur-md border-b border-border'
          : 'bg-gradient-to-b from-background/80 to-transparent'
      )}
    >
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gradient">TLDR</span>
          <span className="text-sm text-muted-foreground hidden sm:block">Content</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-foreground',
                pathname === link.href
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Search Button */}
          <Link
            href="/search"
            className="p-2 rounded-full hover:bg-card transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </Link>

          {/* Watchlist Button */}
          <Link
            href="/watchlist"
            className="p-2 rounded-full hover:bg-card transition-colors hidden sm:flex"
            aria-label="Watchlist"
          >
            <Heart className="w-5 h-5" />
          </Link>

          {/* Profile Button / User Avatar */}
          <div className="relative profile-dropdown">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-card animate-pulse" />
            ) : user ? (
              <>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-card transition-colors"
                  aria-label="Profile menu"
                >
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-semibold">
                      {user.displayName?.[0] || user.email?.[0] || 'U'}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-border">
                        <p className="font-medium truncate">{user.displayName || 'User'}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="p-1">
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-background rounded-md transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        <Link
                          href="/watchlist"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-background rounded-md transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                          Watchlist
                        </Link>
                        <button
                          onClick={() => {
                            signOut();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-background rounded-md transition-colors w-full text-left text-red-400"
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
                className="p-2 rounded-full hover:bg-card transition-colors"
                aria-label="Sign In"
              >
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="p-2 rounded-full hover:bg-card transition-colors md:hidden"
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
            className="md:hidden bg-background border-b border-border"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'text-lg font-medium py-2 transition-colors',
                    pathname === link.href
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/watchlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-medium py-2 text-muted-foreground flex items-center gap-2"
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
