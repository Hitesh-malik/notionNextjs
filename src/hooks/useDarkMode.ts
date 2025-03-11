'use client';

import { useState, useEffect } from "react";

export function useDarkMode(initialState?: boolean) {
  // Initialize with a default false value
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Run only on client side
  useEffect(() => {
    // Check for initial value or system preference
    let initialDarkMode: boolean;
    
    if (initialState !== undefined) {
      initialDarkMode = initialState;
    } else {
      // Check system preference
      initialDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Set the initial state
    setDarkMode(initialDarkMode);
    
    // Apply the initial class
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Log the initial state for debugging
    console.log("Initial dark mode state:", initialDarkMode);
  }, [initialState]);

  // Update document class whenever dark mode changes
  useEffect(() => {
    console.log("Dark mode changed to:", darkMode);
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
      console.log("Added 'dark' class to documentElement");
    } else {
      document.documentElement.classList.remove('dark');
      console.log("Removed 'dark' class from documentElement");
    }
  }, [darkMode]);

  // Toggle handler
  const toggleDarkMode = () => {
    console.log("Toggle dark mode called, current mode:", darkMode);
    setDarkMode(prev => !prev);
  };

  return { darkMode, toggleDarkMode };
}