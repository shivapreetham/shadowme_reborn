'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import clsx from 'clsx';

interface ModeToggleProps {
  isExpanded?: boolean;
}

export function ModeToggle({ isExpanded }: ModeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={clsx(
        'flex items-center gap-x-2 rounded-md text-sm font-medium transition-all duration-200',
        isExpanded ? 'p-2.5 justify-start w-full' : 'p-3 justify-center',
        'bg-primary text-primary-foreground hover:brightness-110'
      )}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <>
          <Sun size={20} className="shrink-0" aria-hidden="true" />
          {isExpanded && (
            <span className="whitespace-nowrap font-medium">Light Mode</span>
          )}
        </>
      ) : (
        <>
          <Moon size={20} className="shrink-0" aria-hidden="true" />
          {isExpanded && (
            <span className="whitespace-nowrap font-medium">Dark Mode</span>
          )}
        </>
      )}
    </button>
  );
}