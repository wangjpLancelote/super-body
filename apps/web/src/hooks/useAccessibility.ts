'use client';

import { useState, useEffect } from 'react';

export function useAccessibility() {
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    // Check for user's reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(prefersReducedMotion);

    // Check for high contrast mode
    const checkHighContrast = () => {
      // This is a simplified check - you might want to implement a more sophisticated one
      const hasHighContrast = document.documentElement.classList.contains('high-contrast');
      setHighContrast(hasHighContrast);
    };

    // Listen for keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab key pressed
      if (e.key === 'Tab') {
        setIsKeyboardMode(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardMode(false);
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('change', checkHighContrast);

    // Initial check
    checkHighContrast();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('change', checkHighContrast);
    };
  }, []);

  return {
    isKeyboardMode,
    reducedMotion,
    highContrast,
  };
}

// Accessibility utilities
export const accessibilityUtils = {
  // Announce screen reader changes
  announceToScreenReader: (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Focus trap for modals
  createFocusTrap: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  },

  // Skip to content link for keyboard users
  SkipToContentLink: ({ href = '#main-content' }: { href?: string }) => {
    return (
      <a
        href={href}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        跳转到主要内容
      </a>
    );
  },

  // Reduced motion classes
  reduceMotion: reducedMotion => reducedMotion ? 'transition-none' : 'transition-all duration-200',

  // High contrast classes
  highContrastClasses: highContrast ?
    'border-2 border-black bg-white text-black' :
    'border border-gray-200 bg-white text-gray-900',
};