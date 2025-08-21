import { useState, useCallback, useMemo } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string | number) => string | null;
  email?: boolean;
  url?: boolean;
  phone?: boolean;
  number?: boolean;
  min?: number;
  max?: number;
}

export interface FieldConfig {
  [fieldName: string]: ValidationRule;
}

export interface FormErrors {
  [fieldName: string]: string;
}

export interface FormTouched {
  [fieldName: string]: boolean;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

const validateField = (value: string | number, rules: ValidationRule): string | null => {
  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return '此字段为必填项';
  }

  // Skip other validations if value is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  const stringValue = String(value);

  // Length validations
  if (rules.minLength && stringValue.length < rules.minLength) {
    return `最少需要 ${rules.minLength} 个字符`;
  }

  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return `最多允许 ${rules.maxLength} 个字符`;
  }

  // Email validation
  if (rules.email && !emailRegex.test(stringValue)) {
    return '请输入有效的邮箱地址';
  }

  // URL validation
  if (rules.url && !urlRegex.test(stringValue)) {
    return '请输入有效的URL地址';
  }

  // Phone validation
  if (rules.phone && !phoneRegex.test(stringValue)) {
    return '请输入有效的手机号码';
  }

  // Number validation
  if (rules.number) {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return '请输入有效的数字';
    }

    if (rules.min !== undefined && numValue < rules.min) {
      return `数值不能小于 ${rules.min}`;
    }

    if (rules.max !== undefined && numValue > rules.max) {
      return `数值不能大于 ${rules.max}`;
    }
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return '输入格式不正确';
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

export const useFormValidation = <T extends Record<string, string | number | boolean>>(
  initialValues: T,
  validationConfig: FieldConfig
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateSingleField = useCallback(
    (fieldName: string, value: string | number): string | null => {
      const rules = validationConfig[fieldName];
      if (!rules) return null;
      return validateField(value, rules);
    },
    [validationConfig]
  );

  // Validate all fields
  const validateAllFields = useCallback(
    (formValues: T = values): Record<string, string | null> => {
      const newErrors: FormErrors = {};
      
      Object.keys(validationConfig).forEach((fieldName) => {
        const error = validateSingleField(fieldName, formValues[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
        }
      });
      
      return newErrors;
    },
    [values, validationConfig, validateSingleField]
  );

  // Set field value and validate
  const setFieldValue = useCallback(
    (fieldName: string, value: string | number) => {
      setValues((prev) => ({ ...prev, [fieldName]: value }));
      
      // Validate field if it has been touched
      if (touched[fieldName]) {
        const error = validateSingleField(fieldName, value);
        setErrors((prev) => ({
          ...prev,
          [fieldName]: error || '',
        }));
      }
    },
    [touched, validateSingleField]
  );

  // Set field as touched and validate
  const setFieldTouched = useCallback(
    (fieldName: string, isTouched: boolean = true) => {
      setTouched((prev) => ({ ...prev, [fieldName]: isTouched }));
      
      if (isTouched) {
        const error = validateSingleField(fieldName, values[fieldName]);
        setErrors((prev) => ({
          ...prev,
          [fieldName]: error || '',
        }));
      }
    },
    [values, validateSingleField]
  );

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
      setFieldValue(name, finalValue);
    },
    [setFieldValue]
  );

  // Handle input blur
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      setFieldTouched(name, true);
    },
    [setFieldTouched]
  );

  // Reset form
  const resetForm = useCallback(
    (newValues?: Partial<T>) => {
      setValues(newValues ? { ...initialValues, ...newValues } : initialValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    },
    [initialValues]
  );

  // Submit form
  const handleSubmit = useCallback(
    async (onSubmit: (values: T) => Promise<void> | void) => {
      setIsSubmitting(true);
      
      // Mark all fields as touched
      const allTouched: FormTouched = {};
      Object.keys(validationConfig).forEach((fieldName) => {
        allTouched[fieldName] = true;
      });
      setTouched(allTouched);
      
      // Validate all fields
      const formErrors = validateAllFields();
      setErrors(formErrors);
      
      // If no errors, submit the form
      if (Object.keys(formErrors).length === 0) {
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }
      
      setIsSubmitting(false);
    },
    [values, validationConfig, validateAllFields]
  );

  // Check if form is valid
  const isValid = useMemo(() => {
    const formErrors = validateAllFields();
    return Object.keys(formErrors).length === 0;
  }, [validateAllFields]);

  // Check if form has been modified
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    setFieldValue,
    setFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    validateField: validateSingleField,
    validateAllFields,
  };
};

export default useFormValidation;