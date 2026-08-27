import React from 'react';

export interface SafespaceLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showWordmark?: boolean;
  variant?: 'default' | 'white' | 'monochrome';
  className?: string;
  wordmarkClassName?: string;
  markClassName?: string;
  id?: string;
  onClick?: () => void;
}

/**
 * Safespace Unified Brand Logo Component
 * Authoritative Asset: /assets/safespace-logo-blue.png
 * 
 * Preserves the exact organic ribbon geometry and Deep Blue (#123B5D) identity
 * across all public pages, authenticated interfaces, modals, and headers.
 */
export const SafespaceLogo: React.FC<SafespaceLogoProps> = ({
  size = 'md',
  showWordmark = true,
  variant = 'default',
  className = '',
  wordmarkClassName = '',
  markClassName = '',
  id,
  onClick,
}) => {
  // Proportional size definitions preserving natural visual balance
  const sizeMap = {
    xs: {
      mark: 'h-5 w-5',
      text: 'text-sm',
      gap: 'gap-1.5',
    },
    sm: {
      mark: 'h-6 w-6',
      text: 'text-base',
      gap: 'gap-2',
    },
    md: {
      mark: 'h-8 sm:h-9 w-8 sm:w-9',
      text: 'text-lg sm:text-xl',
      gap: 'gap-2.5',
    },
    lg: {
      mark: 'h-10 sm:h-12 w-10 sm:w-12',
      text: 'text-xl sm:text-2xl',
      gap: 'gap-3',
    },
    xl: {
      mark: 'h-14 sm:h-16 w-14 sm:w-16',
      text: 'text-2xl sm:text-3xl',
      gap: 'gap-3.5',
    },
    '2xl': {
      mark: 'h-20 sm:h-24 w-20 sm:w-24',
      text: 'text-3xl sm:text-4xl',
      gap: 'gap-4',
    },
  }[size];

  const markVariantClass = {
    default: '',
    white: 'brightness-0 invert opacity-95',
    monochrome: 'grayscale contrast-125',
  }[variant];

  const textVariantClass = {
    default: 'text-[#123B5D]',
    white: 'text-white',
    monochrome: 'text-[#17212B]',
  }[variant];

  return (
    <div
      id={id}
      onClick={onClick}
      className={`inline-flex items-center ${sizeMap.gap} select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Authoritative Safespace Brand Logo Graphic */}
      <img
        src="/assets/safespace-logo-blue.png"
        onError={(e) => {
          // Fallback to root path if necessary
          const target = e.currentTarget;
          if (target.src.indexOf('/assets/safespace-logo-blue.png') !== -1) {
            target.src = '/safespace-logo-blue.png';
          }
        }}
        alt="Safespace"
        className={`${sizeMap.mark} object-contain shrink-0 ${markVariantClass} ${markClassName}`}
        loading="eager"
        referrerPolicy="no-referrer"
      />

      {/* Primary Brand Wordmark */}
      {showWordmark && (
        <span
          className={`font-sans font-bold tracking-tight leading-none ${sizeMap.text} ${textVariantClass} ${wordmarkClassName}`}
        >
          Safespace
        </span>
      )}
    </div>
  );
};
