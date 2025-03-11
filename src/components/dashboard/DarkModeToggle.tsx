'use client';

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface DarkModeToggleProps {
  initialMode?: 'light' | 'dark' | 'system';
}

export function DarkModeToggle({ initialMode = 'system' }: DarkModeToggleProps) {
  const { mode, setMode } = useTheme();
  
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setMode('light')}
        className={`p-1 rounded-md transition-colors ${
          mode === 'light' 
            ? 'bg-slate-200 text-amber-500' 
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
        }`}
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      
      <button
        onClick={() => setMode('system')}
        className={`p-1 rounded-md transition-colors ${
          mode === 'system' 
            ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100' 
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
        }`}
        aria-label="System preference"
      >
        <Monitor className="h-4 w-4" />
      </button>
      
      <button
        onClick={() => setMode('dark')}
        className={`p-1 rounded-md transition-colors ${
          mode === 'dark' 
            ? 'bg-slate-700 text-blue-400' 
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
        }`}
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}