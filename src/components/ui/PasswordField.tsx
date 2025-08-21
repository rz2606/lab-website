import React, { useState } from 'react'
import { Eye, EyeOff, LucideIcon } from 'lucide-react'

interface PasswordFieldProps {
  label: string
  name: string
  value: string
  onChange: (name: string, value: string) => void
  error?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  leftIcon?: LucideIcon
  className?: string
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  leftIcon: LeftIcon,
  className = ''
}) => {
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.value)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className={`form-field ${className}`}>
      <label 
        htmlFor={name} 
        className={`form-label ${required ? 'required' : ''}`}
      >
        {label}
      </label>
      
      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LeftIcon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        
        <input
          type={showPassword ? 'text' : 'password'}
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            form-input
            ${LeftIcon ? 'pl-10' : 'pl-3'}
            pr-10
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            ${value && !error ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : ''}
          `}
        />
        
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
          onClick={togglePasswordVisibility}
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>
      
      {error && (
        <div className="form-error">
          {error}
        </div>
      )}
    </div>
  )
}

export default PasswordField