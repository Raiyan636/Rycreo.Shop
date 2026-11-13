import React from 'react';

export const sanitizeBdPhone = (raw: string): string => {
  let digits = (raw || '').replace(/\D/g, '');
  // If user pasted 8801XXXXXXXXX or +8801XXXXXXXXX, strip leading 88
  if (digits.startsWith('880') && digits.length >= 12) {
    digits = digits.slice(2);
  }
  return digits.slice(0, 11);
};

export const isValidBdPhone = (digits: string): boolean => {
  return /^0\d{10}$/.test((digits || '').trim());
};

interface PhoneInput88Props {
  id?: string;
  name?: string;
  value: string;
  onChange: (digits: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  theme?: 'light' | 'dark';
  dark?: boolean;
  errorText?: string;
  error?: string;
}

export const PhoneInput88: React.FC<PhoneInput88Props> = ({
  id,
  name,
  value,
  onChange,
  placeholder = '01XXXXXXXXX (11 digits)',
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  theme = 'light',
  dark = false,
  errorText,
  error,
}) => {
  const cleanDigits = sanitizeBdPhone(value);
  const hasStartedTyping = cleanDigits.length > 0;
  const startsWithInvalidChar = hasStartedTyping && !cleanDigits.startsWith('0');
  const isCompleteValid = isValidBdPhone(cleanDigits);

  const isDark = dark || theme === 'dark';
  const resolvedError = error || errorText;

  return (
    <div className={`space-y-1 ${className}`}>
      <div
        className={`flex items-stretch rounded-xl border overflow-hidden transition-all ${
          startsWithInvalidChar || resolvedError
            ? 'border-rose-500 ring-1 ring-rose-500/30'
            : isCompleteValid
              ? 'border-emerald-500/80'
              : isDark
                ? 'border-slate-700 focus-within:border-[#38BDF8]'
                : 'border-slate-300 focus-within:border-[#38BDF8]'
        } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <span
          className={`px-3 flex items-center justify-center font-mono font-black text-xs select-none shrink-0 border-r ${
            isDark
              ? 'bg-slate-800 text-sky-400 border-slate-700'
              : 'bg-slate-100 text-slate-800 border-slate-300'
          }`}
          aria-hidden="true"
        >
          +88
        </span>
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="numeric"
          required={required}
          disabled={disabled}
          maxLength={11}
          value={cleanDigits}
          onChange={(e) => onChange(sanitizeBdPhone(e.target.value))}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData('text');
            onChange(sanitizeBdPhone(pasted));
          }}
          placeholder={placeholder}
          className={`flex-1 min-w-0 px-3 py-2.5 text-xs font-bold font-mono outline-none ${
            isDark
              ? 'bg-slate-900 text-white placeholder:text-slate-500'
              : 'bg-white text-slate-900 placeholder:text-slate-400'
          } ${inputClassName}`}
        />
        {hasStartedTyping && (
          <span
            className={`px-2.5 flex items-center text-[10px] font-mono font-bold shrink-0 ${
              isCompleteValid
                ? 'text-emerald-600'
                : 'text-slate-400'
            }`}
          >
            {cleanDigits.length}/11
          </span>
        )}
      </div>
      {startsWithInvalidChar && (
        <p className="text-[10px] font-bold text-rose-600">
          Must start with 0 and be 11 digits (e.g. 017XXXXXXXX)
        </p>
      )}
      {!startsWithInvalidChar && resolvedError && (
        <p className="text-[10px] font-bold text-rose-600">{resolvedError}</p>
      )}
    </div>
  );
};
