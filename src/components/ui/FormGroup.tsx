import React from 'react';
import { cn } from '@/lib/utils';

interface FormGroupProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  variant?: 'default' | 'card' | 'section';
  columns?: 1 | 2 | 3;
  spacing?: 'tight' | 'normal' | 'loose';
}

interface FormSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

interface FormRowProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  gap?: 'sm' | 'md' | 'lg';
}

// 表单分组组件
export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  title,
  description,
  className,
  variant = 'default',
  columns = 1,
  spacing = 'normal'
}) => {
  const spacingClasses = {
    tight: 'space-y-3',
    normal: 'space-y-4',
    loose: 'space-y-6'
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  };

  const variantClasses = {
    default: 'space-y-4',
    card: 'bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4',
    section: 'bg-gradient-to-br from-gray-50/50 to-white rounded-lg border border-gray-100 p-5 space-y-4'
  };

  return (
    <div className={cn(variantClasses[variant], className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className={cn(
        'grid gap-4',
        columnClasses[columns],
        spacingClasses[spacing]
      )}>
        {children}
      </div>
    </div>
  );
};

// 表单区域组件（可折叠）
export const FormSection: React.FC<FormSectionProps> = ({
  children,
  title,
  description,
  className,
  collapsible = false,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <div className="flex items-center justify-between">
              <h4 className="text-base font-medium text-gray-900">
                {title}
              </h4>
              {collapsible && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-100"
                >
                  <svg
                    className={cn(
                      'w-4 h-4 transition-transform duration-200',
                      isExpanded ? 'rotate-180' : ''
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          )}
          {description && (
            <p className="text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      
      {(!collapsible || isExpanded) && (
        <div className={cn(
          'space-y-4',
          collapsible && 'animate-in slide-in-from-top-2 duration-200'
        )}>
          {children}
        </div>
      )}
    </div>
  );
};

// 表单行组件（水平布局）
export const FormRow: React.FC<FormRowProps> = ({
  children,
  className,
  align = 'start',
  gap = 'md'
}) => {
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end'
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  return (
    <div className={cn(
      'flex flex-col sm:flex-row',
      alignClasses[align],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

// 表单分隔线
export const FormDivider: React.FC<{ className?: string; label?: string }> = ({ 
  className, 
  label 
}) => {
  if (label) {
    return (
      <div className={cn('relative flex items-center my-6', className)}>
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="px-4 text-sm font-medium text-gray-500 bg-white">
          {label}
        </span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>
    );
  }

  return (
    <hr className={cn('border-gray-200 my-6', className)} />
  );
};

// 表单网格布局
export const FormGrid: React.FC<{
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ children, columns = 2, gap = 'md', className }) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6'
  };

  return (
    <div className={cn(
      'grid',
      columnClasses[columns],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

export default FormGroup;