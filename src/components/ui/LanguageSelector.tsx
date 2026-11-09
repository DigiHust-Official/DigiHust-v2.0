import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Globe, Languages } from 'lucide-react';
import { LANGUAGES, LanguageOption } from '../../lib/i18n';
import { useLanguage } from '../../context/LanguageContext';

export const FlagIcon: React.FC<{ code: string; className?: string }> = ({ code, className = "w-4 h-3" }) => {
  switch (code) {
    case 'en':
      return (
        <svg viewBox="0 0 60 30" className={`${className} rounded-[2px] shadow-sm flex-shrink-0`}>
          <clipPath id="s_flag"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
          <clipPath id="t_flag"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
          <g clipPath="url(#s_flag)">
            <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
            <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t_flag)" stroke="#C8102E" strokeWidth="4"/>
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
          </g>
        </svg>
      );
    case 'de':
      return (
        <svg viewBox="0 0 5 3" className={`${className} rounded-[2px] shadow-sm flex-shrink-0`}>
          <rect width="5" height="3" y="0" x="0" fill="#000"/>
          <rect width="5" height="2" y="1" x="0" fill="#D00"/>
          <rect width="5" height="1" y="2" x="0" fill="#FFCE00"/>
        </svg>
      );
    case 'ar':
      return (
        <svg viewBox="0 0 12 6" className={`${className} rounded-[2px] shadow-sm flex-shrink-0`}>
          <rect width="12" height="2" fill="#00732f"/>
          <rect y="2" width="12" height="2" fill="#ffffff"/>
          <rect y="4" width="12" height="2" fill="#000000"/>
          <path d="M 0,0 4,3 0,6 Z" fill="#ff0000"/>
        </svg>
      );
    case 'es':
      return (
        <svg viewBox="0 0 3 2" className={`${className} rounded-[2px] shadow-sm flex-shrink-0`}>
          <rect width="3" height="2" fill="#c60b1e"/>
          <rect width="3" height="1" y="0.5" fill="#ffc400"/>
        </svg>
      );
    default:
      return <Globe className="w-3.5 h-3.5 text-[var(--brand-teal)]" />;
  }
};

export const LanguageSelector: React.FC<{ className?: string; dropdownAlign?: 'left' | 'right' }> = ({
  className = '',
  dropdownAlign = 'right',
}) => {
  const { language, setLanguage, activeOption } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Trigger: icon-only, 36x36, border-radius 999px, 18px Languages icon, strokeWidth 1.75 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Language"
        title={activeOption?.label || 'Language'}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="w-[36px] h-[36px] rounded-full flex items-center justify-center border-none bg-transparent text-[rgba(10,31,43,0.62)] dark:text-[rgba(243,246,250,0.66)] hover:text-[#0A1F2B] dark:hover:text-[#FFFFFF] hover:bg-[rgba(255,255,255,0.55)] dark:hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--dh-focus-ring)] select-none"
      >
        <Languages className="w-[18px] h-[18px]" strokeWidth={1.75} aria-hidden="true" />
      </button>

      {/* Dropdown: bg-surface, border-subtle, radius 12px, 14px items, check icon */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Select Language"
          className={`absolute ${
            dropdownAlign === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-48 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150`}
        >
          {LANGUAGES.map((lang: LanguageOption) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] font-medium transition-colors cursor-pointer border-none text-left select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-teal)] ${
                  isSelected
                    ? 'bg-[var(--brand-teal-subtle)] text-[var(--brand-teal-text)] font-semibold'
                    : 'text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <span>{lang.label}</span>
                {isSelected && (
                  <Check className="w-4 h-4 text-[var(--brand-teal)] shrink-0" strokeWidth={2.5} aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
