'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface FocusableElement {
  id: string;
  element: HTMLElement;
  section: 'spotlight';
  index?: number; // Position within section
  href?: string; // Navigation target
  onClick?: () => void;
}

interface DPadNavigationContextType {
  focusedId: string | null;
  registerElement: (element: FocusableElement) => void;
  unregisterElement: (id: string) => void;
  isDPadMode: boolean;
  setDPadMode: (enabled: boolean) => void;
}

const DPadNavigationContext = createContext<DPadNavigationContextType | null>(null);

export function DPadNavigationProvider({ children }: { children: React.ReactNode }) {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [isDPadMode, setIsDPadMode] = useState(false);
  const elementsRef = useRef<Map<string, FocusableElement>>(new Map());
  const router = useRouter();

  // Register focusable element
  const registerElement = useCallback((element: FocusableElement) => {
    elementsRef.current.set(element.id, element);

    // Auto-focus first element if none focused
    if (!focusedId && elementsRef.current.size === 1) {
      setFocusedId(element.id);
    }
  }, [focusedId]);

  // Unregister focusable element
  const unregisterElement = useCallback((id: string) => {
    elementsRef.current.delete(id);
    if (focusedId === id) {
      setFocusedId(null);
    }
  }, [focusedId]);

  // Get all elements in spotlight section
  const getSpotlightElements = useCallback(() => {
    const elements = Array.from(elementsRef.current.values());
    return elements
      .filter(el => el.section === 'spotlight')
      .sort((a, b) => (a.index || 0) - (b.index || 0));
  }, []);

  // Get current focused element
  const getFocusedElement = useCallback(() => {
    if (!focusedId) return null;
    return elementsRef.current.get(focusedId) || null;
  }, [focusedId]);

  // Navigate to element
  const focusElement = useCallback((id: string) => {
    const element = elementsRef.current.get(id);
    if (!element) return;

    setFocusedId(id);

    // Scroll element into view
    element.element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });
  }, []);

  // Navigate up/down - do nothing (spotlight is horizontal only)
  const navigateUp = useCallback(() => {
    // No vertical navigation in spotlight
  }, []);

  const navigateDown = useCallback(() => {
    // No vertical navigation in spotlight
  }, []);

  // Navigate left
  const navigateLeft = useCallback(() => {
    const current = getFocusedElement();
    if (!current) return;

    const spotlightElements = getSpotlightElements();
    const currentIndex = spotlightElements.findIndex(el => el.id === current.id);

    if (currentIndex > 0) {
      focusElement(spotlightElements[currentIndex - 1].id);
    } else {
      // Wrap to last
      focusElement(spotlightElements[spotlightElements.length - 1].id);
    }
  }, [getFocusedElement, getSpotlightElements, focusElement]);

  // Navigate right
  const navigateRight = useCallback(() => {
    const current = getFocusedElement();
    if (!current) return;

    const spotlightElements = getSpotlightElements();
    const currentIndex = spotlightElements.findIndex(el => el.id === current.id);

    if (currentIndex < spotlightElements.length - 1) {
      focusElement(spotlightElements[currentIndex + 1].id);
    } else {
      // Wrap to first
      focusElement(spotlightElements[0].id);
    }
  }, [getFocusedElement, getSpotlightElements, focusElement]);

  // Select current element
  const selectElement = useCallback(() => {
    const current = getFocusedElement();
    if (!current) return;

    if (current.onClick) {
      current.onClick();
    } else if (current.href) {
      router.push(current.href);
    }
  }, [getFocusedElement, router]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const navigationKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];
      if (!navigationKeys.includes(event.key)) return;

      event.preventDefault();
      setIsDPadMode(true);

      switch (event.key) {
        case 'ArrowUp':
          navigateUp();
          break;
        case 'ArrowDown':
          navigateDown();
          break;
        case 'ArrowLeft':
          navigateLeft();
          break;
        case 'ArrowRight':
          navigateRight();
          break;
        case 'Enter':
          selectElement();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateUp, navigateDown, navigateLeft, navigateRight, selectElement]);

  // Add visual focus indicator
  useEffect(() => {
    if (!focusedId || !isDPadMode) return;

    const element = elementsRef.current.get(focusedId);
    if (!element) return;

    // Add focus class
    element.element.classList.add('dpad-focused');
    element.element.setAttribute('data-dpad-focused', 'true');

    return () => {
      element.element.classList.remove('dpad-focused');
      element.element.removeAttribute('data-dpad-focused');
    };
  }, [focusedId, isDPadMode]);

  return (
    <DPadNavigationContext.Provider
      value={{
        focusedId,
        registerElement,
        unregisterElement,
        isDPadMode,
        setDPadMode: setIsDPadMode,
      }}
    >
      {children}

      {/* Global D-Pad Mode Indicator */}
      {isDPadMode && (
        <div className="fixed top-20 right-4 z-[9999] flex items-center gap-2 px-4 py-2 bg-accent/90 backdrop-blur-md border border-accent rounded-full text-xs font-semibold text-white shadow-lg">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          D-Pad Navigation Active
        </div>
      )}
    </DPadNavigationContext.Provider>
  );
}

export function useDPadNavigation() {
  const context = useContext(DPadNavigationContext);
  if (!context) {
    throw new Error('useDPadNavigation must be used within DPadNavigationProvider');
  }
  return context;
}
