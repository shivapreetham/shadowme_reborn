'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

interface ModeToggleProps {
  isExpanded?: boolean;
}

export function ModeToggle({ isExpanded }: ModeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={`
        flex items-center justify-center rounded-md transition-colors
        bg-white shadow-sm hover:bg-gray-100
        ${isExpanded ? 'px-3 py-2 w-full' : 'p-2 w-9 h-9'}
      `}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <div className="flex items-center">
          <Sun size={18} className="text-amber-500" />
          {isExpanded && <span className="ml-2 text-sm font-medium">Light</span>}
        </div>
      ) : (
        <div className="flex items-center">
          <Moon size={18} className="text-indigo-500" />
          {isExpanded && <span className="ml-2 text-sm font-medium">Dark</span>}
        </div>
      )}
    </button>
  );
}