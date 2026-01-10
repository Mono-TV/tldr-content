'use client';

import { useEffect, useCallback, useRef } from 'react';

interface NavigationOptions {
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onSelect?: () => void;
  onBack?: () => void;
  enabled?: boolean;
}

/**
 * D-Pad Navigation Hook for TV-like controls
 *
 * Provides arrow key navigation similar to TV remote controls
 *
 * @param options Navigation callbacks and settings
 *
 * @example
 * useDPadNavigation({
 *   onNavigate: (direction) => console.log('Navigate:', direction),
 *   onSelect: () => console.log('Select pressed'),
 *   enabled: true
 * });
 */
export function useDPadNavigation(options: NavigationOptions = {}) {
  const { onNavigate, onSelect, onBack, enabled = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Prevent default behavior for navigation keys
      const navigationKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', 'Backspace'];

      if (navigationKeys.includes(event.key)) {
        event.preventDefault();
      }

      switch (event.key) {
        case 'ArrowUp':
          onNavigate?.('up');
          break;
        case 'ArrowDown':
          onNavigate?.('down');
          break;
        case 'ArrowLeft':
          onNavigate?.('left');
          break;
        case 'ArrowRight':
          onNavigate?.('right');
          break;
        case 'Enter':
          onSelect?.();
          break;
        case 'Escape':
        case 'Backspace':
          onBack?.();
          break;
      }
    },
    [enabled, onNavigate, onSelect, onBack]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);
}

/**
 * Focus Management for D-Pad Navigation
 * Manages focus state and provides utilities for focusable elements
 */
export class FocusManager {
  private static instance: FocusManager;
  private focusedElement: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];

  private constructor() {}

  static getInstance(): FocusManager {
    if (!FocusManager.instance) {
      FocusManager.instance = new FocusManager();
    }
    return FocusManager.instance;
  }

  setFocusedElement(element: HTMLElement | null) {
    // Remove focus class from previous element
    if (this.focusedElement) {
      this.focusedElement.classList.remove('dpad-focused');
      this.focusedElement.setAttribute('data-focused', 'false');
    }

    this.focusedElement = element;

    // Add focus class to new element
    if (element) {
      element.classList.add('dpad-focused');
      element.setAttribute('data-focused', 'true');
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }

  getFocusedElement(): HTMLElement | null {
    return this.focusedElement;
  }

  registerFocusableElements(elements: HTMLElement[]) {
    this.focusableElements = elements;
  }

  getFocusableElements(): HTMLElement[] {
    return this.focusableElements;
  }

  focusFirst() {
    if (this.focusableElements.length > 0) {
      this.setFocusedElement(this.focusableElements[0]);
    }
  }

  focusNext() {
    if (!this.focusedElement || this.focusableElements.length === 0) {
      this.focusFirst();
      return;
    }

    const currentIndex = this.focusableElements.indexOf(this.focusedElement);
    const nextIndex = (currentIndex + 1) % this.focusableElements.length;
    this.setFocusedElement(this.focusableElements[nextIndex]);
  }

  focusPrevious() {
    if (!this.focusedElement || this.focusableElements.length === 0) {
      this.focusFirst();
      return;
    }

    const currentIndex = this.focusableElements.indexOf(this.focusedElement);
    const prevIndex = currentIndex === 0 ? this.focusableElements.length - 1 : currentIndex - 1;
    this.setFocusedElement(this.focusableElements[prevIndex]);
  }

  clearFocus() {
    this.setFocusedElement(null);
  }

  reset() {
    this.clearFocus();
    this.focusableElements = [];
  }
}
