'use client';

import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";
import { useDarkMode } from "@/hooks/useDarkMode";

interface DarkModeToggleProps {
  initialDarkMode?: boolean;
}

export function DarkModeToggle({ initialDarkMode }: DarkModeToggleProps) {
  const { darkMode, toggleDarkMode } = useDarkMode(initialDarkMode);

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-4 w-4" />
      <Switch
        checked={darkMode}
        onCheckedChange={toggleDarkMode}
        aria-label="Toggle dark mode"
      />
      <Moon className="h-4 w-4" />
    </div>
  );
}