import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Eye, EyeOff, Info } from 'lucide-react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'date' | 'textarea' | 'select';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  success?: string;
  helperText?: string;
  icon?: React.ReactNode;
  options?: { value: string; label: string }[];
  rows?: number;
  className?: string;
  inputClassName?: string;
  maxLength?: number;
  showCharCount?: boolean;
  validate?: (value: string | number) => string | null;
  validateOnChange?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error,
  success,
  helperText,
  icon,
  options,
  rows = 3,
  className,
  inputClassName,
  maxLength,
  showCharCount = false,
  validate,
  validateOnChange = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // 实时验证
  useEffect(() => {
    if (validateOnChange && validate && value) {
      const error = validate(value);
      setValidationError(error);
    }
  }, [value, validate, validateOnChange]);

  const currentError = error || validationError;
  const hasValue = value !== '' && value !== null && value !== undefined;
  const isValid = hasValue && !currentError;
  const charCount = typeof value === 'string' ? value.length : 0;
  const inputType = type === 'password' && showPassword ? 'text' : type;
  const baseInputClasses = cn(
    'w-full px-4 py-3 border rounded-xl transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:border-transparent',
    'placeholder:text-gray-400 text-gray-900',
    'shadow-sm hover:shadow-md focus:shadow-lg',
    {
      'border-red-300 bg-red-50/50 focus:ring-red-500/30 focus:bg-red-50': currentError,
      'border-green-300 bg-green-50/30 focus:ring-green-500/30': isValid,
      'border-blue-300 bg-blue-50/20 focus:ring-blue-500/30': isFocused && !currentError && !isValid,
      'border-gray-300 bg-white hover:border-gray-400': !currentError && !isValid && !isFocused && !disabled,
      'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60': disabled,
      'pl-12': icon,
      'pr-12': type === 'password' || showCharCount,
    },
    inputClassName
  );

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setIsFocused(false);
    if (validate && value) {
      const error = validate(value);
      setValidationError(error);
    }
    onBlur?.(e);
  };

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <div className="relative">
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            className={cn(
              baseInputClasses,
              'form-input-enhanced resize-vertical min-h-[100px]'
            )}
          />
          {showCharCount && maxLength && (
            <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
              {charCount}/{maxLength}
            </div>
          )}
        </div>
      );
    }

    if (type === 'select' && options) {
      return (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          disabled={disabled}
          className={cn(
            baseInputClasses,
            'form-input-enhanced cursor-pointer'
          )}
        >
          <option value="" className="text-gray-400">{placeholder || `选择${label}`}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-gray-900">
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          className={cn(
            baseInputClasses,
            'form-input-enhanced'
          )}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
        {showCharCount && maxLength && type !== 'password' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
            {charCount}/{maxLength}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('form-field space-y-3', className)}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={name}
          className={cn(
            'form-label-enhanced block text-sm font-semibold transition-colors duration-200',
            {
              'text-red-700': currentError,
              'text-green-700': isValid,
              'text-blue-700': isFocused && !currentError && !isValid,
              'text-gray-800': !currentError && !isValid && !isFocused && !disabled,
              'text-gray-500': disabled,
            }
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1 font-bold">*</span>}
        </label>
        {showCharCount && maxLength && (
          <span className={cn(
            'text-xs font-medium transition-colors duration-200',
            {
              'text-red-500': charCount > maxLength * 0.9,
              'text-yellow-500': charCount > maxLength * 0.7,
              'text-gray-500': charCount <= maxLength * 0.7,
            }
          )}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
      
      <div className="relative">
        {icon && (
          <div className={cn(
            'absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200',
            {
              'text-red-500': currentError,
              'text-green-500': isValid,
              'text-blue-500': isFocused && !currentError && !isValid,
              'text-gray-400': !currentError && !isValid && !isFocused,
            }
          )}>
            {icon}
          </div>
        )}
        {renderInput()}
      </div>
      
      {/* 错误信息 */}
      {currentError && (
        <div className="form-error flex items-start gap-3 p-3 bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200 rounded-xl animate-in slide-in-from-top-2 duration-200">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-700 font-medium">{currentError}</p>
          </div>
        </div>
      )}
      
      {/* 成功信息 */}
      {(success || (isValid && !currentError)) && (
        <div className="form-success flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-green-50/50 border border-green-200 rounded-xl animate-in slide-in-from-top-2 duration-200">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-green-700 font-medium">{success || '输入有效'}</p>
          </div>
        </div>
      )}
      
      {/* 帮助文本 */}
      {helperText && !currentError && (
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">{helperText}</p>
        </div>
      )}
    </div>
  );
};

// 预设验证函数
export const validators = {
  email: (value: string | number): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof value === 'string' && value && !emailRegex.test(value)) {
      return '请输入有效的邮箱地址';
    }
    return null;
  },
  
  required: (value: string | number): string | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return '此字段为必填项';
    }
    return null;
  },
  
  minLength: (min: number) => (value: string | number): string | null => {
    if (typeof value === 'string' && value.length < min) {
      return `至少需要 ${min} 个字符`;
    }
    return null;
  },
  
  maxLength: (max: number) => (value: string | number): string | null => {
    if (typeof value === 'string' && value.length > max) {
      return `不能超过 ${max} 个字符`;
    }
    return null;
  },
  
  url: (value: string | number): string | null => {
    const urlRegex = /^https?:\/\/.+/;
    if (typeof value === 'string' && value && !urlRegex.test(value)) {
      return '请输入有效的URL地址';
    }
    return null;
  },
  
  phone: (value: string | number): string | null => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (typeof value === 'string' && value && !phoneRegex.test(value)) {
      return '请输入有效的手机号码';
    }
    return null;
  },
};

// 组合验证器
export const combineValidators = (...validators: Array<(value: string | number) => string | null>) => {
  return (value: string | number): string | null => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };
};

// 便捷组件
export const TextField: React.FC<Omit<FormFieldProps, 'type'>> = (props) => (
  <FormField {...props} type="text" />
);

export const EmailField: React.FC<Omit<FormFieldProps, 'type' | 'validate'>> = (props) => (
  <FormField {...props} type="email" validate={validators.email} validateOnChange />
);

export const PasswordField: React.FC<Omit<FormFieldProps, 'type'>> = (props) => (
  <FormField {...props} type="password" />
);

export const TextAreaField: React.FC<Omit<FormFieldProps, 'type'>> = (props) => (
  <FormField {...props} type="textarea" />
);

export const SelectField: React.FC<Omit<FormFieldProps, 'type'>> = (props) => (
  <FormField {...props} type="select" />
);

export default FormField;