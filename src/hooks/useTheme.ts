'use client';

import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export function useTheme() {
  // Use state with initial 'system' mode - don't access window here
  const [mode, setMode] = useState<ThemeMode>('system');
  const [mounted, setMounted] = useState(false);
  // For tracking the actual applied theme (derived from system if needed)
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Helper function to check system preference - only call inside useEffect
  const getSystemPreference = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light'; // Default for SSR
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Apply theme based on current mode
  const applyTheme = (newMode: ThemeMode) => {
    if (!mounted || typeof document === 'undefined') return;

    let effectiveTheme: 'light' | 'dark';
    
    if (newMode === 'system') {
      effectiveTheme = getSystemPreference();
    } else {
      effectiveTheme = newMode;
    }

    // Update state
    setActualTheme(effectiveTheme);

    // Apply the appropriate class to document
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Store the user's preference
    localStorage.setItem('theme', newMode);
  };

  // Initialize based on saved preference
  useEffect(() => {
    setMounted(true);
    
    // Check for saved preference
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    if (savedTheme) {
      setMode(savedTheme);
    }

    // Initial calculation of actual theme
    if (mode === 'system') {
      setActualTheme(getSystemPreference());
    } else {
      setActualTheme(mode);
    }
  }, []);

  // Listen for changes in system preference when in system mode
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Apply theme based on current mode
    applyTheme(mode);

    // Add listener for system preference changes
    const handleChange = () => {
      if (mode === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode, mounted]);

  // Apply theme whenever mode changes
  useEffect(() => {
    applyTheme(mode);
  }, [mode, mounted]);

  return { 
    mode, 
    setMode,
    actualTheme,
    isDark: actualTheme === 'dark'
  };
}