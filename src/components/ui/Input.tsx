import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#17212B] tracking-normal">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-[#59636B] pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-[#17212B] placeholder-[#7E8890] focus:outline-none focus:ring-2 focus:ring-[#123B5D] focus:border-[#123B5D] transition-colors ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${
            error ? 'border-[#B3261E] focus:ring-[#B3261E]' : 'border-[#E3E2DE] hover:border-[#C5C4BF]'
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 text-[#59636B] flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-[#B3261E]">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#59636B]">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-semibold text-[#17212B]">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-[#17212B] placeholder-[#7E8890] focus:outline-none focus:ring-2 focus:ring-[#123B5D] focus:border-[#123B5D] transition-colors ${
          error ? 'border-[#B3261E] focus:ring-[#B3261E]' : 'border-[#E3E2DE] hover:border-[#C5C4BF]'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-[#B3261E]">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#59636B]">{helperText}</p>
      ) : null}
    </div>
  );
});

Textarea.displayName = 'Textarea';
