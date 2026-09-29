import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
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

  const options: Array<{ mode: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { mode: 'light', label: 'Light Mode', icon: Sun },
    { mode: 'dark', label: 'Dark Mode', icon: Moon },
    { mode: 'system', label: 'System Default', icon: Monitor },
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
          setIsOpen(!isOpen);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Theme: ${theme.toUpperCase()} (Click to change)`}
        title={`Current Theme: ${theme.toUpperCase()} (${resolvedTheme} active)`}
        className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-polar-card border border-polar-border hover:border-polar-border-active text-polar-text-secondary hover:text-polar-text-primary text-xs transition-colors focus-visible:outline-2 focus-visible:outline-sky-500 select-none shadow-sm whitespace-nowrap shrink-0"
      >
        <CurrentIconComponent className="w-3.5 h-3.5 text-polar-cyan shrink-0 transition-transform duration-200" />
        <span className="hidden md:inline text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap font-mono">
          {theme === 'system' ? 'AUTO' : theme}
        </span>
        <ChevronDown className={`w-3 h-3 text-polar-text-muted transition-transform duration-150 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-1.5 w-40 rounded-lg bg-polar-surface border border-polar-border shadow-2xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 font-mono"
        >
          <div className="px-2.5 py-1 text-[9px] font-bold text-polar-text-muted uppercase tracking-wider border-b border-polar-border mb-1">
            Display Theme
          </div>
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setTheme(opt.mode);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors ${
                  isSelected
                    ? 'bg-polar-cyan/15 text-polar-cyan font-bold'
                    : 'text-polar-text-secondary hover:bg-polar-elevated hover:text-polar-text-primary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-polar-cyan' : 'text-polar-text-muted'}`} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-polar-cyan" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
