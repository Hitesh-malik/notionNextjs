'use client';

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, ThemeMode } from "@/hooks/useTheme";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility

interface ThemeToggleProps {
  initialMode?: ThemeMode;
}

export function ThemeToggle({ initialMode }: ThemeToggleProps) {
  const { mode, setMode } = useTheme();

  return (
    <div className="flex items-center gap-1 bg-card/80 backdrop-blur-sm rounded-full p-1 shadow-sm">
      <ThemeButton
        mode="light"
        currentMode={mode}
        onClick={() => setMode('light')}
        icon={<Sun size={16} />}
      />
      <ThemeButton
        mode="system"
        currentMode={mode}
        onClick={() => setMode('system')}
        icon={<Monitor size={16} />}
      />
      <ThemeButton
        mode="dark"
        currentMode={mode}
        onClick={() => setMode('dark')}
        icon={<Moon size={16} />}
      />
    </div>
  );
}

interface ThemeButtonProps {
  mode: ThemeMode;
  currentMode: ThemeMode;
  onClick: () => void;
  icon: React.ReactNode;
}

function ThemeButton({ mode, currentMode, onClick, icon }: ThemeButtonProps) {
  const isActive = mode === currentMode;

  return (
    <button
      onClick={onClick}
      className={cn(
        "p-1.5 rounded-full transition-all duration-200 text-foreground/60",
        isActive && "bg-primary text-primary-foreground shadow-sm",
        !isActive && "hover:bg-muted hover:text-foreground"
      )}
      title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} theme`}
    >
      {icon}
    </button>
  );
}