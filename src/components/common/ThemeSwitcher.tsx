import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown, Check } from 'lucide-react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';

export const ThemeSwitcher: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    // Attach on the next tick so the click that opened the dropdown does not immediately close it
    const timer = setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const options: Array<{ 
    mode: ThemeMode; 
    label: string; 
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { 
      mode: 'light', 
      label: 'Light Mode', 
      description: 'Glacial high-contrast daylight',
      icon: Sun 
    },
    { 
      mode: 'dark', 
      label: 'Dark Mode', 
      description: 'Deep polar void operations',
      icon: Moon 
    },
    { 
      mode: 'system', 
      label: 'System Default', 
      description: 'Synchronize with OS preference',
      icon: Monitor 
    },
  ];

  const currentIcon = resolvedTheme === 'dark' ? Moon : Sun;
  const CurrentIconComponent = currentIcon;

  return (
    <div className="relative font-mono" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current Theme: ${theme.toUpperCase()} (${resolvedTheme} active). Click to switch theme.`}
        title={`Current Theme: ${theme.toUpperCase()} (${resolvedTheme} active) — Click to open theme options`}
        className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md border text-xs transition-all duration-150 select-none shadow-sm whitespace-nowrap shrink-0 cursor-pointer ${
          isOpen
            ? 'bg-polar-elevated border-polar-cyan/60 ring-1 ring-cyan-500/30 text-polar-cyan'
            : 'bg-polar-card hover:bg-polar-elevated border-polar-border hover:border-polar-border-active text-polar-text-secondary hover:text-polar-text-primary'
        }`}
      >
        <CurrentIconComponent className="w-3.5 h-3.5 text-polar-cyan shrink-0 transition-transform duration-200" />
        <span className="hidden md:inline text-[11px] font-bold uppercase tracking-wider whitespace-nowrap font-mono">
          {theme === 'system' ? 'AUTO' : theme}
        </span>
        <ChevronDown 
          className={`w-3 h-3 text-polar-text-muted transition-transform duration-150 shrink-0 ${
            isOpen ? 'rotate-180 text-polar-cyan' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Display Theme Options"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-2 w-56 rounded-lg bg-polar-surface border border-polar-border-strong shadow-2xl py-1.5 z-50 text-xs font-mono ring-1 ring-black/10 dark:ring-white/10 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1.5 text-[9px] font-bold text-polar-text-muted uppercase tracking-wider border-b border-polar-border mb-1 flex items-center justify-between">
            <span>DISPLAY THEME</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-polar-elevated text-polar-cyan border border-polar-cyan/30 font-bold uppercase">
              ACTIVE: {theme.toUpperCase()}
            </span>
          </div>

          <div className="py-1">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.mode;
              return (
                <button
                  key={opt.mode}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTheme(opt.mode);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-polar-cyan/15 text-polar-cyan font-bold border-l-2 border-polar-cyan'
                      : 'text-polar-text-secondary hover:bg-polar-elevated hover:text-polar-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-polar-cyan' : 'text-polar-text-muted'}`} />
                    <div className="min-w-0">
                      <div className="font-semibold text-xs leading-none">{opt.label}</div>
                      <div className="text-[10px] text-polar-text-muted mt-0.5 font-sans truncate">{opt.description}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-polar-cyan shrink-0 ml-2 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Toggle Helper */}
          <div className="mt-1 pt-1.5 px-3 border-t border-polar-border flex items-center justify-between text-[10px] text-polar-text-muted">
            <span>Effective mode:</span>
            <span className="font-bold text-polar-text-primary uppercase">
              {resolvedTheme === 'dark' ? '🌙 Dark Active' : '☀️ Light Active'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
